// src/types/event.types.ts

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
// TYPES D'ÉVÉNEMENTS (alignés sur le backend)
// ============================================================
export type EventType =
  | 'TRAINING'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'MEETUP'
  | 'TEAM_SETUP'
  | 'THREE_S'
  | 'TEAM_REALIZE'
  | 'COFFREDAY'
  | 'HACKATHON'
  | 'OTHER';

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================
export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  maxAttendees?: number;
  isPaid: boolean;
  price?: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  registrations?: EventRegistration[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  attended: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DTOs
// ============================================================
export interface EventCreateDTO {
  title: string;
  description: string;
  eventType: EventType; // utilise le type union
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  maxAttendees?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface EventUpdateDTO extends Partial<EventCreateDTO> {
  isPublished?: boolean;
}

// ============================================================
// FILTRES
// ============================================================
export interface EventFilters extends PaginationParams {
  eventType?: EventType;
  isPublished?: boolean;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

// ============================================================
// STATISTIQUES
// ============================================================
export interface EventStats {
  total: number;
  upcoming: number;
  past: number;
  byType: Record<EventType, number>;
  totalRegistrations: number;
  averageAttendees: number;
  popularEvents: Event[];
}