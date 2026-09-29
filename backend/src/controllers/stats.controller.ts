import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { StatsService } from '../services/stats.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class StatsController extends BaseController {
  private statsService: StatsService;

  constructor() {
    super();
    this.statsService = new StatsService();
  }

  getGlobalStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.statsService.getGlobalStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getDailyStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const stats = await this.statsService.getDailyStats(date);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMonthlyStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const stats = await this.statsService.getMonthlyStats(year, month);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getYearlyStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const stats = await this.statsService.getYearlyStats(year);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getRealtimeStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.statsService.getRealtimeStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}