import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { PartnerService } from '../services/partner.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PartnerController extends BaseController {
  private partnerService: PartnerService;

  constructor() {
    super();
    this.partnerService = new PartnerService();
  }

  // ─── Routes publiques ──────────────────────────────────────

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const search = req.query.search as string;
      const partners = await this.partnerService.findAll({ ...pagination, search });
      this.sendSuccess(res, partners);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const partner = await this.partnerService.findById(id);
      this.sendSuccess(res, partner);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partners = await this.partnerService.getActivePartners();
      this.sendSuccess(res, partners);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ✅ Demande de partenariat (publique)
  requestPartnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.partnerService.requestPartnership(req.body);
      this.sendCreated(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Routes admin ──────────────────────────────────────────

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partner = await this.partnerService.create(req.body);
      this.sendCreated(res, partner);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const partner = await this.partnerService.update(id, req.body);
      this.sendUpdated(res, partner);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.partnerService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const partner = await this.partnerService.toggleActive(id);
      this.sendUpdated(res, partner);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.partnerService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}