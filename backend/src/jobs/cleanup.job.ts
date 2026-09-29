import { logger } from '@config/logger';
import prisma from '../../prisma/client';

export const cleanupJob = async (): Promise<void> => {
  try {
    logger.info('🧹 Starting cleanup job...');

    const results = {
      deleted: {
        refreshTokens: 0,
        activityLogs: 0,
        notifications: 0,
        expiredSessions: 0,
        orphanedRegistrations: 0,
      },
    };

    // Delete expired refresh tokens
    const refreshTokens = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });
    results.deleted.refreshTokens = refreshTokens.count || 0;

    // Delete old activity logs (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const activityLogs = await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });
    results.deleted.activityLogs = activityLogs.count || 0;

    // Delete old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const notifications = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isRead: true,
      },
    });
    results.deleted.notifications = notifications.count || 0;

    // Delete expired sessions
    const expiredSessions = await prisma.formationSession.updateMany({
      where: {
        endDate: { lt: new Date() },
        status: 'SCHEDULED',
      },
      data: {
        status: 'COMPLETED',
      },
    });
    results.deleted.expiredSessions = expiredSessions.count || 0;

    // Delete orphaned registrations (without session)
    const orphanedRegistrations = await prisma.registration.deleteMany({
      where: {
        sessionId: null,
        createdAt: { lt: ninetyDaysAgo },
      },
    });
    results.deleted.orphanedRegistrations = orphanedRegistrations.count || 0;

    logger.info('✅ Cleanup job completed', results);

    // Log detailed results
    for (const [key, value] of Object.entries(results.deleted)) {
      if (value > 0) {
        logger.info(`  - ${key}: ${value} items removed`);
      }
    }
  } catch (error) {
    logger.error('❌ Cleanup job failed:', error);
    throw error;
  }
};