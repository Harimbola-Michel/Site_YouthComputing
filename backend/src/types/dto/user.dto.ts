import { Role, UserStatus } from '../roles.enum';
import { PaginationParams } from '../index';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  status: UserStatus;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
}

export interface UserListDTO {
  users: UserDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserFilterParams extends PaginationParams {
  search?: string;
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
}

export interface UserStatsDTO {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  byRole: {
    [key in Role]?: number;
  };
  newThisMonth: number;
  newThisWeek: number;
  lastLogin: Date | null;
}

export interface UserProfileUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface UserActivityDTO {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface UserPreferencesDTO {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}