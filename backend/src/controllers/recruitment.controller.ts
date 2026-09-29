import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { RecruitmentService } from '../services/recruitment.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadCV } from '../middlewares/uploadCV.middleware';
import { ApiError } from '../utils/ApiError';

export class RecruitmentController extends BaseController {
  private recruitmentService: RecruitmentService;

  constructor() {
    super();
    this.recruitmentService = new RecruitmentService();
  }

  // ============ RECRUITMENTS ============
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const recruitments = await this.recruitmentService.findAll(pagination);
      this.sendSuccess(res, recruitments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const recruitment = await this.recruitmentService.findById(id);
      this.sendSuccess(res, recruitment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const recruitment = await this.recruitmentService.getBySlug(slug);
      this.sendSuccess(res, recruitment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruitment = await this.recruitmentService.create(req.body);
      this.sendCreated(res, recruitment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const recruitment = await this.recruitmentService.update(id, req.body);
      this.sendUpdated(res, recruitment);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.recruitmentService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recruitments = await this.recruitmentService.getActiveRecruitments();
      this.sendSuccess(res, recruitments);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.recruitmentService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ CANDIDATURES ============
  
  // ✅ Méthode avec upload du CV
  applyForPosition = [
    uploadCV.single('cv'), // le champ du formulaire doit s'appeler 'cv'
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const file = req.file;
        if (!file) {
          throw ApiError.badRequest('Le CV est requis.');
        }

        // Générer l'URL absolue du fichier
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const cvUrl = `${baseUrl}/uploads/cvs/${file.filename}`;

        // Ajouter cvUrl aux données du corps
        const data = {
          ...req.body,
          cvUrl,
        };

        const candidature = await this.recruitmentService.applyForPosition(data);
        this.sendCreated(res, candidature);
      } catch (error) {
        this.handleError(next, error);
      }
    },
  ];

  getCandidatures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const candidatures = await this.recruitmentService.getCandidatures(id);
      this.sendSuccess(res, candidatures);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateCandidatureStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const candidature = await this.recruitmentService.updateCandidatureStatus(id, status);
      this.sendUpdated(res, candidature);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getCandidatureStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const stats = await this.recruitmentService.getCandidatureStats(id);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}