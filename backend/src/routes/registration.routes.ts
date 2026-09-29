// backend/src/routes/registration.routes.ts

import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registrationRateLimiter } from '../middlewares/rateLimiter.middleware';
import {
  createRegistrationValidator,
  updateRegistrationValidator,
} from '../validators/registration.validator';

const router = Router();
const registrationController = new RegistrationController();

// Public routes
router.post(
  '/',
  registrationRateLimiter,
  validate(createRegistrationValidator),
  registrationController.create
);

// Admin routes
router.get(
  '/',
  authMiddleware,
  isAdmin,
  registrationController.getAll
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  registrationController.getStats
);

router.get(
  '/revenue',
  authMiddleware,
  isAdmin,
  registrationController.getRevenueStats
);

router.get(
  '/formation/:formationId',
  authMiddleware,
  isAdmin,
  registrationController.getByFormation
);

router.get(
  '/session/:sessionId',
  authMiddleware,
  isAdmin,
  registrationController.getBySession
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  registrationController.getById
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updateRegistrationValidator),
  registrationController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  registrationController.delete
);

router.patch(
  '/:id/confirm',
  authMiddleware,
  isAdmin,
  registrationController.confirmRegistration
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  isAdmin,
  registrationController.cancelRegistration
);

router.patch(
  '/:id/complete',
  authMiddleware,
  isAdmin,
  registrationController.completeRegistration
);

export default router;