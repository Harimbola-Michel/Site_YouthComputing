import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  },
  skip: (req: Request): boolean => {
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Stricter rate limit for authentication routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  },
});

// Stricter rate limit for registration
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  },
});

// Rate limit for contact form
export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 messages
  message: {
    success: false,
    message: 'Too many messages sent, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  },
});

export default rateLimitConfig;