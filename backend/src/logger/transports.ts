import winston from 'winston';
import path from 'path';
import { env } from '@config/env';

const logDir = path.join(process.cwd(), 'logs');

const fileRotateTransport = (filename: string, level?: string) => {
  return new winston.transports.File({
    filename: path.join(logDir, filename),
    level: level,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  });
};

export const transports = {
  console: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),

  fileError: fileRotateTransport('error.log', 'error'),
  fileCombined: fileRotateTransport('combined.log'),

  // Additional transport for JSON logs
  fileJson: new winston.transports.File({
    filename: path.join(logDir, 'app.json.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),

  // Transport for audit logs
  fileAudit: new winston.transports.File({
    filename: path.join(logDir, 'audit.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
};