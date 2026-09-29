// src/routes/y2c.routes.ts
import { Router } from 'express';
import { Y2CController } from '../controllers/y2c.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createY2CMemberValidator,
  updateY2CMemberValidator,
  createY2CEventValidator,
  updateY2CEventValidator,
  registerForEventValidator, // ✅ import ajouté
} from '../validators/y2c.validator';

const router = Router();
const y2cController = new Y2CController();

// ─── Membres (public) ──────────────────────────────────────
router.post('/members', validate(createY2CMemberValidator), y2cController.createMember);

// ─── Membres (admin) ──────────────────────────────────────
router.get('/members', authenticate, isAdmin, y2cController.getMembers);
router.get('/members/stats', authenticate, isAdmin, y2cController.getMemberStats);
router.get('/members/:id', authenticate, isAdmin, y2cController.getMember);
router.put('/members/:id', authenticate, isAdmin, validate(updateY2CMemberValidator), y2cController.updateMember);
router.delete('/members/:id', authenticate, isAdmin, y2cController.deleteMember);
router.patch('/members/:id/approve', authenticate, isAdmin, y2cController.approveMember);

// ─── Badges ────────────────────────────────────────────────
router.post('/members/:id/generate-badge', authenticate, isAdmin, y2cController.generateBadgeForMember);
router.post('/members/generate-badges', authenticate, isAdmin, y2cController.generateBadges);

// ─── Événements (public) ──────────────────────────────────
router.get('/events', y2cController.getEvents);
router.get('/events/:id', y2cController.getEvent);
// ✅ Inscription avec validation
router.post(
  '/events/:id/register',
  validate(registerForEventValidator),
  y2cController.registerForEvent
);

// ─── Événements (admin) ────────────────────────────────────
router.post('/events', authenticate, isAdmin, validate(createY2CEventValidator), y2cController.createEvent);
router.put('/events/:id', authenticate, isAdmin, validate(updateY2CEventValidator), y2cController.updateEvent);
router.delete('/events/:id', authenticate, isAdmin, y2cController.deleteEvent);
router.get('/events/stats', authenticate, isAdmin, y2cController.getEventStats);
router.get('/events/:id/registrations', authenticate, isAdmin, y2cController.getEventRegistrations);

export default router;