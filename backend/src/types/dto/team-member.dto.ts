import { PaginationParams } from '../index';

export interface TeamMemberDTO {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  linkedin?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamMemberDTO {
  userId: string;
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  linkedin?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateTeamMemberDTO {
  role?: string;
  department?: string;
  bio?: string;
  photoUrl?: string;
  linkedin?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TeamMemberFilterParams extends PaginationParams {
  search?: string;
  department?: string;
  isActive?: boolean;
}

export interface TeamMemberListDTO {
  members: TeamMemberDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeamMemberOrderDTO {
  memberIds: string[];
}