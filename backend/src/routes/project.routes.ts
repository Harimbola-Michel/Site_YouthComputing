import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isEditor, isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createProjectValidator,
  updateProjectValidator,
  createMetricValidator,
  updateMetricValidator,
} from '../validators/project.validator';

const router = Router();
const projectController = new ProjectController();

// Public routes
router.get(
  '/',
  cacheMiddleware(300),
  projectController.getAll
);

router.get(
  '/featured',
  cacheMiddleware(300),
  projectController.getFeatured
);

router.get(
  '/stats',
  cacheMiddleware(600),
  projectController.getStats
);

router.get(
  '/category/:category',
  cacheMiddleware(300),
  projectController.getByCategory
);

router.get(
  '/year/:year',
  cacheMiddleware(300),
  projectController.getByYear
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  projectController.getBySlug
);

router.get(
  '/id/:id',
  cacheMiddleware(300),
  projectController.getById
);

router.get(
  '/:id/metrics',
  cacheMiddleware(300),
  projectController.getProjectMetrics
);

router.get(
  '/:id/with-metrics',
  cacheMiddleware(300),
  projectController.getWithMetrics
);

// Admin routes
router.post(
  '/',
  authMiddleware,
  isEditor,
  validate(createProjectValidator),
  projectController.create
);

router.put(
  '/:id',
  authMiddleware,
  isEditor,
  validate(updateProjectValidator),
  projectController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  projectController.delete
);

// Metrics routes
router.post(
  '/:projectId/metrics',
  authMiddleware,
  isEditor,
  validate(createMetricValidator),
  projectController.addMetric
);

router.put(
  '/metrics/:id',
  authMiddleware,
  isEditor,
  validate(updateMetricValidator),
  projectController.updateMetric
);

router.delete(
  '/metrics/:id',
  authMiddleware,
  isAdmin,
  projectController.deleteMetric
);

export default router;