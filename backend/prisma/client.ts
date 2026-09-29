import { PrismaClient } from '@prisma/client';
import { logger } from '../src/config/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Configuration des logs
const logLevels: Array<'query' | 'info' | 'warn' | 'error'> = 
  process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'];

// Création du client Prisma
const prisma = global.prisma || new PrismaClient({
  log: logLevels,
});

// Middleware pour logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    logger.debug(`Prisma Query: ${params.model}.${params.action} - ${after - before}ms`, {
      model: params.model,
      action: params.action,
      duration: `${after - before}ms`,
    });
    
    return result;
  });
}

// Middleware pour gérer les erreurs
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    logger.error(`Prisma Error: ${params.model}.${params.action}`, {
      model: params.model,
      action: params.action,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
});

// Sauvegarde en global pour éviter plusieurs instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Gestion de la fermeture propre
const handleShutdown = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
};

// Écoute des signaux de fermeture
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export default prisma;

// Export des types pour faciliter l'utilisation
export type { PrismaClient };