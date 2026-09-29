import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redis: Redis | null = null;

if (env.ENABLE_REDIS && env.REDIS_HOST) {
  const redisConfig: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT || 6379,
    password: env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
  };

  redis = new Redis(redisConfig);

  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  // Test de connexion
  redis.ping().then(() => {
    logger.info('Redis ping successful');
  }).catch((err) => {
    logger.error('Redis ping failed:', err);
  });
} else {
  if (!env.ENABLE_REDIS) {
    logger.info('Redis is disabled by configuration');
  } else {
    logger.warn('Redis host not configured, Redis disabled');
  }
}

export const redisClient = redis;

export const redisCache = {
  get: async <T>(key: string): Promise<T | null> => {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },

  set: async <T>(key: string, value: T, ttl?: number): Promise<boolean> => {
    if (!redis) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  },

  delete: async (key: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  },

  deletePattern: async (pattern: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis delete pattern error:', error);
      return false;
    }
  },

  flush: async (): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      logger.error('Redis flush error:', error);
      return false;
    }
  },

  exists: async (key: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  },

  ttl: async (key: string): Promise<number> => {
    if (!redis) return -2;
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error('Redis ttl error:', error);
      return -2;
    }
  },

  expire: async (key: string, ttl: number): Promise<boolean> => {
    if (!redis) return false;
    try {
      const result = await redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  },

  incr: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error('Redis incr error:', error);
      return 0;
    }
  },

  decr: async (key: string): Promise<number> => {
    if (!redis) return 0;
    try {
      return await redis.decr(key);
    } catch (error) {
      logger.error('Redis decr error:', error);
      return 0;
    }
  },

  hget: async (key: string, field: string): Promise<any> => {
    if (!redis) return null;
    try {
      const data = await redis.hget(key, field);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis hget error:', error);
      return null;
    }
  },

  hset: async (key: string, field: string, value: any): Promise<boolean> => {
    if (!redis) return false;
    try {
      const serialized = JSON.stringify(value);
      await redis.hset(key, field, serialized);
      return true;
    } catch (error) {
      logger.error('Redis hset error:', error);
      return false;
    }
  },

  hdel: async (key: string, field: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.hdel(key, field);
      return true;
    } catch (error) {
      logger.error('Redis hdel error:', error);
      return false;
    }
  },

  hgetall: async (key: string): Promise<Record<string, any> | null> => {
    if (!redis) return null;
    try {
      const data = await redis.hgetall(key);
      if (!data) return null;
      const result: Record<string, any> = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      logger.error('Redis hgetall error:', error);
      return null;
    }
  },

  // Méthode pour récupérer le client raw (si besoin)
  getClient: (): Redis | null => redis,
};

export default redis;