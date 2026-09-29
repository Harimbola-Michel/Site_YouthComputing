// src/types/upload.types.ts
// ============================================================
import { PaginationParams } from './common.types';
import { UserRef } from './common.types';

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  userId: string;
  user?: UserRef;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileDTO {
  file: File;
  folder?: string;
}

export interface UploadMultipleFilesDTO {
  files: File[];
  folder?: string;
}

export interface UploadFilters extends PaginationParams {
  mimeType?: string;
  folder?: string;
  userId?: string;
}

export interface UploadStats {
  total: number;
  totalSize: number;
  byMimeType: Record<string, number>;
  byUser: Record<string, number>;
}