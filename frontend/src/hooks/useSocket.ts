// src/hooks/useSocket.ts
'use client';

import {
  useContextSocket,
  type SocketContextType,
} from '@/contexts/SocketContext';

// ============================================================
// RÉ-EXPORTS — UNIQUEMENT ce qu'on ne redéfinit PAS localement
// ============================================================
// ✅ On ré-exporte le hook bas niveau du context sous un autre nom
export { useSocketContext, useContextSocket } from '@/contexts/SocketContext';

// ✅ On ré-exporte les types (pas de collision possible)
export type {
  SocketContextType,
  SocketStatus,
} from '@/contexts/SocketContext';

// ============================================================
// API UNIFIÉE — définie UNE SEULE FOIS ici
// ============================================================
export interface UseSocketReturn {
  socket: SocketContextType['socket'];
  isConnected: boolean;
  isLoading: boolean;
  connected: boolean;
  connecting: boolean;
  status:
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'disabled';
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (data: any) => void) => void;
  off: (event: string, cb?: (data: any) => void) => void;
  reconnect: () => void;
}

// ============================================================
// FALLBACK (jamais de crash)
// ============================================================
const FALLBACK: UseSocketReturn = {
  socket: null,
  isConnected: false,
  isLoading: false,
  connected: false,
  connecting: false,
  status: 'disabled',
  error: null,
  connect: () => {},
  disconnect: () => {},
  emit: () => {},
  on: () => {},
  off: () => {},
  reconnect: () => {},
};

// ============================================================
// HOOK PRINCIPAL — point d'entrée unique
// ============================================================
export function useSocket(): UseSocketReturn {
  const ctx = useContextSocket();

  if (!ctx) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[useSocket] SocketProvider introuvable — fallback inactif.'
      );
    }
    return FALLBACK;
  }

  // Dérivation du statut
  let status: UseSocketReturn['status'] = 'idle';
  if ('status' in ctx && ctx.status) {
    status = ctx.status as UseSocketReturn['status'];
  } else if (ctx.isConnected) {
    status = 'connected';
  } else if (ctx.isLoading) {
    status = 'connecting';
  } else {
    status = 'disconnected';
  }

  return {
    socket: ctx.socket,
    isConnected: ctx.isConnected,
    isLoading: ctx.isLoading,
    connected: ctx.isConnected,
    connecting: ctx.isLoading,
    status,
    error: ctx.error ?? null,
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    emit: ctx.emit,
    on: ctx.on,
    off: ctx.off,
    reconnect: ctx.connect,
  };
}

// ============================================================
// HOOK OPTIONNEL
// ============================================================
export function useOptionalSocket(): SocketContextType | undefined {
  return useContextSocket();
}