import { Router } from 'express';
import { CandidatureController } from '../controllers/candidature.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createCandidatureValidator,
  updateCandidatureValidator,
  createInterviewValidator,
  createEvaluationValidator,
} from '../validators/candidature.validator';

const router = Router();
const candidatureController = new CandidatureController();

// Toutes les routes admin (authentification requise)
router.use(authMiddleware, isAdmin);

// ─── Candidatures ──────────────────────────────────────────
router.get('/', candidatureController.getAll);
router.get('/stats', candidatureController.getStats);
router.get('/recruitment/:recruitmentId', candidatureController.getByRecruitment);
router.get('/:id', candidatureController.getById);
router.post('/', validate(createCandidatureValidator), candidatureController.create);
router.put('/:id', validate(updateCandidatureValidator), candidatureController.update);
router.delete('/:id', candidatureController.delete);

// ─── Interviews ────────────────────────────────────────────
router.post('/:id/interviews', validate(createInterviewValidator), candidatureController.scheduleInterview);
router.put('/interviews/:id', candidatureController.updateInterview);
router.get('/:id/interviews', candidatureController.getInterviews);

// ─── Evaluations ───────────────────────────────────────────
router.post('/:id/evaluations', validate(createEvaluationValidator), candidatureController.addEvaluation);
router.get('/:id/evaluations', candidatureController.getEvaluations);
router.get('/:id/score', candidatureController.getAverageScore);

// ─── Envoi du rapport par email ───────────────────────────
router.post('/:id/send-evaluation-report', candidatureController.sendEvaluationReport);

export default router;