import { RegistrationStatus, PaymentStatus } from '@prisma/client';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegistrationDTO {
  id: string;
  sessionId: string;
  formationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  motivation?: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  formation?: { id: string; title: string };
  session?: { id: string; startDate: Date; endDate: Date; location: string; formation?: { id: string; title: string } };
}

export interface CreateRegistrationDTO {
  sessionId: string;
  formationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  motivation?: string;
  paymentAmount?: number;
  notes?: string;
  paymentReference?: string;
}

export interface UpdateRegistrationDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  motivation?: string;
  status?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentReference?: string;
  notes?: string;
}

export interface RegistrationFilterParams extends PaginationParams {
  search?: string;
  status?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  formationId?: string;
  sessionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface RegistrationListDTO {
  registrations: RegistrationDTO[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface RegistrationStatsDTO {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  waitingList: number;
  byPaymentStatus: { [key in PaymentStatus]?: number };
  today: number;
  thisWeek: number;
  thisMonth: number;
  revenue: { total: number; paid: number; pending: number };
}

export interface RegistrationExportDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  formation: string;
  session: string;
  status: string;
  paymentStatus: string;
  amount: number;
  registeredAt: Date;
}

export interface BulkRegistrationDTO {
  registrations: CreateRegistrationDTO[];
}

export interface BulkRegistrationResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; registration: CreateRegistrationDTO; error: string }>;
}