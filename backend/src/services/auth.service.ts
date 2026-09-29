// backend/src/services/auth.service.ts

import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { ActivityLogRepository } from '../repositories/activityLog.repository';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePasswords } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  TokenPayload,
  generateTokens,
} from '../utils/jwt';
import { logger } from '../config/logger';
import { mailer } from '../config/mailer';
import { env } from '../config/env';
import { RegisterDTO, LoginDTO } from '../types/dto/auth.dto';
import { User, UserStatus } from '@prisma/client';
import { Role } from '../types/roles.enum';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private activityLogRepository: ActivityLogRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.activityLogRepository = new ActivityLogRepository();
  }

  async register(data: RegisterDTO): Promise<{
    user: Omit<User, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);

    // ✅ Création de l'utilisateur – id, createdAt, updatedAt sont gérés par Prisma (via @default)
    const user = await this.userRepository.create({
      email: data.email,
      password_hash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: Role.VIEWER,
      status: UserStatus.PENDING,   // ✅ enum
    });

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    // ✅ Stockage du refresh token – relation nommée "User" (majuscule)
    await this.refreshTokenRepository.create({
      token: refreshToken,
      User: {
        connect: { id: user.id },
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Email de bienvenue
    if (env.ENABLE_EMAIL) {
      try {
        await mailer.sendTemplatedEmail(user.email, 'welcome', {
          name: `${user.firstName} ${user.lastName}`,
          content: `
            <p>Bienvenue sur la plateforme Youth Computing !</p>
            <p>Nous sommes ravis de vous compter parmi nous.</p>
            <p>Pour commencer, veuillez vérifier votre adresse email.</p>
          `,
        });
      } catch (error) {
        logger.error('Failed to send welcome email:', error);
      }
    }

    // ✅ Log d'activité – relation "User"
    await this.activityLogRepository.create({
      User: {
        connect: { id: user.id },
      },
      action: 'REGISTER',
      resource: 'user',
      resourceId: user.id,
      metadata: { email: user.email },
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async login(email: string, password: string, ipAddress: string, userAgent?: string): Promise<{
    user: Omit<User, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account is disabled');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw ApiError.unauthorized('Account suspended');
    }

    const isValid = await comparePasswords(password, user.password_hash);
    if (!isValid) {
      await this.activityLogRepository.create({
        User: { connect: { id: user.id } },
        action: 'LOGIN',
        resource: 'user',
        resourceId: user.id,
        ipAddress,
        userAgent,
        metadata: { success: false, reason: 'Invalid password' },
      });
      throw ApiError.unauthorized('Invalid credentials');
    }

    await this.userRepository.updateLastLogin(user.id);

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      User: { connect: { id: user.id } },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.activityLogRepository.create({
      User: { connect: { id: user.id } },
      action: 'LOGIN',
      resource: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: { success: true },
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const storedToken = await this.refreshTokenRepository.findValidToken(token, decoded.userId);
    if (!storedToken) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    await this.refreshTokenRepository.revokeToken(storedToken.id);

    const user = await this.userRepository.findByIdOrThrow(decoded.userId);
    if (!user.isActive) {
      throw ApiError.unauthorized('User not active');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    await this.refreshTokenRepository.create({
      token: refreshToken,
      User: { connect: { id: user.id } },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
    await this.activityLogRepository.create({
      User: { connect: { id: userId } },
      action: 'LOGOUT',
      resource: 'user',
      resourceId: userId,
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findByIdOrThrow(userId);
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyEmail(token: string): Promise<void> {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw ApiError.badRequest('Invalid verification token');
    }

    const user = await this.userRepository.findByIdOrThrow(decoded.userId);
    if (user.status !== UserStatus.PENDING) {
      throw ApiError.badRequest('Email already verified');
    }

    await this.userRepository.update(user.id, {
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const resetToken = generateAccessToken(payload);

    if (env.ENABLE_EMAIL) {
      try {
        await mailer.sendTemplatedEmail(user.email, 'reset-password', {
          name: `${user.firstName} ${user.lastName}`,
          content: `
            <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
            <p><a href="${env.FRONTEND_URL}/reset-password?token=${resetToken}">Réinitialiser</a></p>
            <p>Ce lien expire dans 15 minutes.</p>
          `,
        });
      } catch (error) {
        logger.error('Failed to send reset password email:', error);
      }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(decoded.userId, {
      password_hash: hashedPassword,
    });

    await this.refreshTokenRepository.revokeAllUserTokens(decoded.userId);
  }
}