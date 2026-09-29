import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { CandidatureService } from '../services/candidature.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CandidatureController extends BaseController {
  private candidatureService: CandidatureService;

  constructor() {
    super();
    this.candidatureService = new CandidatureService();
  }

  // ============ CANDIDATURES ============

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination = this.getPaginationParams(req);
      const candidatures = await this.candidatureService.findAll(pagination);
      this.sendSuccess(res, candidatures);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const candidature = await this.candidatureService.findById(id);
      this.sendSuccess(res, candidature);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getByRecruitment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { recruitmentId } = req.params;
      const candidatures = await this.candidatureService.getByRecruitment(recruitmentId);
      this.sendSuccess(res, candidatures);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidature = await this.candidatureService.create(req.body);
      this.sendCreated(res, candidature);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const candidature = await this.candidatureService.update(id, req.body);
      this.sendUpdated(res, candidature);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.candidatureService.delete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.candidatureService.getStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ INTERVIEWS ============

  scheduleInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const interview = await this.candidatureService.scheduleInterview(id, req.body);
      this.sendCreated(res, interview);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  updateInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const interview = await this.candidatureService.updateInterview(id, req.body);
      this.sendUpdated(res, interview);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const interviews = await this.candidatureService.getInterviews(id);
      this.sendSuccess(res, interviews);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ EVALUATIONS ============

  addEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const evaluatorId = req.user?.id;
      if (!evaluatorId) {
        throw new Error('User not authenticated');
      }
      const evaluation = await this.candidatureService.addEvaluation(id, req.body, evaluatorId);
      this.sendCreated(res, evaluation);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getEvaluations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const evaluations = await this.candidatureService.getEvaluations(id);
      this.sendSuccess(res, evaluations);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getAverageScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const score = await this.candidatureService.getAverageScore(id);
      this.sendSuccess(res, { averageScore: score });
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ============ ENVOI DU RAPPORT ============

  sendEvaluationReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.candidatureService.sendEvaluationReport(id);
      this.sendSuccess(res, null, 'Rapport d’évaluation envoyé');
    } catch (error) {
      this.handleError(next, error);
    }
  };
}