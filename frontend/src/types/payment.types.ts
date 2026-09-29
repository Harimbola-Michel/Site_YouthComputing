// src/types/payment.types.ts

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
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Payment {
  id: string;
  registrationId?: string;
  y2cMemberId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  status: PaymentStatus; // ✅ utilise l'enum
  metadata?: Record<string, any>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface PaymentCreateDTO {
  registrationId?: string;
  y2cMemberId?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentReference: string;
  metadata?: Record<string, any>;
}

export interface PaymentUpdateDTO {
  status?: PaymentStatus;
  metadata?: Record<string, any>;
  paidAt?: string;
}

// ============================================================
// FILTRES
// ============================================================
export interface PaymentFilters extends PaginationParams {
  status?: PaymentStatus;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: Record<
    PaymentStatus, // ✅ clé typée avec l'enum
    {
      count: number;
      amount: number;
    }
  >;
  byMethod: Record<
    string,
    {
      count: number;
      amount: number;
    }
  >;
  today: { count: number; amount: number };
  thisMonth: { count: number; amount: number };
  thisYear: { count: number; amount: number };
}