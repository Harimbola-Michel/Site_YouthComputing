// backend/src/types/dto/candidature.dto.ts

// ============ PAGINATION (définition locale) ============
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ DTO PRINCIPAL ============
export interface CandidatureDTO {
  id: string;
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  interviews?: InterviewDTO[];
  evaluations?: EvaluationDTO[];
  recruitment?: {
    id: string;
    title: string;
    position: string;
  };
}

export interface InterviewDTO {
  id: string;
  candidatureId: string;
  scheduledAt: Date;
  interviewer: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationDTO {
  id: string;
  candidatureId: string;
  evaluatorId: string;
  evaluator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  criteria: string;
  score: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ CRÉATION / MISE À JOUR ============
// ✅ Ces DTOs ne contiennent PAS `candidatureId` (passé séparément)
export interface CreateCandidatureDTO {
  recruitmentId: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
}

export interface UpdateCandidatureDTO {
  status?: string;
  notes?: string;
}

// ✅ Pour les entretiens – `candidatureId` est fourni à part
export interface CreateInterviewDTO {
  scheduledAt: Date;
  interviewer: string;
  notes?: string;
}

export interface UpdateInterviewDTO {
  scheduledAt?: Date;
  interviewer?: string;
  notes?: string;
  status?: string;
}

// ✅ Pour les évaluations – `candidatureId` et `evaluatorId` sont fournis à part
export interface CreateEvaluationDTO {
  criteria: string;
  score: number;
  comments?: string;
}

// ============ FILTRES ET LISTES ============
export interface CandidatureFilterParams extends PaginationParams {
  search?: string;
  recruitmentId?: string;
  status?: string;
}

export interface CandidatureListDTO {
  candidatures: CandidatureDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CandidatureStatsDTO {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interviewed: number;
  accepted: number;
  rejected: number;
  byRecruitment: {
    [key: string]: number;
  };
}