import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import prisma from '../../prisma/client';

export const emailJob = async (): Promise<void> => {
  try {
    // Get pending emails from database
    const pendingEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 50,
    });

    if (pendingEmails.length === 0) {
      logger.debug('No pending emails to send');
      return;
    }

    logger.info(`Sending ${pendingEmails.length} emails`);

    let sent = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        await mailer.sendMail({
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        sent++;
      } catch (error) {
        logger.error(`Failed to send email ${email.id}:`, error);
        
        const retryCount = email.retryCount + 1;
        const status = retryCount >= 3 ? 'FAILED' : 'PENDING';
        
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            retryCount,
            status,
            lastError: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        failed++;
      }
    }

    logger.info(`Email job completed: ${sent} sent, ${failed} failed`);
  } catch (error) {
    logger.error('Email job failed:', error);
    throw error;
  }
};

export const queueEmail = async (data: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  scheduledAt?: Date;
}): Promise<void> => {
  await prisma.emailQueue.create({
    data: {
      to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      scheduledAt: data.scheduledAt || new Date(),
      status: 'PENDING',
      retryCount: 0,
    },
  });
};