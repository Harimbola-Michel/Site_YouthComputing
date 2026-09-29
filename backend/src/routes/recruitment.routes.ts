import { Router } from 'express';
import { RecruitmentController } from '../controllers/recruitment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createRecruitmentValidator,
  updateRecruitmentValidator,
  createCandidatureValidator,
} from '../validators/recruitment.validator';

const router = Router();
const recruitmentController = new RecruitmentController();

// ─── Routes publiques ──────────────────────────────────────

router.get(
  '/',
  cacheMiddleware(300),
  recruitmentController.getAll
);

router.get(
  '/active',
  cacheMiddleware(300),
  recruitmentController.getActive
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  recruitmentController.getBySlug
);

router.get(
  '/id/:id',
  cacheMiddleware(300),
  recruitmentController.getById
);

// ✅ Candidature avec upload de fichier (multipart)
// On utilise le middleware applyForPosition qui contient uploadCV
router.post(
  '/apply',
  recruitmentController.applyForPosition
);

// ─── Routes admin (authentifiées) ────────────────────────

router.post(
  '/',
  authMiddleware,
  isAdmin,
  validate(createRecruitmentValidator),
  recruitmentController.create
);

router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  validate(updateRecruitmentValidator),
  recruitmentController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  recruitmentController.delete
);

router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  recruitmentController.getStats
);

router.get(
  '/:id/candidatures',
  authMiddleware,
  isAdmin,
  recruitmentController.getCandidatures
);

router.patch(
  '/candidatures/:id/status',
  authMiddleware,
  isAdmin,
  recruitmentController.updateCandidatureStatus
);

router.get(
  '/:id/candidatures/stats',
  authMiddleware,
  isAdmin,
  recruitmentController.getCandidatureStats
);

export default router;