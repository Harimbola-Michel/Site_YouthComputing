export const APP_NAME = 'Youth Computing';
export const APP_VERSION = '1.0.0';

export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  REGISTRATION_CONFIRMATION: 'registration-confirmation',
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  RESET_PASSWORD: 'reset-password',
  CONTACT_REPLY: 'contact-reply',
  NEWSLETTER: 'newsletter',
  Y2C_WELCOME: 'y2c-welcome',
  Y2C_APPROVED: 'y2c-approved',
  EVENT_REGISTRATION: 'event-registration',
  INTERVIEW_SCHEDULED: 'interview-scheduled',
  APPLICATION_CONFIRMATION: 'application-confirmation',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  VIEWER: 'VIEWER',
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL: 'PARTIAL',
};

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_MONEY: 'MOBILE_MONEY',
  CARD: 'CARD',
  OTHER: 'OTHER',
};

export const REGISTRATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  WAITING_LIST: 'WAITING_LIST',
};

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
};

export const Y2C_MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
};

export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SCHEDULED: 'SCHEDULED',
};

export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED',
  EVALUATING: 'EVALUATING',
};

export const CANDIDATURE_STATUS = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEWED: 'INTERVIEWED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const INTERVIEW_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

export const NOTIFICATION_TYPES = {
  REGISTRATION: 'REGISTRATION',
  PAYMENT: 'PAYMENT',
  EVENT: 'EVENT',
  SYSTEM: 'SYSTEM',
  PROMOTION: 'PROMOTION',
  REMINDER: 'REMINDER',
};

export const ACTIVITY_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PUBLISH: 'PUBLISH',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
};

export const FORMATION_LEVELS = {
  BEGINNER: 'DÉBUTANT',
  INTERMEDIATE: 'INTERMÉDIAIRE',
  ADVANCED: 'AVANCÉ',
  EXPERT: 'EXPERT',
};

export const CURRENCIES = {
  MGA: 'MGA',
  EUR: 'EUR',
  USD: 'USD',
};

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc',
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 50 * 1024 * 1024, // 50MB
};

export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE_FR: 'DD/MM/YYYY',
  DATETIME_FR: 'DD/MM/YYYY HH:mm',
};

export const CACHE_KEYS = {
  USER: 'user:',
  FORMATION: 'formation:',
  ARTICLE: 'article:',
  PROJECT: 'project:',
  Y2C: 'y2c:',
  STATS: 'stats:',
  CONFIG: 'config:',
};

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

export const API_RATE_LIMITS = {
  DEFAULT: { windowMs: 15 * 60 * 1000, max: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 },
  REGISTRATION: { windowMs: 60 * 60 * 1000, max: 10 },
  CONTACT: { windowMs: 60 * 60 * 1000, max: 5 },
  API: { windowMs: 60 * 1000, max: 60 },
};

export const CORS_OPTIONS = {
  origins: ['http://localhost:3000', 'https://youthcomputing.mg', 'https://staging.youthcomputing.mg'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Pagination-Total', 'X-Pagination-Page', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400,
};

export const REDIS_CHANNELS = {
  NOTIFICATIONS: 'notifications',
  PRESENCE: 'presence',
  CHAT: 'chat',
  SYSTEM: 'system',
  ADMIN: 'admin',
};