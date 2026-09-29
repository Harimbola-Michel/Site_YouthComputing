import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Role } from '../types/roles.enum';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role | string;
  firstName?: string;
  lastName?: string;
}

export interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const accessPayload: AccessTokenPayload = {
      ...payload,
      type: 'access',
    };
    
    const secret = env.JWT_ACCESS_SECRET || env.JWT_SECRET || 'your-secret-key';
    const expiresIn = env.JWT_ACCESS_EXPIRES_IN || env.JWT_EXPIRES_IN || '15m';
    
    // Utilisation de as any pour contourner le problème de typage
    return jwt.sign(accessPayload, secret, {
      expiresIn: expiresIn,
    } as any);
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw error;
  }
};

export const generateRefreshToken = (userId: string): string => {
  try {
    const payload: RefreshTokenPayload = {
      userId,
      type: 'refresh',
    };
    
    const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET || 'your-refresh-secret-key';
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    // Utilisation de as any pour contourner le problème de typage
    return jwt.sign(payload, secret, {
      expiresIn: expiresIn,
    } as any);
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const secret = env.JWT_ACCESS_SECRET || env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    logger.debug('Access token verification failed:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET || 'your-refresh-secret-key';
    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    logger.debug('Refresh token verification failed:', error);
    return null;
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded || null;
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

export const getTokenFromHeader = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const generateTokens = (payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);
  return { accessToken, refreshToken };
};

// Compatibilité avec l'ancien code
export const signToken = generateAccessToken;
export const verifyToken = verifyAccessToken;
export const refreshToken = generateRefreshToken;

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenFromHeader,
  isTokenExpired,
  getTokenExpiry,
  generateTokens,
  signToken,
  verifyToken,
  refreshToken,
};