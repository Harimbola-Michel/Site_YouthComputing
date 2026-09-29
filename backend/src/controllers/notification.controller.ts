import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

export class NotificationController extends BaseController {
  private notificationService: NotificationService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
  }

  /**
   * Récupère les notifications de l'utilisateur connecté
   * - Si l'utilisateur est ADMIN ou SUPER_ADMIN : renvoie toutes les notifications (avec filtres possibles)
   * - Sinon : renvoie uniquement ses notifications personnelles
   * GET /api/notifications
   */
  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('Non authentifié');
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      const pagination = this.getPaginationParams(req);

      // Si l'utilisateur est admin, il peut tout voir
      if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
        // Utiliser la méthode admin avec filtres
        const filters = {
          userId: req.query.userId as string,
          type: req.query.type as any,
          isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
          startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
          page: pagination.page,
          limit: pagination.limit,
        };
        const result = await this.notificationService.getAllWithFilters(filters);
        this.sendSuccess(res, result);
      } else {
        // Utilisateur standard : ses propres notifications
        const result = await this.notificationService.getByUser(userId, pagination);
        this.sendSuccess(res, result);
      }
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Anciennes méthodes renommées ou conservées ──────────────

  // GET /api/notifications/my (pour compatibilité)
  getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const userId = req.user.id;
      const pagination = this.getPaginationParams(req);
      const result = await this.notificationService.getByUser(userId, pagination);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // GET /api/notifications/unread-count
  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      this.sendSuccess(res, count);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // PUT /api/notifications/:id/read
  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const { id } = req.params;
      const userId = req.user.id;
      const notification = await this.notificationService.markAsRead(id, userId);
      this.sendUpdated(res, notification);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // PUT /api/notifications/read-all
  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const userId = req.user.id;
      const result = await this.notificationService.markAllAsRead(userId);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // DELETE /api/notifications/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new Error('Non authentifié');
      const { id } = req.params;
      const userId = req.user.id;
      await this.notificationService.delete(id, userId);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // ─── Routes admin (supplémentaires) ──────────────────────────────

  // POST /api/notifications/admin (créer une notification)
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.notificationService.create(req.body);
      this.sendCreated(res, notification);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  // DELETE /api/notifications/admin/:id (suppression admin)
  deleteAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.notificationService.adminDelete(id);
      this.sendDeleted(res, null);
    } catch (error) {
      this.handleError(next, error);
    }
  };
}