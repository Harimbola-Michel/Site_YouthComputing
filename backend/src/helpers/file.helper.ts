import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileHelper {
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static getFileNameWithoutExtension(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }

  static generateUniqueFileName(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const random = uuidv4().substring(0, 8);
    return `${timestamp}-${random}${extension}`;
  }

  static getMimeType(filename: string): string {
    const ext = this.getFileExtension(filename);
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.odt': 'application/vnd.oasis.opendocument.text',
      '.rtf': 'application/rtf',
      '.txt': 'text/plain',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
      '.csv': 'text/csv',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.odp': 'application/vnd.oasis.opendocument.presentation',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.7z': 'application/x-7z-compressed',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.aac': 'audio/aac',
      '.m4a': 'audio/mp4',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  static isImage(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'].includes(ext);
  }

  static isVideo(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext);
  }

  static isAudio(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'].includes(ext);
  }

  static isDocument(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'].includes(ext);
  }

  static isSpreadsheet(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.xls', '.xlsx', '.ods', '.csv'].includes(ext);
  }

  static isPresentation(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.ppt', '.pptx', '.odp'].includes(ext);
  }

  static isArchive(filename: string): boolean {
    const ext = this.getFileExtension(filename);
    return ['.zip', '.rar', '.tar', '.gz', '.7z'].includes(ext);
  }

  static async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  static async readFileAsBase64(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    return data.toString('base64');
  }

  static async writeFileFromBuffer(filePath: string, buffer: Buffer): Promise<void> {
    const dir = path.dirname(filePath);
    await this.ensureDirectoryExists(dir);
    await fs.writeFile(filePath, buffer);
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  static async moveFile(source: string, destination: string): Promise<void> {
    await fs.rename(source, destination);
  }

  static async getFilesInDirectory(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      return files;
    } catch {
      return [];
    }
  }

  static async getFileStats(filePath: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
    isFile: boolean;
    isDirectory: boolean;
  }> {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  }

  static isValidFileName(filename: string): boolean {
    const invalidChars = /[<>:"/\\|?*]/g;
    return !invalidChars.test(filename);
  }

  static sanitizeFileName(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }
}