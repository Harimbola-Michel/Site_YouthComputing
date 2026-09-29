// src/types/activity.types.ts
// ============================================================
import { ActivityType } from './enums';
import { PaginationParams, UserRef } from './common.types';

export interface ActivityLog {
  id: string;
  userId: string;
  user: UserRef;
  action: ActivityType;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export interface ActivityFilters extends PaginationParams {
  userId?: string;
  action?: ActivityType;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}