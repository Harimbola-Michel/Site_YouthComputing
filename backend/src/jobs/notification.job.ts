import { logger } from '@config/logger';
import { NotificationService } from '@services/notification.service';
import prisma from '../../prisma/client';
import { mailer } from '@config/mailer';

const notificationService = new NotificationService();

export const notificationJob = async (): Promise<void> => {
  try {
    logger.info('🔔 Processing notification job...');

    const results = {
      sent: 0,
      failed: 0,
    };

    // 1. Send pending notifications
    const pendingNotifications = await prisma.notificationQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      take: 100,
    });

    for (const notification of pendingNotifications) {
      try {
        await notificationService.createNotification({
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
        });

        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        results.sent++;
      } catch (error) {
        logger.error(`Failed to send notification ${notification.id}:`, error);
        
        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            lastError: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        results.failed++;
      }
    }

    // 2. Send email reminders for upcoming formations
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(23, 59, 59, 999);

    const upcomingSessions = await prisma.formationSession.findMany({
      where: {
        startDate: {
          gte: tomorrow,
          lte: nextDay,
        },
        status: 'SCHEDULED',
      },
      include: {
        formation: true,
        registrations: true,
      },
    });

    for (const session of upcomingSessions) {
      for (const registration of session.registrations) {
        try {
          await mailer.sendTemplatedEmail(
            registration.email,
            'formation-reminder',
            {
              name: `${registration.firstName} ${registration.lastName}`,
              content: `
                <h2>Rappel : Formation à venir</h2>
                <p>Nous vous rappelons que votre formation commence demain.</p>
                <p><strong>Formation:</strong> ${session.formation.title}</p>
                <p><strong>Date:</strong> ${new Date(session.startDate).toLocaleDateString()}</p>
                <p><strong>Lieu:</strong> ${session.location}</p>
                <p>À bientôt !</p>
              `,
            }
          );
        } catch (error) {
          logger.error(`Failed to send reminder to ${registration.email}:`, error);
        }
      }
    }

    logger.info(`✅ Notification job completed: ${results.sent} sent, ${results.failed} failed`);
  } catch (error) {
    logger.error('❌ Notification job failed:', error);
    throw error;
  }
};