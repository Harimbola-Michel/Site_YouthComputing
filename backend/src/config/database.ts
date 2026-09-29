import prisma from '../../prisma/client';
import { env } from './env';
import { logger } from './logger';

export const databaseConfig = {
  url: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production',
  connectionTimeout: 30000,
  maxConnections: 20,
  idleTimeout: 30000,
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
  },
};

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};