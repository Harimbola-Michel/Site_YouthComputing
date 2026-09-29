// src/controllers/formation.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { FormationService } from '../services/formation.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logger } from '../config/logger';

export class FormationController extends BaseController {
  private formationService: FormationService;

  constructor() {
    super();
    this.formationService = new FormationService();
  }

  // ─── Formations ──────────────────────────────────────────────

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      const formations = search
        ? await this.formationService.searchFormations(search)
        : await this.formationService.findAll(pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getAll formations:', error);
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.findById(id);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getById formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const formation = await this.formationService.findBySlug(slug);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getBySlug formation ${req.params.slug}:`, error);
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const formation = await this.formationService.create(req.body);
      this.sendCreated(res, formation);
    } catch (error) {
      logger.error('Error in create formation:', error);
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.update(id, req.body);
      this.sendUpdated(res, formation);
    } catch (error) {
      logger.error(`Error in update formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.formationService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      logger.error(`Error in delete formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  togglePublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.togglePublish(id);
      this.sendUpdated(res, formation);
    } catch (error) {
      logger.error(`Error in togglePublish formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getPublished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findPublished(pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getPublished formations:', error);
      this.handleError(next, error);
    }
  };

  getByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findByCategory(category, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error(`Error in getByCategory formation ${req.params.category}:`, error);
      this.handleError(next, error);
    }
  };

  getByLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { level } = req.params;
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findByLevel(level, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error(`Error in getByLevel formation ${req.params.level}:`, error);
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.formationService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Error in getStats formations:', error);
      this.handleError(next, error);
    }
  };

  getMostPopular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const formations = await this.formationService.getMostPopular(limit);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getMostPopular formations:', error);
      this.handleError(next, error);
    }
  };

  getWithSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const formation = await this.formationService.findWithSessions(id);
      this.sendSuccess(res, formation);
    } catch (error) {
      logger.error(`Error in getWithSessions formation ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getRecommended = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const formations = await this.formationService.getRecommended(limit);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getRecommended formations:', error);
      this.handleError(next, error);
    }
  };

  getFiltered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        category: req.query.category as string,
        level: req.query.level as string,
        isPublished: req.query.isPublished === 'true',
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };
      const pagination = this.getPaginationParams(req);
      const formations = await this.formationService.findFiltered(filters, pagination);
      this.sendSuccess(res, formations);
    } catch (error) {
      logger.error('Error in getFiltered formations:', error);
      this.handleError(next, error);
    }
  };

  // ─── Sessions ──────────────────────────────────────────────────

  createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formationId } = req.params;
      const session = await this.formationService.createSession(formationId, req.body);
      this.sendCreated(res, session);
    } catch (error) {
      logger.error('Error in createSession:', error);
      this.handleError(next, error);
    }
  };

  updateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const session = await this.formationService.updateSession(id, req.body);
      this.sendUpdated(res, session);
    } catch (error) {
      logger.error(`Error in updateSession ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.formationService.deleteSession(id);
      this.sendDeleted(res, null);
    } catch (error) {
      logger.error(`Error in deleteSession ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getSessionsByFormation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formationId } = req.params;
      const sessions = await this.formationService.getSessionsByFormation(formationId);
      this.sendSuccess(res, sessions);
    } catch (error) {
      logger.error(`Error in getSessionsByFormation ${req.params.formationId}:`, error);
      this.handleError(next, error);
    }
  };

  getSessionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const session = await this.formationService.getSessionById(id);
      this.sendSuccess(res, session);
    } catch (error) {
      logger.error(`Error in getSessionById ${req.params.id}:`, error);
      this.handleError(next, error);
    }
  };

  getUpcomingSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await this.formationService.getUpcomingSessions(limit);
      this.sendSuccess(res, sessions);
    } catch (error) {
      logger.error('Error in getUpcomingSessions:', error);
      this.handleError(next, error);
    }
  };

  getSessionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.formationService.getSessionStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Error in getSessionStats:', error);
      this.handleError(next, error);
    }
  };
}