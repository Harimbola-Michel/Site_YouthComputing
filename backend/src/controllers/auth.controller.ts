// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { BaseController } from './base.controller';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      this.sendCreated(res, result, 'User registered successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await this.authService.login(email, password, ipAddress, userAgent);
      this.sendSuccess(res, result, 'Login successful');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw ApiError.badRequest('Refresh token is required');
      }
      const result = await this.authService.refreshToken(refreshToken);
      this.sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Not authenticated');
      }
      await this.authService.logout(userId);
      this.sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Not authenticated');
      }
      const user = await this.authService.getProfile(userId);
      this.sendSuccess(res, user);
    } catch (error) {
      this.handleError(next, error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);
      this.sendSuccess(res, null, 'Email verified successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      this.sendSuccess(res, null, 'Password reset link sent if email exists');
    } catch (error) {
      this.handleError(next, error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      this.sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      this.handleError(next, error);
    }
  };
}