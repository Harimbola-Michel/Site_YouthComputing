import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';
import { socketEvents } from '../socket.events';
import { StatsService } from '@services/stats.service';

const statsService = new StatsService();

export const handleAdmin = (io: Server, socket: Socket): void => {
  // Admin broadcast
  socket.on(socketEvents.ADMIN_BROADCAST, (data) => {
    try {
      const { message, type, target, userIds } = data;

      if (!message) {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Message is required',
        });
        return;
      }

      const broadcastData = {
        message,
        type: type || 'info',
        timestamp: new Date(),
        admin: {
          id: socket.data.userId,
          name: `${socket.data.firstName} ${socket.data.lastName}`,
        },
      };

      if (target === 'all' || !target) {
        io.emit(socketEvents.BROADCAST_RECEIVE, broadcastData);
      } else if (target === 'admin') {
        io.to('admin').emit(socketEvents.BROADCAST_RECEIVE, broadcastData);
      } else if (target === 'specific' && userIds) {
        userIds.forEach((userId: string) => {
          io.to(`user:${userId}`).emit(socketEvents.BROADCAST_RECEIVE, broadcastData);
        });
      }

      logger.info(`Admin broadcast from ${socket.data.userId}: ${message}`);
    } catch (error) {
      logger.error('Admin broadcast error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to broadcast',
      });
    }
  });

  // Admin stats
  socket.on(socketEvents.ADMIN_STATS, async () => {
    try {
      const stats = await statsService.getGlobalStats();
      socket.emit(socketEvents.ADMIN_STATS, stats);
    } catch (error) {
      logger.error('Admin stats error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to get stats',
      });
    }
  });

  // Admin notification (push to all users)
  socket.on(socketEvents.ADMIN_NOTIFICATION, (data) => {
    try {
      const { title, message, link } = data;

      if (!title || !message) {
        socket.emit(socketEvents.ADMIN_ERROR, {
          message: 'Title and message are required',
        });
        return;
      }

      const notificationData = {
        title,
        message,
        link: link || null,
        type: 'SYSTEM',
        timestamp: new Date(),
        fromAdmin: {
          id: socket.data.userId,
          name: `${socket.data.firstName} ${socket.data.lastName}`,
        },
      };

      // Send to all connected users
      io.emit(socketEvents.NOTIFICATION_RECEIVE, notificationData);
    } catch (error) {
      logger.error('Admin notification error:', error);
      socket.emit(socketEvents.ADMIN_ERROR, {
        message: 'Failed to send notification',
      });
    }
  });
};