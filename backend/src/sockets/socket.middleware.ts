import { Socket } from 'socket.io';
import { verifyAccessToken } from '@utils/jwt';
import { logger } from '@config/logger';
import prisma from '../../prisma/client';

export const socketMiddleware = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn(`Socket connection rejected: No token provided (${socket.id})`);
      return next(new Error('Authentication required'));
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      logger.warn(`Socket connection rejected: Invalid token (${socket.id})`);
      return next(new Error('Invalid token'));
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      logger.warn(`Socket connection rejected: User not found (${socket.id})`);
      return next(new Error('Unauthorized access'));
    }

    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.email = user.email;
    socket.data.role = user.role;
    socket.data.firstName = user.firstName;
    socket.data.lastName = user.lastName;
    socket.data.connectedAt = new Date();

    next();
  } catch (error) {
    logger.error('Socket middleware error:', error);
    next(new Error('Invalid token'));
  }
};

export const requireAuth = (socket: Socket, next: (err?: Error) => void): void => {
  if (!socket.data.userId) {
    return next(new Error('Authentication required'));
  }
  next();
};

export const requireAdmin = (socket: Socket, next: (err?: Error) => void): void => {
  const role = socket.data.role;
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return next(new Error('Unauthorized access'));
  }
  next();
};

export const requireSuperAdmin = (socket: Socket, next: (err?: Error) => void): void => {
  if (socket.data.role !== 'SUPER_ADMIN') {
    return next(new Error('Unauthorized access'));
  }
  next();
};