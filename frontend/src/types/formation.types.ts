// src/types/formation.types.ts

// ============================================================
// PAGINATION (définie ici pour éviter l'import cassé)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// ENUMS (alignés sur le backend Prisma)
// ============================================================
export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  WAITING_LIST = 'WAITING_LIST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export enum FormationLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: FormationLevel; // ✅ corrigé : utilise l'enum
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  sessions?: FormationSession[];
  registrations?: Registration[];
}

export interface FormationSession {
  id: string;
  formationId: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string; // ex: "SCHEDULED", "ONGOING", etc.
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  sessionId: string;
  formationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  motivation?: string;
  status: RegistrationStatus; // ✅ type enum
  paymentStatus: PaymentStatus; // ✅ type enum
  paymentAmount?: number;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface FormationCreateDTO {
  title: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: FormationLevel; // ✅ corrigé
  price: number;
  category: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

export interface FormationUpdateDTO extends Partial<FormationCreateDTO> {}

// ============================================================
// FILTRES
// ============================================================
export interface FormationFilters extends PaginationParams {
  category?: string;
  level?: FormationLevel; // ✅ corrigé
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface FormationStats {
  total: number;
  published: number;
  draft: number;
  byCategory: Record<string, number>;
  byLevel: Record<FormationLevel, number>; // ✅ clé typée
  totalRegistrations: number;
  avgPrice: number;
  mostPopular?: Formation;
}

// ============================================================
// EXPORT (types liés aux formations)
// ============================================================
export enum ExportType {
  FORMATIONS = 'FORMATIONS',
  INSCRIPTIONS = 'INSCRIPTIONS',
  PAIEMENTS = 'PAIEMENTS',
  MEMBRES_Y2C = 'MEMBRES_Y2C',
  ARTICLES = 'ARTICLES',
  PROJETS = 'PROJETS',
  UTILISATEURS = 'UTILISATEURS',
  RECRUTEMENTS = 'RECRUTEMENTS',
  CANDIDATURES = 'CANDIDATURES',
  CONTACTS = 'CONTACTS',
}

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

export enum ExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  paymentStatus?: string;
  formationId?: string;
  sessionId?: string;
  userId?: string;
  search?: string;
}

export interface ExportHistory {
  id: string;
  type: ExportType;
  format: ExportFormat;
  filters: ExportFilters;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  status: ExportStatus;
  error?: string;
  requestedBy: string;
  createdAt: string;
  completedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ExportHistoryList {
  items: ExportHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportStats {
  total: number;
  byStatus: Record<ExportStatus, number>;
  byType: Record<ExportType, number>;
}