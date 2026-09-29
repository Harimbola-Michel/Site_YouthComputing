import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isEditor, isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createEventValidator,
  updateEventValidator,
  registerForEventValidator,  // ← corrigé
} from '../validators/event.validator';

const router = Router();
const eventController = new EventController();

// Public routes
router.get(
  '/',
  cacheMiddleware(300),
  eventController.getAll
);

router.get(
  '/published',
  cacheMiddleware(300),
  eventController.getPublished
);

router.get(
  '/upcoming',
  cacheMiddleware(300),
  eventController.getUpcoming
);

router.get(
  '/stats',
  cacheMiddleware(600),
  eventController.getStats
);

router.get(
  '/type/:type',
  cacheMiddleware(300),
  eventController.getByType
);

router.get(
  '/:slug',
  cacheMiddleware(300),
  eventController.getBySlug
);

router.get(
  '/id/:id',
  cacheMiddleware(300),
  eventController.getById
);

router.post(
  '/:id/register',
  validate(registerForEventValidator),  // ← corrigé
  eventController.registerForEvent
);

// Admin routes
router.post(
  '/',
  authMiddleware,
  isEditor,
  validate(createEventValidator),
  eventController.create
);

router.put(
  '/:id',
  authMiddleware,
  isEditor,
  validate(updateEventValidator),
  eventController.update
);

router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  eventController.delete
);

router.get(
  '/:id/registrations',
  authMiddleware,
  isAdmin,
  eventController.getEventRegistrations
);

router.patch(
  '/registrations/:id/confirm',
  authMiddleware,
  isAdmin,
  eventController.confirmRegistration
);

router.patch(
  '/registrations/:id/cancel',
  authMiddleware,
  isAdmin,
  eventController.cancelRegistration
);

export default router;