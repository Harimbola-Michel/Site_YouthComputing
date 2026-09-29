import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';

if (env.ENABLE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  logger.info('Cloudinary configured successfully');
}

export const cloudinaryConfig = {
  uploadPreset: 'youth_computing',
  folder: 'youth_computing',
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  maxFileSize: 10485760, // 10MB
  transformation: {
    quality: 'auto',
    fetch_format: 'auto',
  },
};

export default cloudinary;