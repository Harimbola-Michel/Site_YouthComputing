// src/types/user.types.ts

// ============================================================
// ENUMS (doivent correspondre au backend)
// ============================================================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

// ============================================================
// PAGINATION (pour les filtres)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// UTILISATEUR
// ============================================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  status: UserStatus;
  isActive: boolean;
  lastLogin?: string;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[]; // ✅ ajouté pour `hasPermission`
}

// ============================================================
// DTOs
// ============================================================
export interface UserCreateDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface UserFilters extends PaginationParams {
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
  search?: string;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
    suspended: number;
    byRole: Record<Role, number>;
    newThisMonth: number;
    newThisWeek: number;
  }