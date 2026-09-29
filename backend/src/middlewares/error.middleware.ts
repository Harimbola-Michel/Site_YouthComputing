import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Classe ApiError pour les erreurs personnalisées
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(statusCode: number, message: string, details?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details?: Record<string, any>) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized', details?: Record<string, any>) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = 'Forbidden', details?: Record<string, any>) {
    return new ApiError(403, message, details);
  }

  static notFound(message = 'Not Found', details?: Record<string, any>) {
    return new ApiError(404, message, details);
  }

  static conflict(message = 'Conflict', details?: Record<string, any>) {
    return new ApiError(409, message, details);
  }

  static validation(message = 'Validation Error', details?: Record<string, any>) {
    return new ApiError(422, message, details);
  }

  static tooManyRequests(message = 'Too Many Requests', details?: Record<string, any>) {
    return new ApiError(429, message, details);
  }

  static internalServer(message = 'Internal Server Error', details?: Record<string, any>) {
    return new ApiError(500, message, details);
  }
}

/**
 * Middleware de gestion d'erreurs global
 */
export const errorMiddleware = (
  err: Error | ApiError | any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req as any).requestId || 'unknown';

  logger.error(`[${requestId}] Error:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // 1. Gestion des erreurs ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
      requestId,
    });
    return;
  }

  // 2. Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      requestId,
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      requestId,
    });
    return;
  }

  // 3. Gestion des erreurs Multer (upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'FILE_TOO_LARGE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    res.status(400).json({
      success: false,
      message,
      code: err.code,
      requestId,
    });
    return;
  }

  // 4. Gestion des erreurs de validation
  if (err.name === 'ValidationError' || err.type === 'validation') {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors || err.details,
      requestId,
    });
    return;
  }

  // 5. Erreurs inconnues
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    requestId,
  });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    path: req.path,
  });
};

export default errorMiddleware;