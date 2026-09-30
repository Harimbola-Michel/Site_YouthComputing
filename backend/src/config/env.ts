import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-min-32-characters',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key-min-32-characters',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Aliases pour compatibilité
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-jwt-secret-key-min-32-characters',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m',
  
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@youthcomputing.mg',
  
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3100',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3100,http://localhost:3001,http://localhost:5173',
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  ENABLE_SOCKET: process.env.ENABLE_SOCKET === 'true',
  ENABLE_REDIS: process.env.ENABLE_REDIS === 'true',
  ENABLE_EMAIL: process.env.ENABLE_EMAIL === 'true',
  ENABLE_CLOUDINARY: process.env.ENABLE_CLOUDINARY === 'true',
  
  BACKUP_PATH: process.env.BACKUP_PATH || './backups',
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@2026!',
};

export default env;