import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import prisma from '../../prisma/client';

// Payment created event
eventEmitter.on(EVENT_TYPES.PAYMENT.CREATED, async (data) => {
  try {
    logger.info(`Payment created: ${data.paymentReference}`);
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.userId || 'system',
        action: 'CREATE',
        resource: 'payment',
        resourceId: data.id,
        metadata: { 
          reference: data.paymentReference,
          amount: data.amount,
        },
      },
    });
  } catch (error) {
    logger.error('Error handling payment.created event:', error);
  }
});

// Payment confirmed event
eventEmitter.on(EVENT_TYPES.PAYMENT.CONFIRMED, async (data) => {
  try {
    logger.info(`Payment confirmed: ${data.paymentReference}`);
    
    // Send confirmation email
    await mailer.sendTemplatedEmail(data.email, 'payment-confirmation', {
      name: data.name,
      content: `
        <h2>Confirmation de paiement</h2>
        <p>Nous avons bien reçu votre paiement.</p>
        <p><strong>Référence:</strong> ${data.paymentReference}</p>
        <p><strong>Montant:</strong> ${data.amount} ${data.currency || 'MGA'}</p>
        <p>Merci pour votre confiance.</p>
      `,
    });

    // Update related registration
    if (data.registrationId) {
      await prisma.registration.update({
        where: { id: data.registrationId },
        data: {
          paymentStatus: 'PAID',
        },
      });
    }

    // Update Y2C member
    if (data.y2cMemberId) {
      await prisma.y2cMember.update({
        where: { id: data.y2cMemberId },
        data: {
          status: 'ACTIVE',
          membershipFeePaid: data.amount,
        },
      });
    }
  } catch (error) {
    logger.error('Error handling payment.confirmed event:', error);
  }
});

// Payment failed event
eventEmitter.on(EVENT_TYPES.PAYMENT.FAILED, async (data) => {
  try {
    logger.warn(`Payment failed: ${data.paymentReference}`);
    
    // Send failure notification
    await mailer.sendTemplatedEmail(data.email, 'payment-failed', {
      name: data.name,
      content: `
        <h2>Paiement échoué</h2>
        <p>Votre paiement de ${data.amount} ${data.currency || 'MGA'} a échoué.</p>
        <p>Veuillez réessayer ou contacter le support.</p>
        <p><strong>Référence:</strong> ${data.paymentReference}</p>
      `,
    });

    // Update related registration
    if (data.registrationId) {
      await prisma.registration.update({
        where: { id: data.registrationId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
    }
  } catch (error) {
    logger.error('Error handling payment.failed event:', error);
  }
});

// Payment refunded event
eventEmitter.on(EVENT_TYPES.PAYMENT.REFUNDED, async (data) => {
  try {
    logger.info(`Payment refunded: ${data.paymentReference}`);
    
    // Send refund notification
    await mailer.sendTemplatedEmail(data.email, 'payment-refunded', {
      name: data.name,
      content: `
        <h2>Remboursement</h2>
        <p>Votre paiement de ${data.amount} ${data.currency || 'MGA'} a été remboursé.</p>
        <p><strong>Référence:</strong> ${data.paymentReference}</p>
        <p>Le remboursement sera traité sous 48h.</p>
      `,
    });

    // Update related registration
    if (data.registrationId) {
      await prisma.registration.update({
        where: { id: data.registrationId },
        data: {
          paymentStatus: 'REFUNDED',
        },
      });
    }
  } catch (error) {
    logger.error('Error handling payment.refunded event:', error);
  }
});