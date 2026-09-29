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

export enum EventType {
  TRAINING = 'TRAINING',
  CONFERENCE = 'CONFERENCE',
  WORKSHOP = 'WORKSHOP',
  MEETUP = 'MEETUP',
  TEAM_SETUP = 'TEAM_SETUP',
  THREE_S = 'THREE_S',
  TEAM_REALIZE = 'TEAM_REALIZE',
  COFFREDAY = 'COFFREDAY',
  HACKATHON = 'HACKATHON',
  OTHER = 'OTHER',
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

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum FormationLevel {
  BEGINNER = 'DÉBUTANT',
  INTERMEDIATE = 'INTERMÉDIAIRE',
  ADVANCED = 'AVANCÉ',
  EXPERT = 'EXPERT',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 5,
  [Role.ADMIN]: 4,
  [Role.EDITOR]: 3,
  [Role.CONTRIBUTOR]: 2,
  [Role.VIEWER]: 1,
};

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

export const FORMATION_LEVEL_LABELS: Record<FormationLevel, string> = {
  [FormationLevel.BEGINNER]: 'Débutant',
  [FormationLevel.INTERMEDIATE]: 'Intermédiaire',
  [FormationLevel.ADVANCED]: 'Avancé',
  [FormationLevel.EXPERT]: 'Expert',
};

// Fonctions utilitaires
export const hasMinRole = (userRole: Role, minRole: Role): boolean => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
};

export const isAdminRole = (role: Role): boolean => {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
};

export const isSuperAdminRole = (role: Role): boolean => {
  return role === Role.SUPER_ADMIN;
};

export const isActiveStatus = (status: UserStatus): boolean => {
  return status === UserStatus.ACTIVE;
};

export const isValidStatusTransition = (
  currentStatus: UserStatus,
  newStatus: UserStatus
): boolean => {
  const validTransitions: Record<UserStatus, UserStatus[]> = {
    [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED],
    [UserStatus.ACTIVE]: [UserStatus.INACTIVE, UserStatus.SUSPENDED],
    [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.INACTIVE],
    [UserStatus.INACTIVE]: [UserStatus.ACTIVE],
  };
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getRoleLabel = (role: Role): string => {
  return ROLE_LABELS[role] || role;
};

export const getUserStatusLabel = (status: UserStatus): string => {
  return USER_STATUS_LABELS[status] || status;
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  return PAYMENT_STATUS_LABELS[status] || status;
};

export const getFormationLevelLabel = (level: FormationLevel): string => {
  return FORMATION_LEVEL_LABELS[level] || level;
};