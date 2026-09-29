// src/types/team.types.ts
import { PaginationParams } from './common.types';

export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string | null;
}

export interface TeamMember {
  id: string;
  userId: string;
  user?: UserRef;      // camelCase (ex: include: { user: true })
  User?: UserRef;      // PascalCase (ex: include: { User: true })
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  linkedin?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberCreateDTO {
  userId: string;
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  linkedin?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TeamMemberUpdateDTO extends Partial<TeamMemberCreateDTO> {
  isActive?: boolean;
}

export interface TeamMemberFilters extends PaginationParams {
  department?: string;
  isActive?: boolean;
  search?: string;
}

export interface TeamStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
}