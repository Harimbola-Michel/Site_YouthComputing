import { Response, NextFunction, Request } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export class BaseController {
  protected sendSuccess<T>(res: Response, data: T, message?: string): void {
    res.status(200).json({
      success: true,
      message: message || 'Operation successful',
      data,
    });
  }

  protected sendCreated<T>(res: Response, data: T, message?: string): void {
    res.status(201).json({
      success: true,
      message: message || 'Resource created successfully',
      data,
    });
  }

  protected sendUpdated<T>(res: Response, data: T, message?: string): void {
    res.status(200).json({
      success: true,
      message: message || 'Resource updated successfully',
      data,
    });
  }

  protected sendDeleted<T>(res: Response, data: T, message?: string): void {
    res.status(200).json({
      success: true,
      message: message || 'Resource deleted successfully',
      data,
    });
  }

  protected sendError(res: Response, error: ApiError | Error): void {
    if (error instanceof ApiError) {
      const response: any = {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      };

      if (error.errors) {
        response.errors = error.errors;
      }

      if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
      }

      res.status(error.statusCode).json(response);
    } else {
      logger.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  protected handleError(next: NextFunction, error: unknown): void {
    if (error instanceof ApiError) {
      if (error.statusCode >= 500) {
        logger.error(`API Error ${error.statusCode}:`, {
          message: error.message,
          stack: error.stack,
          errors: error.errors,
        });
      }
      next(error);
    } else if (error instanceof Error) {
      logger.error('Unexpected error:', {
        message: error.message,
        stack: error.stack,
      });
      next(new ApiError(500, error.message));
    } else {
      logger.error('Unknown error:', error);
      next(new ApiError(500, 'An unknown error occurred'));
    }
  }

  protected getPaginationParams(req: Request): { page: number; limit: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    return { page, limit };
  }

  protected getSortParams(req: Request): { field: string; order: 'asc' | 'desc' } {
    const field = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    return { field, order };
  }

  protected getFilterParams(req: Request, allowedFields: string[]): Record<string, any> {
    const filters: Record<string, any> = {};
    
    for (const field of allowedFields) {
      const value = req.query[field];
      if (value !== undefined && value !== null && value !== '') {
        filters[field] = value;
      }
    }
    
    return filters;
  }

  /**
   * Récupère les paramètres de recherche communs (search, status, etc.)
   * À surcharger dans les contrôleurs enfants si nécessaire
   */
  protected getSearchParams(req: Request): Record<string, any> {
    const searchParams: Record<string, any> = {};
    const { search, status, paymentStatus, sessionId, formationId, ...rest } = req.query;
    
    if (search) searchParams.search = search;
    if (status) searchParams.status = status;
    if (paymentStatus) searchParams.paymentStatus = paymentStatus;
    if (sessionId) searchParams.sessionId = sessionId;
    if (formationId) searchParams.formationId = formationId;
    
    // Ajouter d'autres paramètres communs si nécessaire
    // On peut aussi utiliser rest pour les champs supplémentaires
    Object.keys(rest).forEach(key => {
      if (rest[key] !== undefined && rest[key] !== null && rest[key] !== '') {
        searchParams[key] = rest[key];
      }
    });
    
    return searchParams;
  }

  protected getUserIdFromRequest(req: Request): string {
    const user = (req as any).user;
    if (!user || !user.id) {
      throw new ApiError(401, 'User not authenticated');
    }
    return user.id;
  }

  protected getUserFromRequest(req: Request): any {
    const user = (req as any).user;
    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }
    return user;
  }

  protected checkAdmin(req: Request): void {
    const user = (req as any).user;
    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Admin access required');
    }
  }

  protected checkSuperAdmin(req: Request): void {
    const user = (req as any).user;
    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }
    if (user.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Super admin access required');
    }
  }

  protected checkMinRole(req: Request, minRole: string): void {
    const user = (req as any).user;
    if (!user) {
      throw new ApiError(401, 'User not authenticated');
    }
    
    const roleHierarchy: Record<string, number> = {
      'USER': 1,
      'CONTRIBUTOR': 2,
      'EDITOR': 3,
      'ADMIN': 4,
      'SUPER_ADMIN': 5,
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const minLevel = roleHierarchy[minRole] || 0;
    
    if (userLevel < minLevel) {
      throw new ApiError(403, `Minimum role ${minRole} required`);
    }
  }
}