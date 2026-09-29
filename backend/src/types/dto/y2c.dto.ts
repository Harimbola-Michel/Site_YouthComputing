// src/types/dto/y2c.dto.ts
import { Y2CMemberStatus, EventType } from '../roles.enum';
import { PaginationParams } from '../index';

// ─── Membre Y2C ──────────────────────────────────────────────
export interface Y2CMemberDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  badgeNumber: string;
  status: Y2CMemberStatus;
  joinedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateY2CMemberDTO {
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  // ✅ suppression de membershipFeePaid et motivation
}

export interface UpdateY2CMemberDTO {
  name?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  institution?: string;
  status?: Y2CMemberStatus;
  badgeNumber?: string;
  expiresAt?: Date;
}

// ─── Événements ──────────────────────────────────────────────
export interface Y2CEventDTO {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants?: number;
  isPaid: boolean;
  price?: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  registrations?: Y2CEventRegistrationDTO[];
}

export interface CreateY2CEventDTO {
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface UpdateY2CEventDTO {
  title?: string;
  description?: string;
  eventType?: EventType;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

// ─── Inscriptions ────────────────────────────────────────────
export interface Y2CEventRegistrationDTO {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
  status: string;
  attended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateY2CEventRegistrationDTO {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  institution?: string;
}

// ─── Filtres ─────────────────────────────────────────────────
export interface Y2CMemberFilterParams extends PaginationParams {
  search?: string;
  status?: Y2CMemberStatus;
  institution?: string;
}

export interface Y2CEventFilterParams extends PaginationParams {
  search?: string;
  eventType?: EventType;
  isPublished?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// ─── Lists ───────────────────────────────────────────────────
export interface Y2CMemberListDTO {
  members: Y2CMemberDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Y2CEventListDTO {
  events: Y2CEventDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Statistiques ────────────────────────────────────────────
export interface Y2CStatsDTO {
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

// ─── Export ──────────────────────────────────────────────────
export interface Y2CMemberExportDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  status: string;
  joinedAt: Date;
  expiresAt?: Date;
}