// src/routes/contact.routes.ts

import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { contactRateLimiter } from '../middlewares/rateLimiter.middleware';
import {
  createContactMessageValidator,
  replyContactMessageValidator,
} from '../validators/contact.validator';

const router = Router();
const contactController = new ContactController();

// Routes publiques
router.post(
  '/',
  contactRateLimiter,
  validate(createContactMessageValidator),
  contactController.sendMessage
);

// Routes admin (authentifiées)
router.get(
  '/',
  authMiddleware,
  isAdmin,
  contactController.getMessages
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  contactController.getStats
);

router.get(
  '/:id',
  authMiddleware,
  isAdmin,
  contactController.getMessage
);

// ✅ Route de réponse (avec validation corrigée)
router.post(
  '/:id/reply',
  authMiddleware,
  isAdmin,
  validate(replyContactMessageValidator),
  contactController.replyToMessage
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  contactController.deleteMessage
);

router.patch(
  '/:id/read',
  authMiddleware,
  isAdmin,
  contactController.markAsRead
);

export default router;