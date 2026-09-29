import { PaginationParams } from '../index';

export interface RecruitmentDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  department: string;
  position: string;
  isActive: boolean;
  deadline?: Date;
  createdAt: Date;q
  updatedAt: Date;
  candidatures?: CandidatureDTO[];
}

export interface CreateRecruitmentDTO {
  title: string;
  description: string;
  requirements: string;
  department: string;
  position: string;
  isActive?: boolean;
  deadline?: Date;
}

export interface UpdateRecruitmentDTO {
  title?: string;
  description?: string;
  requirements?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  deadline?: Date;
}

export interface RecruitmentFilterParams extends PaginationParams {
  search?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface RecruitmentListDTO {
  recruitments: RecruitmentDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecruitmentStatsDTO {
  total: number;
  active: number;
  closed: number;
  byDepartment: {
    [key: string]: number;
  };
  totalCandidatures: number;
}