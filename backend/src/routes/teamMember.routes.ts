// src/routes/teamMember.routes.ts
import { Router } from 'express';
import { TeamMemberController } from '../controllers/teamMember.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createTeamMemberValidator,
  updateTeamMemberValidator,
} from '../validators/team-member.validator';

const router = Router();
const teamMemberController = new TeamMemberController();

// Routes publiques
router.get('/', cacheMiddleware(300), teamMemberController.getAll);
router.get('/active', cacheMiddleware(300), teamMemberController.getActive);
router.get('/department/:department', cacheMiddleware(300), teamMemberController.getByDepartment);

// ⚠️ La route /stats doit être définie AVANT /:id
router.get('/stats', authMiddleware, isAdmin, teamMemberController.getStats);
router.get('/:id', cacheMiddleware(300), teamMemberController.getById);

// Routes admin
router.post('/', authMiddleware, isAdmin, validate(createTeamMemberValidator), teamMemberController.create);
router.put('/:id', authMiddleware, isAdmin, validate(updateTeamMemberValidator), teamMemberController.update);
router.delete('/:id', authMiddleware, isAdmin, teamMemberController.delete);
router.patch('/reorder', authMiddleware, isAdmin, teamMemberController.reorder);
router.patch('/:id/toggle-active', authMiddleware, isAdmin, teamMemberController.toggleActive);

export default router;