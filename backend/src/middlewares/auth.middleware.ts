// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';

// Interface pour étendre Request avec l'utilisateur
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Middleware d'authentification – vérifie le token JWT et attache l'utilisateur à req.user
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as TokenPayload | null;

    if (!decoded) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is disabled');
    }

    (req as AuthRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ✅ Alias pour compatibilité avec l'ancien nom
export const authMiddleware = authenticate;

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    next();
  };
};

/**
 * Fonction utilitaire pour vérifier si un utilisateur est authentifié (sans lancer d'erreur)
 */
export const isAuthenticated = (req: Request): boolean => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    return !!decoded;
  } catch {
    return false;
  }
};

/**
 * Récupérer l'utilisateur depuis le token (utilisé dans les websockets ou autres)
 */
export const getUserFromToken = (token: string): TokenPayload | null => {
  try {
    return verifyAccessToken(token) as TokenPayload | null;
  } catch {
    return null;
  }
};