import { Request, Response, NextFunction } from 'express';
import { redisCache } from '../config/redis';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const cacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!env.ENABLE_REDIS || !redisCache) {
      return next();
    }

    // Skip cache for authenticated requests
    if (req.headers.authorization) {
      return next();
    }

    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.method}:${req.originalUrl}`;

    try {
      const cachedData = await redisCache.get(key);
      
      if (cachedData) {
        logger.debug(`Cache hit: ${key}`);
        res.setHeader('X-Cache', 'HIT');
        res.status(200).json(cachedData);
        return;
      }

      // Store original send function
      const originalSend = res.json.bind(res);
      res.json = function(data) {
        // Cache the response
        redisCache.set(key, data, duration).catch(err => {
          logger.error('Cache save error:', err);
        });
        res.setHeader('X-Cache', 'MISS');
        return originalSend(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  if (!env.ENABLE_REDIS || !redisCache) {
    return;
  }

  try {
    await redisCache.deletePattern(`cache:*${pattern}*`);
    logger.debug(`Cache invalidated for pattern: ${pattern}`);
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  if (!env.ENABLE_REDIS || !redisCache) {
    return;
  }

  try {
    await redisCache.flush();
    logger.info('All cache cleared');
  } catch (error) {
    logger.error('Clear cache error:', error);
  }
};

export const cacheResponse = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Cache-Control', `public, max-age=${ttl}`);
    res.setHeader('Expires', new Date(Date.now() + ttl * 1000).toUTCString());
    next();
  };
};

export const noCache = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};