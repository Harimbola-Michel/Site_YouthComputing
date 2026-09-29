// src/types/index.ts

// ─── Exports existants ───
export * from './enums';
export * from './common.types';
export * from './user.types';
export * from './formation.types';
export * from './project.types';
export * from './article.types';
export * from './y2c.types';
export * from './payment.types';
export * from './partner.types';
export * from './recruitment.types';
export * from './event.types';
export * from './api.types';
export * from './socket.types';

// ─── Nouveaux exports ───
export * from './team.types';
export * from './contact.types';
export * from './notification.types';
export * from './activity.types';
export * from './dashboard.types';

// ─── Types génériques ───
export type ID = string;
export type Timestamp = string | Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

// ─── Pagination et réponses (déjà dans api.types et common.types) ───
// On les réexporte pour éviter les imports en double
export { PaginationParams } from './common.types';
export { PaginatedResponse, ApiResponse, ErrorResponse } from './api.types';
export { AuthTokens } from './common.types'; // ou depuis un fichier dédié

// Types génériques
export type ID = string;
export type Timestamp = string | Date;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface FileUpload {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  userId: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}