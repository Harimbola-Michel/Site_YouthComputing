import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
};

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const getFileNameWithoutExtension = (filename: string): string => {
  return path.basename(filename, path.extname(filename));
};

export const generateUniqueFileName = (originalName: string): string => {
  const extension = getFileExtension(originalName);
  const name = getFileNameWithoutExtension(originalName);
  const timestamp = Date.now();
  const random = uuidv4().substring(0, 8);
  return `${name}-${timestamp}-${random}${extension}`;
};

export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export const isImage = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
};

export const isVideo = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext);
};

export const isAudio = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['.mp3', '.wav', '.ogg', '.flac', '.aac'].includes(ext);
};

export const isDocument = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'].includes(ext);
};

export const getFileSize = (filePath: string): Promise<number> => {
  return fs.stat(filePath).then(stats => stats.size);
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const readFileAsBase64 = async (filePath: string): Promise<string> => {
  const data = await fs.readFile(filePath);
  return data.toString('base64');
};

export const writeFileFromBuffer = async (
  filePath: string,
  buffer: Buffer
): Promise<void> => {
  const dir = path.dirname(filePath);
  await ensureDirectoryExists(dir);
  await fs.writeFile(filePath, buffer);
};

export const copyFile = async (source: string, destination: string): Promise<void> => {
  await fs.copyFile(source, destination);
};

export const moveFile = async (source: string, destination: string): Promise<void> => {
  await fs.rename(source, destination);
};

export const getFilesInDirectory = async (dirPath: string): Promise<string[]> => {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch {
    return [];
  }
};

export const getFileStats = async (filePath: string): Promise<{
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  isFile: boolean;
  isDirectory: boolean;
}> => {
  const stats = await fs.stat(filePath);
  return {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
  };
};