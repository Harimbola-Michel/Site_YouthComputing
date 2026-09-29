import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import prisma from '../../prisma/client';

// Formation created event
eventEmitter.on(EVENT_TYPES.FORMATION.CREATED, async (data) => {
  try {
    logger.info(`Formation created: ${data.title}`);
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.authorId || 'system',
        action: 'CREATE',
        resource: 'formation',
        resourceId: data.id,
        metadata: { title: data.title },
      },
    });
  } catch (error) {
    logger.error('Error handling formation.created event:', error);
  }
});

// Formation published event
eventEmitter.on(EVENT_TYPES.FORMATION.PUBLISHED, async (data) => {
  try {
    logger.info(`Formation published: ${data.title}`);
    
    // Notify subscribers (if any)
    // This would typically send emails to users who subscribed to formation updates
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.authorId || 'system',
        action: 'PUBLISH',
        resource: 'formation',
        resourceId: data.id,
        metadata: { title: data.title },
      },
    });
  } catch (error) {
    logger.error('Error handling formation.published event:', error);
  }
});

// Formation session created event
eventEmitter.on(EVENT_TYPES.FORMATION.SESSION_CREATED, async (data) => {
  try {
    logger.info(`Session created for formation: ${data.formationTitle}`);
    
    // Send notifications to waiting list
    const waitingList = await prisma.registration.findMany({
      where: {
        formationId: data.formationId,
        status: 'WAITING_LIST',
      },
    });

    for (const registration of waitingList) {
      await mailer.sendTemplatedEmail(registration.email, 'formation-reminder', {
        name: `${registration.firstName} ${registration.lastName}`,
        content: `
          <h2>Nouvelle session disponible</h2>
          <p>Une nouvelle session pour la formation "${data.formationTitle}" a été créée.</p>
          <p><strong>Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
          <p><strong>Lieu:</strong> ${data.location}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/formations/${data.formationSlug}">
              Voir la formation
            </a>
          </p>
        `,
      });
    }
  } catch (error) {
    logger.error('Error handling formation.session_created event:', error);
  }
});

// Formation session cancelled event
eventEmitter.on(EVENT_TYPES.FORMATION.SESSION_CANCELLED, async (data) => {
  try {
    logger.info(`Session cancelled for formation: ${data.formationTitle}`);
    
    // Notify registered participants
    const registrations = await prisma.registration.findMany({
      where: {
        sessionId: data.sessionId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    for (const registration of registrations) {
      await mailer.sendTemplatedEmail(registration.email, 'formation-cancelled', {
        name: `${registration.firstName} ${registration.lastName}`,
        content: `
          <h2>Session annulée</h2>
          <p>La session pour la formation "${data.formationTitle}" a été annulée.</p>
          <p>Nous vous contacterons pour une nouvelle session.</p>
          <p>Nous nous excusons pour ce désagrément.</p>
        `,
      });
    }
  } catch (error) {
    logger.error('Error handling formation.session_cancelled event:', error);
  }
});