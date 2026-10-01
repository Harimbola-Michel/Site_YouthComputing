'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import type { NotificationPayload } from '@/types';
import toast from 'react-hot-toast';
import { SOCKET_URL } from '@/lib/env';

// ============================================================
// TYPES
// ============================================================
export type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'disabled';

export interface SocketContextType {
  socket: Socket | null;
  status: SocketStatus;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

// ============================================================
// CONFIG — Safe defaults
// ============================================================
const ENABLE_SOCKET = process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'false';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;
const CONNECTION_TIMEOUT = 8000;

// Debug conditionnel (jamais en prod)
const DEBUG =
  process.env.NEXT_PUBLIC_SOCKET_DEBUG === 'true' &&
  process.env.NODE_ENV !== 'production';

const log = (...args: any[]) => {
  if (DEBUG) console.log('[Socket]', ...args);
};

const logError = (...args: any[]) => {
  if (DEBUG) console.error('[Socket]', ...args);
};

// ============================================================
// CONTEXT
// ============================================================
const SocketContext = createContext<SocketContextType | undefined>(undefined);
SocketContext.displayName = 'SocketContext';

// ============================================================
// PROVIDER
// ============================================================
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated, tokens } = useAuth();
  const { addNotification, setUnreadCount, markAsRead } =
    useNotificationStore();

  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);
  const didShowErrorToast = useRef(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>(
    ENABLE_SOCKET ? 'idle' : 'disabled'
  );
  const [error, setError] = useState<Error | null>(null);

  // ─── Cleanup unmount ───
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ============================================================
  // CONNECT — Safe
  // ============================================================
  const connect = useCallback(() => {
    // 1) Socket désactivé
    if (!ENABLE_SOCKET) {
      setStatus('disabled');
      return;
    }

    // 2) Pas authentifié → ne rien faire
    if (!isAuthenticated || !tokens?.accessToken) {
      setStatus('idle');
      return;
    }

    // 3) Déjà connecté
    if (socketRef.current?.connected) {
      setStatus('connected');
      return;
    }

    // 4) Nettoyer l'ancienne instance
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // 5) Créer la nouvelle
    try {
      setStatus('connecting');
      setError(null);

      log('Connexion à', SOCKET_URL);

      const newSocket = io(SOCKET_URL, {
        auth: { token: tokens.accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 10000,
        timeout: CONNECTION_TIMEOUT,
        autoConnect: true,
        withCredentials: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // ─── Handlers ───
      const onConnect = () => {
        if (!isMounted.current) return;
        log('✅ Connecté');
        setStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        didShowErrorToast.current = false;

        // Rejoindre les rooms
        if (user?.id) newSocket.emit('room:join', { room: `user:${user.id}` });
        if (user?.role)
          newSocket.emit('room:join', { room: `role:${user.role}` });
      };

      const onDisconnect = (reason: string) => {
        if (!isMounted.current) return;
        log('🔌 Déconnecté:', reason);
        setStatus('disconnected');

        // Reconnexion manuelle si serveur nous a kick
        if (reason === 'io server disconnect') {
          log('Reconnexion forcée…');
          setTimeout(() => newSocket.connect(), 1000);
        }
      };

      const onConnectError = (err: Error) => {
        if (!isMounted.current) return;
        reconnectAttempts.current += 1;
        logError('❌ Erreur connexion:', err.message);

        setError(err);
        setStatus('error');

        // Toast seulement 1 fois (évite spam)
        if (
          reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS &&
          !didShowErrorToast.current
        ) {
          didShowErrorToast.current = true;
          toast.error(
            'Connexion temps réel indisponible. Mode dégradé activé.',
            { duration: 5000, id: 'socket-error' }
          );
        }
      };

      const onReconnectAttempt = () => {
        if (!isMounted.current) return;
        setStatus('connecting');
      };

      const onReconnect = () => {
        if (!isMounted.current) return;
        log('🔄 Reconnecté');
        setStatus('connected');
        setError(null);
        reconnectAttempts.current = 0;
        didShowErrorToast.current = false;
      };

      newSocket.on('connect', onConnect);
      newSocket.on('disconnect', onDisconnect);
      newSocket.on('connect_error', onConnectError);
      newSocket.io.on('reconnect_attempt', onReconnectAttempt);
      newSocket.io.on('reconnect', onReconnect);
      newSocket.io.on('reconnect_failed', () => {
        logError('Reconnexion échouée définitivement');
        setStatus('error');
      });

      // ─── Notifications ───
      newSocket.on('notification:receive', (payload: NotificationPayload) => {
        if (!isMounted.current) return;
        addNotification(payload);
        showNotificationToast(payload);
      });

      newSocket.on('notification:count', (data: { unread: number }) => {
        if (!isMounted.current) return;
        setUnreadCount(data.unread);
      });

      newSocket.on(
        'notification:updated',
        (data: { id: string; isRead: boolean }) => {
          if (!isMounted.current) return;
          if (data.isRead) markAsRead(data.id);
        }
      );

      newSocket.on('broadcast:receive', (data: { message: string }) => {
        if (!isMounted.current) return;
        toast.info(data.message, { duration: 8000 });
      });
    } catch (err) {
      logError('Erreur initialisation:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [isAuthenticated, tokens?.accessToken, user?.id, user?.role, addNotification, setUnreadCount, markAsRead]);

  // ============================================================
  // DISCONNECT — Safe
  // ============================================================
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.io.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (isMounted.current) {
      setSocket(null);
      setStatus(ENABLE_SOCKET ? 'idle' : 'disabled');
      setError(null);
    }
  }, []);

  // ============================================================
  // WRAPPERS — Safe
  // ============================================================
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else if (DEBUG) {
      log('emit ignoré (non connecté):', event);
    }
  }, []);

  const on = useCallback((event: string, cb: (data: any) => void) => {
    if (socketRef.current) socketRef.current.on(event, cb);
  }, []);

  const off = useCallback((event: string, cb?: (data: any) => void) => {
    if (socketRef.current) {
      if (cb) socketRef.current.off(event, cb);
      else socketRef.current.off(event);
    }
  }, []);

  // ============================================================
  // AUTO-CONNECT / AUTO-DISCONNECT
  // ============================================================
  useEffect(() => {
    // Petit délai pour éviter les races au mount
    const timeout = setTimeout(() => {
      if (isAuthenticated && tokens?.accessToken && ENABLE_SOCKET) {
        connect();
      } else {
        disconnect();
      }
    }, 100);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokens?.accessToken]);

  // ─── Cleanup définitif au démontage ───
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // VALUE (memoïsée)
  // ============================================================
  const value = useMemo<SocketContextType>(
    () => ({
      socket,
      status,
      isConnected: status === 'connected',
      isLoading: status === 'connecting',
      error,
      connect,
      disconnect,
      emit,
      on,
      off,
    }),
    [socket, status, error, connect, disconnect, emit, on, off]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// ============================================================
// TOAST NOTIFICATION — Extraite pour la propreté
// ============================================================
function showNotificationToast(payload: NotificationPayload) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-black/5 dark:bg-gray-800`}
      >
        <div className="w-0 flex-1 p-4">
          <div className="flex items-start">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10">
              <span className="text-lg text-secondary">🔔</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {payload.title || 'Nouvelle notification'}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {payload.message}
              </p>
              {payload.link && (
                <a
                  href={payload.link}
                  className="mt-2 text-sm font-medium text-secondary hover:text-secondary/80"
                  onClick={() => toast.dismiss(t.id)}
                >
                  Voir →
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex w-full items-center justify-center rounded-r-lg p-4 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-500 dark:hover:bg-gray-700"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 5000, position: 'bottom-right' }
  );

  // Son (silencieux si bloqué par le navigateur)
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {}
}

// ============================================================
// HOOKS EXPORTÉS
// ============================================================

/** Hook interne — retourne le contexte brut (peut être undefined) */
export function useContextSocket(): SocketContextType | undefined {
  return useContext(SocketContext);
}

/**
 * Hook public — NE THROW JAMAIS.
 * Retourne un fallback inactif si le provider est absent,
 * pour ne JAMAIS faire crasher l'app.
 */
export function useSocket(): SocketContextType {
  const ctx = useContext(SocketContext);

  if (!ctx) {
    if (DEBUG) {
      console.warn('[useSocket] SocketProvider absent → fallback inactif');
    }
    return FALLBACK_CONTEXT;
  }
  return ctx;
}

export const useSocketContext = useSocket;

// ============================================================
// FALLBACK (jamais de crash)
// ============================================================
const FALLBACK_CONTEXT: SocketContextType = {
  socket: null,
  status: 'disabled',
  isConnected: false,
  isLoading: false,
  error: null,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
};

export default SocketContext;