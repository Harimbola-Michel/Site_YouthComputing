import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  (req as any).requestId = requestId;
  (req as any).startTime = start;

  res.setHeader('X-Request-ID', requestId);

  logger.info(`[${requestId}] ${req.method} ${req.url}`);

  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  res.send = function(body: any): Response {
    const duration = Date.now() - start;
    logger.info(`[${requestId}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    return originalSend(body);
  };

  res.json = function(body: any): Response {
    const duration = Date.now() - start;
    logger.info(`[${requestId}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    return originalJson(body);
  };

  next();
};