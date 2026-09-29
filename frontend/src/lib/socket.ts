'use client';

import { io, Socket } from 'socket.io-client';
import { getCookie } from './cookies';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = getCookie('accessToken');
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: {
        token: token || undefined,
      },
    });
  }
  return socket;
};

export const connectSocket = (): void => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const emitSocketEvent = (event: string, data: any): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit(event, data);
  }
};