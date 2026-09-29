export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SuccessResponseDTO<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export interface IdParamDTO {
  id: string;
}

export interface SlugParamDTO {
  slug: string;
}

export interface DateRangeDTO {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchQueryDTO {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkOperationDTO {
  ids: string[];
}

export interface FileUploadDTO {
  file: Express.Multer.File;
  folder?: string;
  publicId?: string;
}

export interface FileUploadResultDTO {
  id: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export interface ExportOptionsDTO {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields?: string[];
  filters?: Record<string, any>;
}

export interface EmailDTO {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachmentDTO[];
}

export interface EmailAttachmentDTO {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface NotificationDTO {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export interface AuditLogDTO {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface CacheOptionsDTO {
  key: string;
  ttl?: number;
  tags?: string[];
}

export interface HealthCheckDTO {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  database: boolean;
  redis: boolean;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  cpu: number;
}

export interface VersionDTO {
  version: string;
  name: string;
  environment: string;
  buildDate: Date;
  commit: string;
}

export interface StatsSummaryDTO {
  total: number;
  active: number;
  inactive: number;
  new: number;
  updated: number;
  deleted: number;
}

export interface ConfigDTO {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxFileSize: number;
    maxUploadFiles: number;
    rateLimit: number;
  };
}