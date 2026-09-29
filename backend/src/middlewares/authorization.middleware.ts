import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import prisma from '../../prisma/client';
import { Role } from '../types/roles.enum';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`User ${req.user.email} (${req.user.role}) attempted unauthorized access`);
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(ApiError.forbidden('Access denied'));
      }
    }
  };
};

export const isAdmin = authorize(['SUPER_ADMIN', 'ADMIN']);
export const isSuperAdmin = authorize(['SUPER_ADMIN']);
export const isEditor = authorize(['SUPER_ADMIN', 'ADMIN', 'EDITOR']);
export const isContributor = authorize(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR']);

export const checkOwnership = (
  getResourceOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (authReq.user.role === 'SUPER_ADMIN' || authReq.user.role === 'ADMIN') {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);
      if (!ownerId) {
        throw ApiError.notFound('Resource not found');
      }

      if (authReq.user.id !== ownerId) {
        throw ApiError.forbidden('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(ApiError.forbidden('Access denied'));
      }
    }
  };
};

export const checkResourceAccess = (
  getResourceId: (req: Request) => string,
  resourceType: string
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const resourceId = getResourceId(req);
      
      const resource = await (prisma as any)[resourceType].findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });

      if (!resource) {
        throw ApiError.notFound(`${resourceType} not found`);
      }

      if (authReq.user.role === 'SUPER_ADMIN' || authReq.user.role === 'ADMIN') {
        return next();
      }

      if (authReq.user.id !== resource.userId) {
        throw ApiError.forbidden('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(ApiError.forbidden('Access denied'));
      }
    }
  };
};

export const requirePermission = (permissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const userPermissions = await getUserPermissions(req.user.id);
      const hasPermission = permissions.some(p => userPermissions.includes(p));

      if (!hasPermission) {
        throw ApiError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(ApiError.forbidden('Access denied'));
      }
    }
  };
};

async function getUserPermissions(userId: string): Promise<string[]> {
  // Placeholder - implement based on your permission system
  return [];
}