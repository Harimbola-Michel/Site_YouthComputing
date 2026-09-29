import EventEmitter from 'events';
import { logger } from '@config/logger';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emit(event: string, data: any): boolean {
    logger.debug(`📤 Event emitted: ${event}`, { data });
    return super.emit(event, data);
  }

  on(event: string, listener: (...args: any[]) => void): this {
    logger.debug(`📥 Event listener registered: ${event}`);
    return super.on(event, listener);
  }

  once(event: string, listener: (...args: any[]) => void): this {
    logger.debug(`📥 Event listener registered (once): ${event}`);
    return super.once(event, listener);
  }
}

export const eventEmitter = new AppEventEmitter();

export const EVENT_TYPES = {
  USER: {
    CREATED: 'user:created',
    UPDATED: 'user:updated',
    DELETED: 'user:deleted',
    LOGGED_IN: 'user:logged_in',
    LOGGED_OUT: 'user:logged_out',
    PASSWORD_CHANGED: 'user:password_changed',
    PROFILE_UPDATED: 'user:profile_updated',
    EMAIL_VERIFIED: 'user:email_verified',
    SUSPENDED: 'user:suspended',
    REACTIVATED: 'user:reactivated',
  },
  FORMATION: {
    CREATED: 'formation:created',
    UPDATED: 'formation:updated',
    DELETED: 'formation:deleted',
    PUBLISHED: 'formation:published',
    UNPUBLISHED: 'formation:unpublished',
    SESSION_CREATED: 'formation:session_created',
    SESSION_UPDATED: 'formation:session_updated',
    SESSION_CANCELLED: 'formation:session_cancelled',
  },
  REGISTRATION: {
    CREATED: 'registration:created',
    UPDATED: 'registration:updated',
    CONFIRMED: 'registration:confirmed',
    CANCELLED: 'registration:cancelled',
    COMPLETED: 'registration:completed',
    WAITING_LIST: 'registration:waiting_list',
  },
  PAYMENT: {
    CREATED: 'payment:created',
    CONFIRMED: 'payment:confirmed',
    FAILED: 'payment:failed',
    REFUNDED: 'payment:refunded',
  },
  Y2C: {
    MEMBER_CREATED: 'y2c:member_created',
    MEMBER_UPDATED: 'y2c:member_updated',
    MEMBER_APPROVED: 'y2c:member_approved',
    EVENT_CREATED: 'y2c:event_created',
    EVENT_REGISTERED: 'y2c:event_registered',
  },
  NOTIFICATION: {
    SENT: 'notification:sent',
    READ: 'notification:read',
    ALL_READ: 'notification:all_read',
  },
  SYSTEM: {
    STARTUP: 'system:startup',
    SHUTDOWN: 'system:shutdown',
    ERROR: 'system:error',
    WARNING: 'system:warning',
    INFO: 'system:info',
  },
} as const;