import winston from 'winston';

export const formats = {
  // Pretty print for development
  prettyPrint: winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
  }),

  // JSON format for production
  json: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  // Simple format
  simple: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),

  // With metadata
  metadata: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata(),
    winston.format.json()
  ),

  // For audit logs
  audit: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata(),
    winston.format.printf(({ timestamp, level, message, metadata }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...metadata,
      });
    })
  ),
};