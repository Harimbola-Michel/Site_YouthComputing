import { Notification } from '@prisma/client';
import { getIO } from './socket.server';

/**
 * Émission temps réel alignée sur socket.server.ts :
 * - room: user:{userId}
 * - events: notification:receive, notification:count
 */
export const notificationWebSocket = {
  sendNotification: (userId: string, notification: Notification) => {
    const io = getIO();
    if (!io) {
      console.warn('WebSocket non initialisé, notification non envoyée');
      return;
    }
    io.to(`user:${userId}`).emit('notification:receive', notification);
  },

  sendUnreadCountUpdate: (userId: string, count: number) => {
    const io = getIO();
    if (!io) return;
    io.to(`user:${userId}`).emit('notification:count', { unread: count });
  },
};
