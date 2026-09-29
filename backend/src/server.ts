import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './config/logger';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import App from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  logger.error('💥 Unhandled Rejection:', reason);
});

async function startServer() {
  try {
    console.log('\n🔍 Environnement:');
    console.log(`   NODE_ENV      : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   PORT          : ${PORT}`);
    console.log(`   HOST          : ${HOST}`);
    console.log(`   DATABASE_URL  : ${process.env.DATABASE_URL ? '✅ Définie' : '❌ Non définie'}`);
    console.log(`   JWT_SECRET    : ${process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini'}`);
    console.log(`   FRONTEND_URL  : ${process.env.FRONTEND_URL || 'http://localhost:3100'}\n`);

    const storagePath = process.env.STORAGE_PATH || process.cwd();
    const uploadsPath = path.join(storagePath, 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    const publicImagesPath = path.join(storagePath, 'public/images');
    if (!fs.existsSync(publicImagesPath)) {
      fs.mkdirSync(publicImagesPath, { recursive: true });
    }

    const app = new App();
    const server = app.getServer();

    server.listen(PORT, HOST, () => {
      logger.info(`🚀 Serveur démarré sur http://${HOST}:${PORT}`);
      logger.info(`🌍 Environnement : ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📦 Base de données : ${process.env.DATABASE_URL ? '✅ Connectée' : '❌ Non configurée'}`);
      logger.info(`📁 Uploads : ${uploadsPath}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`🛑 Signal ${signal} reçu, arrêt en cours...`);
      server.close(() => {
        logger.info('👋 Serveur arrêté proprement');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('💥 Arrêt forcé après 10 secondes');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    console.log(`\n✅ Serveur prêt - ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error);
    logger.error('❌ Échec du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
