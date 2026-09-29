// src/types/contact.types.ts
// ============================================================
import { PaginationParams } from './common.types';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt?: string;
  repliedBy?: string;
  replyContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageCreateDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageReplyDTO {
  replyContent: string;
}

export interface ContactMessageFilters extends PaginationParams {
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  byMonth: { month: string; count: number }[];
}