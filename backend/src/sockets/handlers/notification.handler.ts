import { Server, Socket } from 'socket.io';
import { logger } from '@config/logger';
import { socketEvents } from '../socket.events';
import { NotificationService } from '@services/notification.service';
import prisma from '../../../prisma/client';

const notificationService = new NotificationService();

export const handleNotification = (io: Server, socket: Socket): void => {
  // Send notification to specific user
  socket.on(socketEvents.NOTIFICATION_SEND, async (data) => {
    try {
      const { userId, notification } = data;

      if (!userId || !notification) {
        socket.emit(socketEvents.NOTIFICATION_ERROR, {
          message: 'Missing required fields',
        });
        return;
      }

      // Save notification to database
      const savedNotification = await notificationService.createNotification({
        userId,
        type: notification.type || 'SYSTEM',
        title: notification.title,
        message: notification.message,
        link: notification.link,
      });

      // Emit to specific user
      io.to(`user:${userId}`).emit(socketEvents.NOTIFICATION_RECEIVE, savedNotification);

      // Acknowledge
      socket.emit('notification:ack', { success: true, id: savedNotification.id });
    } catch (error) {
      logger.error('Notification send error:', error);
      socket.emit(socketEvents.NOTIFICATION_ERROR, {
        message: 'Failed to send notification',
      });
    }
  });

  // Mark notification as read
  socket.on(socketEvents.NOTIFICATION_READ, async (data) => {
    try {
      const { notificationId } = data;

      if (!notificationId) {
        socket.emit(socketEvents.NOTIFICATION_ERROR, {
          message: 'Missing notification ID',
        });
        return;
      }

      const notification = await notificationService.markAsRead(notificationId);

      // Emit updated status
      socket.emit(socketEvents.NOTIFICATION_UPDATED, {
        id: notification.id,
        isRead: notification.isRead,
      });

      // Emit to user room if unread count changed
      const unreadCount = await notificationService.getUnreadCount(notification.userId);
      io.to(`user:${notification.userId}`).emit('notification:count', { unread: unreadCount });
    } catch (error) {
      logger.error('Notification read error:', error);
      socket.emit(socketEvents.NOTIFICATION_ERROR, {
        message: 'Failed to mark notification as read',
      });
    }
  });

  // Mark all notifications as read
  socket.on('notification:read-all', async (data) => {
    try {
      const userId = socket.data.userId;
      await notificationService.markAllAsRead(userId);

      // Emit updated count
      socket.emit('notification:count', { unread: 0 });
    } catch (error) {
      logger.error('Mark all read error:', error);
      socket.emit(socketEvents.NOTIFICATION_ERROR, {
        message: 'Failed to mark all notifications as read',
      });
    }
  });

  // Get unread count
  socket.on('notification:count', async () => {
    try {
      const userId = socket.data.userId;
      const unreadCount = await notificationService.getUnreadCount(userId);
      socket.emit('notification:count', { unread: unreadCount });
    } catch (error) {
      logger.error('Get unread count error:', error);
    }
  });
};