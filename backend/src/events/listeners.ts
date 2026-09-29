import { eventEmitter, EVENT_TYPES } from './event-emitter';
import { logger } from '@config/logger';

// Import all event listeners
import './user.events';
import './formation.events';
import './registration.events';
import './payment.events';
import './notification.events';

// System events
eventEmitter.on(EVENT_TYPES.SYSTEM.STARTUP, () => {
  logger.info('🚀 System started');
});

eventEmitter.on(EVENT_TYPES.SYSTEM.SHUTDOWN, () => {
  logger.info('🛑 System shutting down');
});

eventEmitter.on(EVENT_TYPES.SYSTEM.ERROR, (error) => {
  logger.error('System error:', error);
});

eventEmitter.on(EVENT_TYPES.SYSTEM.WARNING, (warning) => {
  logger.warn('System warning:', warning);
});

eventEmitter.on(EVENT_TYPES.SYSTEM.INFO, (info) => {
  logger.info('System info:', info);
});

// Global error handler for events
eventEmitter.on('error', (error) => {
  logger.error('Event emitter error:', error);
});

export const setupEventListeners = (): void => {
  logger.info('📡 Event listeners initialized');
};

export default eventEmitter;