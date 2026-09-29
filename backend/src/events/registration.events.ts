import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import prisma from '../../prisma/client';

// Registration created event
eventEmitter.on(EVENT_TYPES.REGISTRATION.CREATED, async (data) => {
  try {
    logger.info(`Registration created: ${data.email} for ${data.formationTitle}`);
    
    // Send confirmation email
    await mailer.sendTemplatedEmail(data.email, 'registration-confirmation', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Confirmation d'inscription</h2>
        <p>Votre inscription à la formation "${data.formationTitle}" a été enregistrée.</p>
        <p><strong>Date:</strong> ${new Date(data.sessionStartDate).toLocaleDateString()}</p>
        <p><strong>Lieu:</strong> ${data.sessionLocation}</p>
        <p>Nous vous confirmerons votre place sous 48h.</p>
      `,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.userId || 'system',
        action: 'CREATE',
        resource: 'registration',
        resourceId: data.id,
        metadata: { 
          email: data.email,
          formation: data.formationTitle,
        },
      },
    });
  } catch (error) {
    logger.error('Error handling registration.created event:', error);
  }
});

// Registration confirmed event
eventEmitter.on(EVENT_TYPES.REGISTRATION.CONFIRMED, async (data) => {
  try {
    logger.info(`Registration confirmed: ${data.email}`);
    
    // Send confirmation email
    await mailer.sendTemplatedEmail(data.email, 'registration-confirmation', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Inscription confirmée</h2>
        <p>Votre inscription à la formation "${data.formationTitle}" a été confirmée.</p>
        <p><strong>Date:</strong> ${new Date(data.sessionStartDate).toLocaleDateString()}</p>
        <p><strong>Lieu:</strong> ${data.sessionLocation}</p>
        <p>Nous vous attendons avec impatience !</p>
      `,
    });

    // Update session participant count
    await prisma.formationSession.update({
      where: { id: data.sessionId },
      data: {
        currentParticipants: { increment: 1 },
      },
    });
  } catch (error) {
    logger.error('Error handling registration.confirmed event:', error);
  }
});

// Registration cancelled event
eventEmitter.on(EVENT_TYPES.REGISTRATION.CANCELLED, async (data) => {
  try {
    logger.info(`Registration cancelled: ${data.email}`);
    
    // Send cancellation email
    await mailer.sendTemplatedEmail(data.email, 'registration-cancelled', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Inscription annulée</h2>
        <p>Votre inscription à la formation "${data.formationTitle}" a été annulée.</p>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      `,
    });

    // Update session participant count
    await prisma.formationSession.update({
      where: { id: data.sessionId },
      data: {
        currentParticipants: { decrement: 1 },
      },
    });
  } catch (error) {
    logger.error('Error handling registration.cancelled event:', error);
  }
});