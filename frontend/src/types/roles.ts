// src/types/enums.ts

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  WAITING_LIST = 'WAITING_LIST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL = 'PARTIAL',
}

export enum Y2CMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  EVALUATING = 'EVALUATING',
}

export enum NotificationType {
  REGISTRATION = 'REGISTRATION',
  PAYMENT = 'PAYMENT',
  EVENT = 'EVENT',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
  REMINDER = 'REMINDER',
}

export enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PUBLISH = 'PUBLISH',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum CandidatureStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

// Libellés (utiles pour l’affichage)
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Administrateur',
  [Role.ADMIN]: 'Administrateur',
  [Role.EDITOR]: 'Éditeur',
  [Role.CONTRIBUTOR]: 'Contributeur',
  [Role.VIEWER]: 'Visiteur',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Actif',
  [UserStatus.INACTIVE]: 'Inactif',
  [UserStatus.SUSPENDED]: 'Suspendu',
  [UserStatus.PENDING]: 'En attente',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.PAID]: 'Payé',
  [PaymentStatus.FAILED]: 'Échoué',
  [PaymentStatus.REFUNDED]: 'Remboursé',
  [PaymentStatus.PARTIAL]: 'Partiel',
};