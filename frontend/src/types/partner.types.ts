// src/types/partner.types.ts

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
// INTERFACES PRINCIPALES
// ============================================================
export interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface PartnerCreateDTO {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

export interface PartnerUpdateDTO extends Partial<PartnerCreateDTO> {
  isActive?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface PartnerFilters extends PaginationParams {
  isActive?: boolean;
  search?: string;
}

// ============================================================
// STATISTIQUES (ajouté pour compléter)
// ============================================================
export interface PartnerStats {
  total: number;
  active: number;
  inactive: number;
}