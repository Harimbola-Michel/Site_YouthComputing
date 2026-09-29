// Core types
export * from './roles.enum';

// DTOs
export * from './dto/auth.dto';
export * from './dto/user.dto';
export * from './dto/formation.dto';
export * from './dto/registration.dto';
export * from './dto/y2c.dto';
export * from './dto/article.dto';
export * from './dto/project.dto';
export * from './dto/event.dto';
export * from './dto/contact.dto';
export * from './dto/payment.dto';
export * from './dto/partner.dto';
export * from './dto/recruitment.dto';
export * from './dto/candidature.dto';
export * from './dto/team-member.dto';
export * from './dto/dashboard.dto';
export * from './dto/common.dto';

// Express types
export * from './express.d';

// Socket types
export * from './socket.d';

// Generic types
export type ID = string;
export type Timestamp = Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  location?: string;
  key?: string;
  etag?: string;
}

export interface MulterFile extends Express.Multer.File {}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export type SortOrder = 'asc' | 'desc';

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: Array<{ index: number; error: string }>;
}