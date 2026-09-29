// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware'; // ← maintenant exporté
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Helper pour wrapper les contrôleurs (gestion d'erreurs)
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Routes publiques
router.post('/register', validate(registerValidator), asyncHandler(authController.register));
router.post('/login', validate(loginValidator), asyncHandler(authController.login));
router.post('/refresh', validate(refreshTokenValidator), asyncHandler(authController.refreshToken));
router.post('/verify-email', validate(verifyEmailValidator), asyncHandler(authController.verifyEmail));
router.post('/forgot-password', validate(forgotPasswordValidator), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate(resetPasswordValidator), asyncHandler(authController.resetPassword));

// Routes protégées
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getMe));

export default router;