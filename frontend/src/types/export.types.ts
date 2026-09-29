// src/types/export.types.ts
// ============================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export type ExportStatus = 'completed' | 'failed' | 'pending';

export type ExportType =
  | 'registrations'
  | 'members'
  | 'payments'
  | 'formations'
  | 'projects'
  | 'articles';

// ─── Options d'export ──────────────────────────────────────────
export interface ExportOptions {
  format: ExportFormat;
  filters?: any;
  columns?: string[];
  limit?: number;
}

export interface ExportResult {
  buffer: Buffer; // ou ArrayBuffer selon le contexte
  filename: string;
  contentType: string;
}

export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Élément de l'historique ─────────────────────────────────
export interface ExportHistoryItem {
  id: string;
  type: ExportType; // ou string selon l'API
  format: ExportFormat;
  date: string;
  status: ExportStatus;
  filename?: string;
  fileSize?: number;
  error?: string;
}

// ─── Pagination (si non définie ailleurs) ─────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Réponse de l'API historique ──────────────────────────────
export interface ExportHistoryResponse {
  items: ExportHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}