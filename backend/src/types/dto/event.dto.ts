import { EventType } from '../roles.enum';
import { PaginationParams } from '../index';

export interface EventDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  time: string;
  location: string;
  maxAttendees?: number;
  isPaid: boolean;
  price?: number; 
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  registrations?: EventRegistrationDTO[];
}

export interface EventRegistrationDTO {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  attended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  time: string;
  location: string;
  maxAttendees?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  eventType?: EventType;
  startDate?: Date;
  endDate?: Date;
  time?: string;
  location?: string;
  maxAttendees?: number;
  isPaid?: boolean;
  price?: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface CreateEventRegistrationDTO {
  name: string;
  email: string;
  phone: string;
}

export interface EventFilterParams extends PaginationParams {
  search?: string;
  eventType?: EventType;
  isPublished?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
}

export interface EventListDTO {
  events: EventDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventStatsDTO {
  total: number;
  upcoming: number;
  past: number;
  byType: {
    [key in EventType]?: number;
  };
  totalRegistrations: number;
  averageAttendees: number;
  popularEvents: EventDTO[];
}

export interface EventRegistrationListDTO {
  registrations: EventRegistrationDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventExportDTO {
  id: string;
  title: string;
  eventType: string;
  date: Date;
  location: string;
  registrations: number;
  status: string;
}