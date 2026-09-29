import { BaseService } from './base.service';
import { FormationRepository } from '../repositories/formation.repository';
import { FormationSessionRepository } from '../repositories/formationSession.repository';
import {
  CreateFormationDTO,
  UpdateFormationDTO,
  CreateFormationSessionDTO,
  UpdateFormationSessionDTO,
} from '../types/dto/formation.dto';
import { Formation, FormationSession } from '@prisma/client';
import { NotFoundException } from '../exceptions';
import { logger } from '../config/logger';
import { generateUniqueSlug } from '../utils/slugify';

export class FormationService extends BaseService<Formation, CreateFormationDTO, UpdateFormationDTO> {
  private formationRepository: FormationRepository;
  private sessionRepository: FormationSessionRepository;

  constructor() {
    super(new FormationRepository());
    this.formationRepository = new FormationRepository();
    this.sessionRepository = new FormationSessionRepository();
  }

  // ─── CRUD avec slug ──────────────────────────────────────────

  async create(data: CreateFormationDTO): Promise<Formation> {
    const slug = await generateUniqueSlug(data.title, 'formation');
    return this.formationRepository.create({
      ...data,
      slug,
      isPublished: data.isPublished ?? false,
    });
  }

  async update(id: string, data: UpdateFormationDTO): Promise<Formation> {
    const formation = await this.formationRepository.findByIdOrThrow(id);
    let slug = formation.slug;
    if (data.title && data.title !== formation.title) {
      slug = await generateUniqueSlug(data.title, 'formation');
    }
    return this.formationRepository.update(id, { ...data, slug });
  }

  // ─── Surcharge de delete ──────────────────────────────────
  async delete(id: string): Promise<Formation> {
    try {
      await this.formationRepository.findByIdOrThrow(id);
      return await this.formationRepository.delete(id);
    } catch (error) {
      logger.error(`Error in delete formation ${id}:`, error);
      throw error;
    }
  }

  // ─── Méthodes existantes ──────────────────────────────────
  async findBySlug(slug: string): Promise<Formation> {
    const formation = await this.formationRepository.findBySlug(slug);
    if (!formation) throw NotFoundException.slug(slug);
    return formation;
  }

  async findPublished(pagination?: { page: number; limit: number }): Promise<Formation[]> {
    return this.formationRepository.findPublished(pagination);
  }

  async findByCategory(category: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    return this.formationRepository.findByCategory(category, pagination);
  }

  async findByLevel(level: string, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    return this.formationRepository.findByLevel(level, pagination);
  }

  async searchFormations(search: string): Promise<Formation[]> {
    return this.formationRepository.searchFormations(search);
  }

  async getStats() {
    return this.formationRepository.getStats();
  }

  async getMostPopular(limit: number = 5): Promise<Formation[]> {
    return this.formationRepository.getMostPopular(limit);
  }

  async findWithSessions(id: string): Promise<Formation | null> {
    return this.formationRepository.findWithSessions(id);
  }

  async getRecommended(limit: number = 5): Promise<Formation[]> {
    return this.formationRepository.getRecommended(limit);
  }

  async findFiltered(filters: any, pagination?: { page: number; limit: number }): Promise<Formation[]> {
    return this.formationRepository.findFiltered(filters, pagination);
  }

  async togglePublish(id: string): Promise<Formation> {
    return this.formationRepository.togglePublish(id);
  }

  async updateMetrics(id: string, metrics: any): Promise<Formation> {
    await this.formationRepository.findByIdOrThrow(id);
    return this.formationRepository.updateMetrics(id, metrics);
  }

  async findBySlugOrThrow(slug: string): Promise<Formation> {
    return this.formationRepository.findBySlugOrThrow(slug);
  }

  // ─── Gestion des sessions ──────────────────────────────────
  async createSession(formationId: string, data: CreateFormationSessionDTO): Promise<FormationSession> {
    await this.formationRepository.findByIdOrThrow(formationId);
    // ✅ Utilisation de la relation avec majuscule "Formation" comme défini dans Prisma
    return this.sessionRepository.create({
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      location: data.location,
      maxParticipants: data.maxParticipants || 20,
      currentParticipants: 0,
      status: 'SCHEDULED',
      Formation: { connect: { id: formationId } }
    });
  }

  async updateSession(id: string, data: UpdateFormationSessionDTO): Promise<FormationSession> {
    await this.sessionRepository.findByIdOrThrow(id);
    // Gérer les dates si présentes
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    return this.sessionRepository.update(id, updateData);
  }

  async deleteSession(id: string): Promise<FormationSession> {
    await this.sessionRepository.findByIdOrThrow(id);
    return this.sessionRepository.delete(id);
  }

  async getSessionById(id: string): Promise<FormationSession | null> {
    return this.sessionRepository.findById(id);
  }

  async getSessionsByFormation(formationId: string): Promise<FormationSession[]> {
    return this.sessionRepository.findByFormationId(formationId);
  }

  async getUpcomingSessions(limit: number = 10): Promise<FormationSession[]> {
    return this.sessionRepository.findUpcomingSessions(limit);
  }

  async getSessionStats() {
    return this.sessionRepository.getStats();
  }
}