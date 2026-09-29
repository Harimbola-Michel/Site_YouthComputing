import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import {
  createPartnerValidator,
  updatePartnerValidator,
  partnerRequestValidator,
} from '../validators/partner.validator';

const router = Router();
const partnerController = new PartnerController();

// ─── Routes publiques ──────────────────────────────────────

router.get('/', cacheMiddleware(300), partnerController.getAll);
router.get('/active', cacheMiddleware(300), partnerController.getActive);
router.get('/:id', cacheMiddleware(300), partnerController.getById);

// ✅ Demande de partenariat (publique)
router.post(
  '/request',
  validate(partnerRequestValidator),
  partnerController.requestPartnership
);

// ─── Routes admin (authentifiées) ──────────────────────────

router.use(authMiddleware, isAdmin);

router.post('/', validate(createPartnerValidator), partnerController.create);
router.put('/:id', validate(updatePartnerValidator), partnerController.update);
router.delete('/:id', partnerController.delete);
router.patch('/:id/toggle-active', partnerController.toggleActive);
router.get('/stats', partnerController.getStats);

export default router;