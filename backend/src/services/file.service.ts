// backend/src/services/file.service.ts

import { FileRepository } from '../repositories/file.repository';
import cloudinary, { cloudinaryConfig } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { File } from '@prisma/client';

export class FileService {
  private fileRepository: FileRepository;

  constructor() {
    this.fileRepository = new FileRepository();
  }

  async uploadFile(file: Express.Multer.File, userId: string, folder?: string): Promise<File> {
    try {
      let publicId: string;
      let url: string;
      let format: string;
      let size: number;
      let width: number | undefined;
      let height: number | undefined;

      if (env.ENABLE_CLOUDINARY) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: folder || cloudinaryConfig.folder,
            public_id: `${uuidv4()}`,
            resource_type: 'auto',
            transformation: cloudinaryConfig.transformation,
          }
        );
        publicId = result.public_id;
        url = result.secure_url;
        format = result.format;
        size = result.bytes;
        width = result.width;
        height = result.height;
      } else {
        const fileName = `${uuidv4()}-${file.originalname}`;
        publicId = fileName;
        url = `/uploads/${fileName}`;
        format = file.mimetype.split('/')[1];
        size = file.size;
      }

      // ✅ Correction : utiliser la relation "User" (majuscule) au lieu de "user"
      return this.fileRepository.create({
        name: file.originalname,
        mimeType: file.mimetype,
        size,
        url,
        publicId,
        format,
        width,
        height,
        User: {
          connect: { id: userId }
        },
        folder: folder || cloudinaryConfig.folder,
      });
    } catch (error) {
      logger.error('Failed to upload file:', error);
      throw new ApiError(500, 'Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], userId: string, folder?: string): Promise<File[]> {
    const uploads = files.map(file => this.uploadFile(file, userId, folder));
    return Promise.all(uploads);
  }

  async getFiles(pagination?: { page: number; limit: number; orderBy?: any }): Promise<File[]> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = pagination || {};
    const skip = (page - 1) * limit;
    return this.fileRepository.findMany({
      skip,
      take: limit,
      orderBy,
    });
  }

  async getFile(id: string): Promise<File> {
    return this.fileRepository.findByIdOrThrow(id);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.fileRepository.findByIdOrThrow(id);

    if (env.ENABLE_CLOUDINARY) {
      try {
        await cloudinary.uploader.destroy(file.publicId);
      } catch (error) {
        logger.error('Failed to delete file from Cloudinary:', error);
        throw new ApiError(500, 'Failed to delete file from cloud storage');
      }
    }

    await this.fileRepository.delete(id);
  }

  async getFileUrl(publicId: string): Promise<string> {
    if (env.ENABLE_CLOUDINARY) {
      return cloudinary.url(publicId, {
        secure: true,
        transformation: cloudinaryConfig.transformation,
      });
    }
    return `/uploads/${publicId}`;
  }

  async getFileInfo(publicId: string): Promise<any> {
    if (env.ENABLE_CLOUDINARY) {
      const result = await cloudinary.api.resource(publicId);
      return {
        id: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
      };
    }
    return null;
  }
}