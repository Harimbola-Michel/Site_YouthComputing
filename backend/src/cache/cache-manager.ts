import { redisClient } from '@config/redis';
import { logger } from '@config/logger';
import { env } from '@config/env';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, { value: any; expiry: number }> = new Map();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.getFromMemory<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Try Redis cache
    if (redisClient && env.ENABLE_REDIS) {
      try {
        const data = await redisClient.get(key);
        if (data) {
          const parsed = JSON.parse(data);
          // Store in memory cache
          this.setInMemory(key, parsed);
          return parsed;
        }
      } catch (error) {
        logger.error(`Redis get error for key ${key}:`, error);
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 300; // Default 5 minutes

    // Store in memory cache
    this.setInMemory(key, value, ttl);

    // Store in Redis cache
    if (redisClient && env.ENABLE_REDIS) {
      try {
        const serialized = JSON.stringify(value);
        await redisClient.setex(key, ttl, serialized);
      } catch (error) {
        logger.error(`Redis set error for key ${key}:`, error);
      }
    }
  }

  async delete(key: string): Promise<void> {
    // Delete from memory cache
    this.memoryCache.delete(key);

    // Delete from Redis cache
    if (redisClient && env.ENABLE_REDIS) {
      try {
        await redisClient.del(key);
      } catch (error) {
        logger.error(`Redis delete error for key ${key}:`, error);
      }
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    // Delete from memory cache
    const memoryKeys = Array.from(this.memoryCache.keys());
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryKeys) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Delete from Redis cache
    if (redisClient && env.ENABLE_REDIS) {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } catch (error) {
        logger.error(`Redis delete pattern error for ${pattern}:`, error);
      }
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear Redis cache
    if (redisClient && env.ENABLE_REDIS) {
      try {
        await redisClient.flushall();
      } catch (error) {
        logger.error('Redis clear error:', error);
      }
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  private setInMemory(key: string, value: any, ttl: number = 300): void {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }
}

export const cacheManager = CacheManager.getInstance();