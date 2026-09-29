import { ProjectStatus } from '../roles.enum';
import { PaginationParams } from '../index';

export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  impact?: string;
  technologies: string[];
  images: string[];
  year: number;
  category: string;
  isFeatured: boolean;
  status: ProjectStatus;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metrics?: ProjectMetricDTO[];
}

export interface ProjectMetricDTO {
  id: string;
  projectId: string;
  metricKey: string;
  metricValue: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  objectives?: string;
  impact?: string;
  technologies: string[];
  images: string[];
  year: number;
  category: string;
  isFeatured?: boolean;
  status?: ProjectStatus;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  objectives?: string;
  impact?: string;
  technologies?: string[];
  images?: string[];
  year?: number;
  category?: string;
  isFeatured?: boolean;
  status?: ProjectStatus;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface CreateProjectMetricDTO {
  metricKey: string;
  metricValue: string;
  description?: string;
}

export interface UpdateProjectMetricDTO {
  metricValue?: string;
  description?: string;
}

export interface ProjectFilterParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: ProjectStatus;
  year?: number;
  technology?: string;
  isFeatured?: boolean;
}

export interface ProjectListDTO {
  projects: ProjectDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProjectStatsDTO {
  total: number;
  byStatus: {
    [key in ProjectStatus]?: number;
  };
  byCategory: {
    [key: string]: number;
  };
  byYear: {
    year: number;
    count: number;
  }[];
  featured: number;
  technologies: {
    name: string;
    count: number;
  }[];
}

export interface ProjectExportDTO {
  id: string;
  title: string;
  category: string;
  status: string;
  year: number;
  technologies: string;
  client?: string;
  createdAt: Date;
}