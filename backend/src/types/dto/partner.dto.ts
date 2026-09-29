import { PaginationParams } from '../index';

export interface PartnerDTO {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  email?: string;
  phone?: string;
  displayOrder?: number;
  createdAt: string; // ✅ ISO date string
  updatedAt: string; // ✅ ISO date string
}

export interface CreatePartnerDTO {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  email?: string;
  phone?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdatePartnerDTO {
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
  email?: string;
  phone?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PartnerFilterParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export interface PartnerListDTO {
  partners: PartnerDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Demande de partenariat (public)
export interface PartnerRequestDTO {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  website?: string;
}