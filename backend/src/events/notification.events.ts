import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';
import prisma from '../../prisma/client';

// Notification sent event
eventEmitter.on(EVENT_TYPES.NOTIFICATION.SENT, async (data) => {
  try {
    logger.debug(`Notification sent to user: ${data.userId}`);
    
    // Store notification in database
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type || 'SYSTEM',
        title: data.title,
        message: data.message,
        link: data.link,
        isRead: false,
      },
    });
  } catch (error) {
    logger.error('Error handling notification.sent event:', error);
  }
});

// Notification read event
eventEmitter.on(EVENT_TYPES.NOTIFICATION.READ, async (data) => {
  try {
    logger.debug(`Notification read: ${data.notificationId}`);
    
    // Mark notification as read
    await prisma.notification.update({
      where: { id: data.notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    logger.error('Error handling notification.read event:', error);
  }
});

// Notification all read event
eventEmitter.on(EVENT_TYPES.NOTIFICATION.ALL_READ, async (data) => {
  try {
    logger.debug(`All notifications read for user: ${data.userId}`);
    
    // Mark all notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: data.userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  } catch (error) {
    logger.error('Error handling notification.all_read event:', error);
  }
});