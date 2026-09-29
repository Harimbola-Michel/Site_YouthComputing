import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createNotificationValidator } from '../validators/notification.validator';

const router = Router();
const controller = new NotificationController();

// ─── Routes utilisateur (authentification requise) ───────────

// ✅ Route principale : s'adapte au rôle (admin voit tout, user voit ses propres notifs)
router.get(
  '/',
  authMiddleware,
  controller.getNotifications
);

// ✅ Alias pour /my-notifications (compatible avec le frontend)
router.get(
  '/my-notifications',
  authMiddleware,
  controller.getMyNotifications
);

// Route /my (alias alternatif)
router.get(
  '/my',
  authMiddleware,
  controller.getMyNotifications
);

// Nombre de non-lues
router.get(
  '/unread-count',
  authMiddleware,
  controller.getUnreadCount
);

// Marquer une notification comme lue
router.put(
  '/:id/read',
  authMiddleware,
  controller.markAsRead
);

// Marquer toutes comme lues
router.put(
  '/read-all',
  authMiddleware,
  controller.markAllAsRead
);

// Supprimer une notification (utilisateur)
router.delete(
  '/:id',
  authMiddleware,
  controller.delete
);

// ─── Routes admin ──────────────────────────────────────────────

// Créer une notification (admin)
router.post(
  '/admin',
  authMiddleware,
  isAdmin,
  validate(createNotificationValidator),
  controller.create
);

// Supprimer n'importe quelle notification (admin)
router.delete(
  '/admin/:id',
  authMiddleware,
  isAdmin,
  controller.deleteAdmin
);

export default router;