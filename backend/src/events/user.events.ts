import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';
import { mailer } from '@config/mailer';
import { env } from '@config/env';

// User created event
eventEmitter.on(EVENT_TYPES.USER.CREATED, async (data) => {
  try {
    logger.info(`User created: ${data.email}`);
    
    // Send welcome email
    await mailer.sendTemplatedEmail(data.email, 'welcome', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Bienvenue sur Youth Computing !</h2>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Pour commencer, explorez nos formations et événements.</p>
        <p>
          <a href="${env.FRONTEND_URL}/formations" class="button">
            Voir les formations
          </a>
        </p>
      `,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.id,
        action: 'REGISTER',
        resource: 'user',
        resourceId: data.id,
        metadata: { email: data.email },
      },
    });
  } catch (error) {
    logger.error('Error handling user.created event:', error);
  }
});

// User logged in event
eventEmitter.on(EVENT_TYPES.USER.LOGGED_IN, async (data) => {
  try {
    logger.info(`User logged in: ${data.email}`);
    
    // Update last login
    await prisma.user.update({
      where: { id: data.id },
      data: { lastLogin: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.id,
        action: 'LOGIN',
        resource: 'user',
        resourceId: data.id,
        metadata: { 
          email: data.email,
          ip: data.ip,
          userAgent: data.userAgent,
        },
      },
    });
  } catch (error) {
    logger.error('Error handling user.logged_in event:', error);
  }
});

// User password changed event
eventEmitter.on(EVENT_TYPES.USER.PASSWORD_CHANGED, async (data) => {
  try {
    logger.info(`Password changed for user: ${data.email}`);
    
    // Send notification email
    await mailer.sendTemplatedEmail(data.email, 'password-changed', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Mot de passe modifié</h2>
        <p>Votre mot de passe a été modifié avec succès.</p>
        <p>Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
      `,
    });
  } catch (error) {
    logger.error('Error handling user.password_changed event:', error);
  }
});

// User suspended event
eventEmitter.on(EVENT_TYPES.USER.SUSPENDED, async (data) => {
  try {
    logger.info(`User suspended: ${data.email}`);
    
    await mailer.sendTemplatedEmail(data.email, 'account-suspended', {
      name: `${data.firstName} ${data.lastName}`,
      content: `
        <h2>Compte suspendu</h2>
        <p>Votre compte a été suspendu.</p>
        <p>Pour plus d'informations, contactez l'administrateur.</p>
      `,
    });
  } catch (error) {
    logger.error('Error handling user.suspended event:', error);
  }
});