import { FormationLevel } from '../roles.enum';
import { PaginationParams } from '../index';

// ─── Énumérations ──────────────────────────────────────────────
export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}

export enum MobileMoneyOperator {
  MVOLA = 'MVola',
  AIRTEL = 'Airtel Money',
  ORANGE = 'Orange Money',
  TELMA = 'Telma Money',
}

// ─── Interfaces ────────────────────────────────────────────────

export interface FormationDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: FormationLevel;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
  sessions?: FormationSessionDTO[];
  registrations?: RegistrationDTO[];
}

export interface FormationSessionDTO {
  id: string;
  formationId: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormationDTO {
  title: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price?: number;
  category: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

export interface UpdateFormationDTO {
  title?: string;
  description?: string;
  objectives?: string;
  prerequisites?: string;
  duration?: string;
  level?: FormationLevel;
  price?: number;
  category?: string;
  imageUrl?: string;
  isPublished?: boolean;
  maxParticipants?: number;
}

export interface CreateFormationSessionDTO {
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  price?: number;
}

export interface UpdateFormationSessionDTO {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
  price?: number;
  status?: string;
}

export interface FormationFilterParams extends PaginationParams {
  search?: string;
  category?: string;
  level?: FormationLevel;
  minPrice?: number;
  maxPrice?: number;
  isPublished?: boolean;
}

export interface FormationListDTO {
  formations: FormationDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FormationStatsDTO {
  total: number;
  published: number;
  draft: number;
  byCategory: {
    [key: string]: number;
  };
  byLevel: {
    [key in FormationLevel]?: number;
  };
  totalRegistrations: number;
  avgPrice: number;
  mostPopular?: FormationDTO;
}

export interface FormationRegistrationDTO {
  formationId: string;
  sessionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  motivation?: string;
}