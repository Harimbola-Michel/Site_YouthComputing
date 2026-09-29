import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { corsConfig } from './config/cors';
import { rateLimitConfig } from './config/rate-limit';
import { logger } from './config/logger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import routes from './routes/index';
import { initializeSocket } from './sockets/socket.server'; // ✅ Seul import nécessaire

class App {
  public app: express.Application;
  public server: http.Server;
  public io: SocketServer | null = null;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.ensureUploadDirectory();
    this.ensurePublicDirectories();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  /**
   * Vérifie et crée le dossier uploads
   */
  private ensureUploadDirectory(): void {
    const uploadDir = path.join(process.env.STORAGE_PATH || process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`📁 Dossier uploads créé : ${uploadDir}`);
    }
  }

  /**
   * Vérifie et crée les dossiers publics nécessaires
   */
  private ensurePublicDirectories(): void {
    const publicDirs = [
      path.join(process.env.STORAGE_PATH || process.cwd(), 'public'),
      path.join(process.env.STORAGE_PATH || process.cwd(), 'public/images'),
      path.join(process.env.STORAGE_PATH || process.cwd(), 'public/images/brand'),
    ];
    publicDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`📁 Dossier créé : ${dir}`);
      }
    });
  }

  private initializeMiddlewares(): void {
    // CORS
    this.app.use(cors(corsConfig));
    
    // Sécurité
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'unsafe-none' },
      })
    );
    
    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Compression
    this.app.use(compression());
    
    // Logs
    this.app.use(
      morgan('combined', {
        stream: { write: (message: string) => logger.info(message.trim()) },
      })
    );
    this.app.use(loggingMiddleware);
    
    // Rate limiting
    this.app.use(rateLimitConfig);

    // ─── Servir les fichiers statiques (uploads) ──────────────
    const storagePath = process.env.STORAGE_PATH || process.cwd();
    const uploadsPath = path.join(storagePath, 'uploads');
    this.app.use(
      '/uploads',
      express.static(uploadsPath, {
        maxAge: '7d',
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
          };
          if (mimeTypes[ext]) {
            res.setHeader('Content-Type', mimeTypes[ext]);
          }
          // Cache
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        },
      })
    );

    // ─── Fallback pour les images manquantes ──────────────────
    this.app.use('/uploads/*', (req, res) => {
      const defaultImagePath = path.join(storagePath, 'public/images/default-formation.jpg');
      if (fs.existsSync(defaultImagePath)) {
        res.sendFile(defaultImagePath);
      } else {
        // SVG fallback en base64
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="#e5e7eb"/>
          <text x="200" y="150" font-family="sans-serif" font-size="24" fill="#9ca3af" text-anchor="middle" dominant-baseline="central">Image non disponible</text>
        </svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.status(404).send(svg);
      }
    });

    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);
    this.app.use(notFoundMiddleware);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  /**
   * Initialise Socket.IO (l'authentification et les handlers sont gérés dans le module)
   */
  private initializeSocketIO(): void {
    // initializeSocket configure déjà l'authentification et les handlers
    this.io = initializeSocket(this.server);
    logger.info('🔌 Socket.IO initialisé');
  }

  public getServer(): http.Server {
    return this.server;
  }

  public getIO(): SocketServer | null {
    return this.io;
  }
}

export default App;
