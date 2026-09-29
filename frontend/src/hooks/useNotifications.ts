// src/hooks/useNotifications.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

// ============================================================
// TYPES
// ============================================================
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  avatar?: string;
}

interface UseNotificationsOptions {
  fetcher?: () => Promise<unknown>;
  pollInterval?: number;
  eventName?: string;
}

// ============================================================
// HELPER — Normalise en tableau
// ============================================================
function normalizeToArray(raw: unknown): Notification[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as Notification[];
  if (typeof raw === 'object') {
    const obj = raw as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.notifications)) return obj.notifications;
    if (Array.isArray(obj.items)) return obj.items;
    if (obj.data && Array.isArray(obj.data.notifications)) {
      return obj.data.notifications;
    }
    if (obj.data && Array.isArray(obj.data.items)) {
      return obj.data.items;
    }
  }
  return [];
}

// ============================================================
// HOOK — ORDRE DES HOOKS STABLE (ne jamais modifier)
// ============================================================
export function useNotifications({
  fetcher,
  pollInterval = 30_000,
  eventName = 'notification',
}: UseNotificationsOptions = {}) {
  // ═══════════════════════════════════════════════════════════
  // ORDRE FIXE DES HOOKS — NE PAS INTERCALER DE HOOK ICI
  // ═══════════════════════════════════════════════════════════

  // 1. Hook du SocketContext (retourne toujours 1 useContext)
  const socketCtx = useSocket();

  // 2. États (toujours dans le même ordre)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Refs
  const isMountedRef = useRef(true);

  // 4. Effet : gestion du montage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 5. Effet : chargement initial REST
  useEffect(() => {
    if (!fetcher) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const raw = await fetcher();
        const data = normalizeToArray(raw);
        if (!cancelled && isMountedRef.current) {
          setNotifications(data);
        }
      } catch (err: any) {
        if (!cancelled && isMountedRef.current) {
          setError(err?.message || 'Erreur');
          setNotifications([]);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  // 6. Effet : écoute Socket.IO
  //    ⚠️ Extrait `on`, `off`, `isConnected` AVANT pour stabiliser les deps
  const { on, off, isConnected } = socketCtx;

  useEffect(() => {
    if (!isConnected) return;

    const handleNew = (n: Notification) => {
      if (!n?.id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        if (arr.some((x) => x.id === n.id)) return arr;
        return [n, ...arr];
      });
    };

    const handleUpdate = (n: Partial<Notification> & { id: string }) => {
      if (!n?.id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map((x) => (x.id === n.id ? { ...x, ...n } : x));
      });
    };

    const handleDelete = ({ id }: { id: string }) => {
      if (!id) return;
      setNotifications((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter((x) => x.id !== id);
      });
    };

    // Écoute plusieurs alias
    on(eventName, handleNew);
    on('notification', handleNew);
    on('notification:receive', handleNew);
    on('new-notification', handleNew);
    on(`${eventName}:update`, handleUpdate);
    on('notification:updated', handleUpdate);
    on(`${eventName}:delete`, handleDelete);
    on('notification:delete', handleDelete);

    return () => {
      off(eventName, handleNew);
      off('notification', handleNew);
      off('notification:receive', handleNew);
      off('new-notification', handleNew);
      off(`${eventName}:update`, handleUpdate);
      off('notification:updated', handleUpdate);
      off(`${eventName}:delete`, handleDelete);
      off('notification:delete', handleDelete);
    };
  }, [isConnected, on, off, eventName]);

  // 7. Effet : polling fallback
  useEffect(() => {
    if (isConnected || !fetcher || pollInterval <= 0) return;

    const interval = setInterval(async () => {
      try {
        const raw = await fetcher();
        const data = normalizeToArray(raw);
        if (isMountedRef.current) setNotifications(data);
      } catch {
        /* ignore */
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [isConnected, fetcher, pollInterval]);

  // 8. Callbacks (ordre stable)
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true }))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).filter((n) => n.id !== id)
    );
  }, []);

  const refetch = useCallback(async () => {
    if (!fetcher) return;
    setLoading(true);
    try {
      const raw = await fetcher();
      setNotifications(normalizeToArray(raw));
    } catch (err) {
      console.error('[useNotifications] refetch error:', err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [fetcher]);

  // ═══════════════════════════════════════════════════════════
  // PAS DE HOOK APRÈS CETTE LIGNE
  // ═══════════════════════════════════════════════════════════

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  return {
    notifications: safeNotifications,
    loading,
    error,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    refetch,
  };
}