import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { env } from '../config/env';   // Assurez-vous que le chemin est correct
import { logger } from './logger';     // Assurez-vous que le chemin est correct

let redis: Redis | null = null;

if (env.ENABLE_REDIS && env.REDIS_HOST) {
  const redisConfig: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT || 6379,
    password: env.REDIS_PASSWORD || undefined,
    // Stratégie de reconnexion progressive (backoff)
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis reconnexion tentative ${times}, délai: ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,      // 10 secondes pour établir la connexion
    commandTimeout: 10000,      // 10 secondes pour l'exécution des commandes (augmenté)
    enableReadyCheck: true,     // Vérifie que Redis est prêt avant d'émettre 'ready'
    lazyConnect: false,         // Se connecte immédiatement
  };

  redis = new Redis(redisConfig);

  // Événement déclenché lorsque la connexion TCP est établie
  redis.on('connect', () => {
    logger.info('Redis connecté (TCP)');
  });

  // Événement déclenché lorsque Redis est prêt à recevoir des commandes (recommandé)
  redis.on('ready', () => {
    logger.info('Redis prêt et opérationnel');
    // On fait un ping ici pour confirmer, mais c'est purement informatif
    redis?.ping()
      .then(() => logger.info('Redis ping réussi'))
      .catch((err) => logger.warn('Redis ping après ready échoué (non bloquant)', err));
  });

  // Gestion des erreurs
  redis.on('error', (error) => {
    logger.error('Redis erreur:', error);
  });

  // Gestion de la fermeture
  redis.on('close', () => {
    logger.warn('Redis connexion fermée');
  });

  // Gestion de la reconnexion
  redis.on('reconnecting', (delay) => {
    logger.warn(`Redis reconnexion en cours... délai: ${delay}ms`);
  });

  // Test de connexion SUPPRIMÉ ici pour éviter le timeout
  // Le ping est maintenant déplacé dans l'événement 'ready' ci-dessus.

} else {
  if (!env.ENABLE_REDIS) {
    logger.info('Redis est désactivé par la configuration');
  } else {
    logger.warn('REDIS_HOST non configuré, Redis désactivé');
  }
}

// Export du client brut
export const redisClient = redis;

// Export des helpers de cache
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