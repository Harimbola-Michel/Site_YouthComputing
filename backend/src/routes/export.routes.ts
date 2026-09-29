// src/routes/export.routes.ts
import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createExportValidator } from '../validators/export.validator';

const router = Router();
const exportController = new ExportController();

// ✅ Protection : toutes les routes d’export nécessitent une authentification et le rôle admin
router.use(authMiddleware, isAdmin);

// ─── Gestion de l’historique ──────────────────────────────
router.get('/', exportController.getHistory);
router.get('/stats', exportController.getStats);
router.post('/', validate(createExportValidator), exportController.createExport);
router.get('/:id', exportController.getById);
router.delete('/:id', exportController.deleteExport);
router.get('/:id/download', exportController.downloadExport);

// ─── Exports directs (depuis les pages admin) ─────────────
router.get('/registrations/:format', exportController.exportRegistrations);
router.get('/members/:format', exportController.exportMembers);
router.get('/payments/:format', exportController.exportPayments);
router.get('/formations/:format', exportController.exportFormations);
router.get('/projects/:format', exportController.exportProjects);
router.get('/articles/:format', exportController.exportArticles);

export default router;