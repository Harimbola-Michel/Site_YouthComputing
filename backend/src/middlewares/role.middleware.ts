import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenException, UnauthorizedException } from '../exceptions';
import { logger } from '../config/logger';
import { Role, ROLE_HIERARCHY } from '../types/roles.enum';

export const requireRole = (
  ...allowedRoles: Role[]
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.user) {
        throw new UnauthorizedException('Authentication required');
      }

      if (!allowedRoles.includes(authReq.user.role as Role)) {
        logger.warn(
          `User ${authReq.user.email} (${authReq.user.role}) attempted to access resource requiring roles: ${allowedRoles.join(', ')}`
        );
        throw new ForbiddenException('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        next(error);
        return;
      }
      next(new ForbiddenException('Access denied'));
    }
  };
};

export const requireMinRole = (minRole: Role): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.user) {
        throw new UnauthorizedException('Authentication required');
      }

      const userLevel = ROLE_HIERARCHY[authReq.user.role as Role] || 0;
      const minLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < minLevel) {
        logger.warn(
          `User ${authReq.user.email} (${authReq.user.role}) attempted to access resource requiring minimum role: ${minRole}`
        );
        throw new ForbiddenException('Insufficient permissions');
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        next(error);
        return;
      }
      next(new ForbiddenException('Access denied'));
    }
  };
};

// Middlewares spécifiques pour chaque rôle
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);
export const requireAdmin = requireRole(Role.SUPER_ADMIN, Role.ADMIN);
export const requireEditor = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR);
export const requireContributor = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.CONTRIBUTOR);
export const requireViewer = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.CONTRIBUTOR, Role.VIEWER);

// Alias pour compatibilité avec l'ancien code
export const isAdmin: RequestHandler = requireAdmin;
export const isSuperAdmin: RequestHandler = requireSuperAdmin;
export const isEditor: RequestHandler = requireEditor;
export const isContributor: RequestHandler = requireContributor;
export const isViewer: RequestHandler = requireViewer;
export const isAuthenticated: RequestHandler = requireViewer;

// Fonctions utilitaires
export const hasRole = (user: any, role: Role): boolean => {
  return user?.role === role;
};

export const hasMinRole = (user: any, minRole: Role): boolean => {
  if (!user) return false;
  const userLevel = ROLE_HIERARCHY[user.role as Role] || 0;
  const minLevel = ROLE_HIERARCHY[minRole] || 0;
  return userLevel >= minLevel;
};

export const isUserAdmin = (user: any): boolean => {
  return hasMinRole(user, Role.ADMIN);
};

export const isUserSuperAdmin = (user: any): boolean => {
  return hasRole(user, Role.SUPER_ADMIN);
};

export default {
  requireRole,
  requireMinRole,
  requireSuperAdmin,
  requireAdmin,
  requireEditor,
  requireContributor,
  requireViewer,
  isAdmin,
  isSuperAdmin,
  isEditor,
  isContributor,
  isViewer,
  isAuthenticated,
  hasRole,
  hasMinRole,
  isUserAdmin,
  isUserSuperAdmin,
};