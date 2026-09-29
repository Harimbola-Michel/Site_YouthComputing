import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DashboardController extends BaseController {
  private dashboardService: DashboardService;

  constructor() {
    super();
    // ✅ Instanciation correcte du service
    this.dashboardService = new DashboardService();
  }

  /**
   * 📊 Récupère toutes les statistiques du tableau de bord
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dashboardService.getDashboardData(req.user?.id);
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * 📈 Récupère les données de graphique (type, période)
   */
  getChartData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, period } = req.query;
      if (!type || !period) {
        throw new Error('Missing required query parameters: type and period');
      }
      const data = await this.dashboardService.getChartData(
        type as string,
        period as string
      );
      this.sendSuccess(res, data);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * 📋 Liste des activités récentes
   */
  getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await this.dashboardService.getRecentActivities(limit);
      this.sendSuccess(res, activities);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * 🔔 Notifications de l'utilisateur connecté
   */
  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const notifications = await this.dashboardService.getNotifications(userId, limit);
      this.sendSuccess(res, notifications);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * ⚡ Statistiques rapides (pour les widgets)
   */
  getQuickStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dashboardService.getQuickStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * 📊 Métriques de performance
   */
  getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const performance = await this.dashboardService.getPerformanceMetrics();
      this.sendSuccess(res, performance);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  /**
   * 🧩 Configuration des widgets
   */
  getWidgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const widgets = await this.dashboardService.getWidgets();
      this.sendSuccess(res, widgets);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}