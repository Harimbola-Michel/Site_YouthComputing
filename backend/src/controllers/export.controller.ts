// src/controllers/export.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';
import { BaseController } from './base.controller';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/ApiError';

export class ExportController extends BaseController {
  private exportService: ExportService;

  constructor() {
    super();
    this.exportService = new ExportService();
  }

  private getUserId(req: AuthRequest): string {
    if (!req.user || !req.user.id) {
      throw ApiError.unauthorized('Utilisateur non authentifié');
    }
    return req.user.id;
  }

  // ─── Création d’un export ──────────────────────────────────
  createExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const result = await this.exportService.createExport(userId, req.body);
      this.sendCreated(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Historique ────────────────────────────────────────────────
  getHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await this.exportService.getHistory(userId, page, limit);
      this.sendSuccess(res, history);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Récupération par ID ──────────────────────────────────────
  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { id } = req.params;
      const history = await this.exportService.getById(id, userId);
      this.sendSuccess(res, history);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Suppression ──────────────────────────────────────────────
  deleteExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { id } = req.params;
      await this.exportService.deleteExport(id, userId);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Téléchargement (depuis historique) ──────────────────────
  downloadExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const { id } = req.params;
      const { stream, fileName } = await this.exportService.getFileStream(id, userId);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      stream.pipe(res);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Statistiques ──────────────────────────────────────────────
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = this.getUserId(req);
      const stats = await this.exportService.getStats(userId);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Extraction des filtres ────────────────────────────────────
  private extractFilters(req: Request) {
    const { formationId, sessionId, status, paymentStatus, dateFrom, dateTo, search } = req.query;
    const filters: any = {};
    if (formationId) filters.formationId = formationId;
    if (sessionId) filters.sessionId = sessionId;
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (search) {
      filters.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) filters.createdAt.lte = new Date(dateTo as string);
    }
    return filters;
  }

  // ─── Envoi de fichier ──────────────────────────────────────────
  private sendFile(res: Response, result: any) {
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }

  // ─── Exports directs ──────────────────────────────────────────
  exportRegistrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportRegistrations(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportMembers(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportPayments(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportFormations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportFormations(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportProjects(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  exportArticles = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      this.getUserId(req);
      const { format } = req.params;
      const filters = this.extractFilters(req);
      const result = await this.exportService.exportArticles(format, filters);
      this.sendFile(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}