// src/types/y2c.types.ts

// ============================================================
// ENUMS (définis localement pour éviter les imports circulaires)
// ============================================================
export enum Y2CMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export enum Y2CPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}


export enum Y2CEventType {
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  MEETUP = 'MEETUP',
  TEAM_SETUP = 'TEAM_SETUP',
  THREE_S = 'THREE_S',
  TEAM_REALIZE = 'TEAM_REALIZE',
  COFFREDAY = 'COFFREDAY',
  HACKATHON = 'HACKATHON',
  OTHER = 'OTHER',
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Y2CMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  membershipFeePaid: number;
  badgeNumber: string;       // peut être vide si non généré
  status: Y2CMemberStatus;
  joinedAt: string;          // Date au format ISO
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Y2CPayment {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  paymentMethod: string; // 'MOBILE_MONEY', 'BANK_TRANSFER', etc.
  paymentReference: string;
  status: Y2CPaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  member?: Y2CMember; // optionnel, pour les données jointes
}

// ✅ Ajout d’un champ dérivé (non renvoyé par le backend)
// mais on peut le définir comme propriété calculée côté frontend
export interface Y2CMemberWithAvatar extends Y2CMember {
  avatar?: string;
  // hasBadge n'est pas nécessaire car on le calcule : !!badgeNumber
}

export interface Y2CEvent {
  id: string;
  title: string;
  description: string;
  eventType: Y2CEventType;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  isPaid: boolean;
  price?: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  registrations?: Y2CEventRegistration[];
}

export interface Y2CEventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  status: string; // 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  attended: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface Y2CMemberCreateDTO {
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  membershipFeePaid: number;
}

export interface Y2CMemberUpdateDTO extends Partial<Y2CMemberCreateDTO> {
  status?: Y2CMemberStatus;
  badgeNumber?: string;
  expiresAt?: string;
}

export interface Y2CEventCreateDTO {
  title: string;
  description: string;
  eventType: Y2CEventType;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface Y2CEventUpdateDTO extends Partial<Y2CEventCreateDTO> {
  isPublished?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface Y2CMemberFilters extends PaginationParams {
  status?: Y2CMemberStatus;
  institution?: string;
  search?: string;
}

export interface Y2CEventFilters extends PaginationParams {
  eventType?: Y2CEventType;
  isPublished?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface Y2CStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  pendingMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  revenue: {
    total: number;
    thisMonth: number;
    thisYear: number;
  };
}

// ============================================================
// PAGINATION (ajout local si non disponible)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}