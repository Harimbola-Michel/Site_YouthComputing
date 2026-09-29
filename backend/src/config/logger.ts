import winston from 'winston';
import { env } from './env';
import fs from 'fs';
import path from 'path';

// Créer le dossier logs s'il n'existe pas
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
  })
);

// Format pour la console (plus lisible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console en développement
    new winston.transports.Console({
      format: consoleFormat,
      level: env.LOG_LEVEL || 'info',
    }),
    // Fichier d'erreurs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: logFormat,
    }),
    // Fichier combiné
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
      format: logFormat,
    }),
  ],
});

// En développement, ajouter plus de logs
if (env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'debug',
    })
  );
}

// Fonctions utilitaires
export const logHttp = (req: any, res: any, responseTime?: number) => {
  const message = `${req.method} ${req.url} ${res.statusCode}`;
  const meta = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  };
  
  if (res.statusCode >= 500) {
    logger.error(message, meta);
  } else if (res.statusCode >= 400) {
    logger.warn(message, meta);
  } else {
    logger.info(message, meta);
  }
};

export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: any) => {
  logger.warn(message, context);
};

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, context);
};

export default logger;