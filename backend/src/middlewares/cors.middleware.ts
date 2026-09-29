import { Request, Response, NextFunction } from 'express';
import { corsConfig } from '../config/cors';
import { env } from '../config/env';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    if (origin) {
      const allowedOrigins = Array.isArray(corsConfig.origin) 
        ? corsConfig.origin 
        : [corsConfig.origin];
      
      if (allowedOrigins.includes(origin) || corsConfig.origin === '*') {
        res.header('Access-Control-Allow-Origin', origin);
      }
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.status(204).send();
    return;
  }

  if (origin) {
    const allowedOrigins = Array.isArray(corsConfig.origin) 
      ? corsConfig.origin 
      : [corsConfig.origin];
    
    if (allowedOrigins.includes(origin) || corsConfig.origin === '*' || env.NODE_ENV === 'development') {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Pagination-Total, X-Pagination-Page, X-Request-ID');

  next();
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = Array.isArray(corsConfig.origin) 
      ? corsConfig.origin 
      : [corsConfig.origin];

    if (allowedOrigins.includes(origin) || corsConfig.origin === '*' || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Pagination-Total', 'X-Pagination-Page', 'X-Request-ID'],
  maxAge: 86400,
};