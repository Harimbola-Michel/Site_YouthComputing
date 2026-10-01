import { API_URL } from './env';

export const API_BASE_URL = API_URL;

export const APP_NAME = 'Youth Computing';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  VIEWER: 'VIEWER',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL: 'PARTIAL',
} as const;

export const REGISTRATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  WAITING_LIST: 'WAITING_LIST',
} as const;

export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SCHEDULED: 'SCHEDULED',
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED',
  EVALUATING: 'EVALUATING',
} as const;

export const EVENT_TYPES = {
  TRAINING: 'TRAINING',
  CONFERENCE: 'CONFERENCE',
  WORKSHOP: 'WORKSHOP',
  MEETUP: 'MEETUP',
  TEAM_SETUP: 'TEAM_SETUP',
  THREE_S: 'THREE_S',
  TEAM_REALIZE: 'TEAM_REALIZE',
  COFFREDAY: 'COFFREDAY',
  HACKATHON: 'HACKATHON',
  OTHER: 'OTHER',
} as const;

export const NOTIFICATION_TYPES = {
  REGISTRATION: 'REGISTRATION',
  PAYMENT: 'EVENT',
  SYSTEM: 'SYSTEM',
  PROMOTION: 'PROMOTION',
  REMINDER: 'REMINDER',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc' as const,
};

export const DATE_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};