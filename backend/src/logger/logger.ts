import winston from 'winston';
import { env } from '@config/env';
import { formats } from './formats';
import { transports } from './transports';

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    formats.prettyPrint
  ),
  defaultMeta: {
    service: 'youth-computing-backend',
    environment: env.NODE_ENV,
  },
  transports: [
    transports.console,
    transports.fileError,
    transports.fileCombined,
  ],
});

// If we're not in production, log to the console with colors
if (env.NODE_ENV !== 'production') {
  logger.add(transports.console);
}

// Export a stream for morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;