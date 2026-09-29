import { ExportType, ExportFormat, ExportStatus } from '@prisma/client';

export interface ExportFilterDTO {
  type: ExportType;
  format: ExportFormat;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    paymentStatus?: string;
    formationId?: string;
    sessionId?: string;
    userId?: string;
    search?: string;
  };
}

export interface ExportHistoryDTO {
  id: string;
  type: ExportType;
  format: ExportFormat;
  filters: any;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  status: ExportStatus;
  error?: string;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ExportHistoryListDTO {
  items: ExportHistoryDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportResultDTO {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  format: ExportFormat;
  type: ExportType;
}