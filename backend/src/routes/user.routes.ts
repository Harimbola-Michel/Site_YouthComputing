// src/routes/user.routes.ts

import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin, isSuperAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';
import {
  createUserValidator,
  updateUserValidator,
  changePasswordValidator,
  userIdValidator,
  updateProfileValidator,
  changeRoleValidator,
  toggleStatusValidator,
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// ===================================================================
// 1. ROUTES SPÉCIFIQUES (authentification uniquement)
// ===================================================================

// ✅ Profil utilisateur connecté
router.get(
  '/profile',
  authenticate,
  userController.getProfile as RequestHandler
);

router.get('/:id', authenticate, isAdmin, validate(userIdValidator), userController.getById);

router.put(
  '/profile',
  authenticate,
  validate(updateProfileValidator),
  userController.updateProfile as RequestHandler
);

// ✅ Changement de mot de passe
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  userController.changePassword as RequestHandler
);

router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'), // ← bien 'avatar'
  userController.uploadAvatar as RequestHandler
);
// ✅ Statistiques (admin uniquement)
router.get(
  '/stats',
  authenticate,
  isAdmin,
  userController.getStats as RequestHandler
);

// ===================================================================
// 2. ROUTES ADMINISTRATEUR (avec paramètre :id)
// ===================================================================

// Liste des utilisateurs
router.get(
  '/',
  authenticate,
  isAdmin,
  userController.getAll as RequestHandler
);

// Récupérer un utilisateur par ID
router.get(
  '/:id',
  authenticate,
  isAdmin,
  validate(userIdValidator),
  userController.getById as RequestHandler
);

// Créer un utilisateur
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createUserValidator),
  userController.create as RequestHandler
);

// Mettre à jour un utilisateur
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validate(updateUserValidator),
  userController.update as RequestHandler
);

// Supprimer un utilisateur (hard delete)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(userIdValidator),
  userController.delete as RequestHandler
);

// ===================================================================
// 3. ACTIONS SPÉCIFIQUES SUR UN UTILISATEUR
// ===================================================================

// Valider un utilisateur (PENDING → ACTIVE)
router.patch(
  '/:id/validate',
  authenticate,
  isAdmin,
  validate(userIdValidator),
  userController.validateUser as RequestHandler
);

// Basculer le statut (SUSPENDED ↔ ACTIVE)
router.patch(
  '/:id/toggle-status',
  authenticate,
  isAdmin,
  validate(userIdValidator),
  userController.toggleStatus as RequestHandler
);

// Changer le rôle (réservé SUPER_ADMIN)
router.patch(
  '/:id/change-role',
  authenticate,
  isSuperAdmin,
  validate(changeRoleValidator),
  userController.changeRole as RequestHandler
);

// Activer / désactiver (isActive)
router.patch(
  '/:id/toggle-active',
  authenticate,
  isAdmin,
  validate(userIdValidator),
  userController.toggleActive as RequestHandler
);

export default router;