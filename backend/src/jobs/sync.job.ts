import { logger } from '@config/logger';
import prisma from '../../prisma/client';
import axios from 'axios';
import { env } from '@config/env';

export const syncJob = async (): Promise<void> => {
  try {
    logger.info('🔄 Starting sync job...');

    const results = {
      synced: 0,
      failed: 0,
    };

    // 1. Sync Y2C members with external system (if any)
    const y2cMembers = await prisma.y2cMember.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    if (env.EXTERNAL_SYNC_URL) {
      for (const member of y2cMembers) {
        try {
          await axios.post(env.EXTERNAL_SYNC_URL, {
            memberId: member.id,
            name: member.name,
            email: member.email,
            badgeNumber: member.badgeNumber,
            status: member.status,
          }, {
            timeout: 5000,
          });

          results.synced++;
        } catch (error) {
          logger.error(`Failed to sync member ${member.id}:`, error);
          results.failed++;
        }
      }
    }

    // 2. Sync formations with external system
    const formations = await prisma.formation.findMany({
      where: {
        isPublished: true,
      },
      include: {
        sessions: true,
      },
    });

    // 3. Update formation statuses
    const now = new Date();
    
    // Start ongoing sessions
    await prisma.formationSession.updateMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        status: 'SCHEDULED',
      },
      data: {
        status: 'ONGOING',
      },
    });

    // Complete ended sessions
    await prisma.formationSession.updateMany({
      where: {
        endDate: { lt: now },
        status: 'ONGOING',
      },
      data: {
        status: 'COMPLETED',
      },
    });

    // 4. Update Y2C member statuses
    const expiredMembers = await prisma.y2cMember.updateMany({
      where: {
        expiresAt: { lt: now },
        status: 'ACTIVE',
      },
      data: {
        status: 'EXPIRED',
      },
    });

    results.synced += expiredMembers.count || 0;

    // 5. Update user statuses (auto-suspend inactive users)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await prisma.user.updateMany({
      where: {
        lastLogin: { lt: thirtyDaysAgo },
        status: 'ACTIVE',
        role: 'VIEWER', // Don't suspend admins
      },
      data: {
        status: 'INACTIVE',
      },
    });

    results.synced += inactiveUsers.count || 0;

    logger.info(`✅ Sync job completed: ${results.synced} synced, ${results.failed} failed`);
  } catch (error) {
    logger.error('❌ Sync job failed:', error);
    throw error;
  }
};