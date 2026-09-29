// src/types/recruitment.types.ts

// ============================================================
// PAGINATION (définie ici pour éviter l'import cassé)
// ============================================================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// ENUMS (alignés sur le backend)
// ============================================================
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

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Recruitment {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  department: string;
  position: string;
  isActive: boolean;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  candidatures?: Candidature[];
}

export interface Candidature {
  id: string;
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  status: CandidatureStatus; // ✅ utilise l'enum
  notes?: string;
  createdAt: string;
  updatedAt: string;
  interviews?: Interview[];
  evaluations?: Evaluation[];
}

export interface Interview {
  id: string;
  candidatureId: string;
  scheduledAt: string;
  interviewer: string;
  notes?: string;
  status: InterviewStatus; // ✅ utilise l'enum
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  candidatureId: string;
  evaluatorId: string;
  evaluator: User; // ✅ importé de './user.types'
  criteria: string;
  score: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface RecruitmentCreateDTO {
  title: string;
  description: string;
  requirements: string;
  department: string;
  position: string;
  isActive?: boolean;
  deadline?: string;
}

export interface RecruitmentUpdateDTO extends Partial<RecruitmentCreateDTO> {
  isActive?: boolean;
}

export interface CandidatureCreateDTO {
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
}

export interface CandidatureUpdateDTO {
  status?: CandidatureStatus;
  notes?: string;
}

export interface InterviewCreateDTO {
  candidatureId: string;
  scheduledAt: string;
  interviewer: string;
  notes?: string;
}

export interface InterviewUpdateDTO extends Partial<InterviewCreateDTO> {
  status?: InterviewStatus;
}

export interface EvaluationCreateDTO {
  candidatureId: string;
  criteria: string;
  score: number;
  comments?: string;
}

// ============================================================
// FILTRES
// ============================================================
export interface RecruitmentFilters extends PaginationParams {
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface CandidatureFilters extends PaginationParams {
  recruitmentId?: string;
  status?: CandidatureStatus;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface RecruitmentStats {
  total: number;
  active: number;
  closed: number;
  byDepartment: Record<string, number>;
  totalCandidatures: number;
  byCandidatureStatus: Record<CandidatureStatus, number>;
}