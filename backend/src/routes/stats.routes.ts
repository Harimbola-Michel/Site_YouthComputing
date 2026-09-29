import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();
const statsController = new StatsController();

// ─── Route publique (sans authentification) ───────────────────
router.get(
  '/global',
  cacheMiddleware(300), // 5 minutes de cache
  statsController.getGlobalStats
);

// ─── Routes protégées (admin uniquement) ──────────────────────
router.use(authMiddleware, isAdmin); // ✅ Appliqué uniquement aux routes suivantes

router.get(
  '/daily',
  cacheMiddleware(300),
  statsController.getDailyStats
);

router.get(
  '/monthly',
  cacheMiddleware(300),
  statsController.getMonthlyStats
);

router.get(
  '/yearly',
  cacheMiddleware(300),
  statsController.getYearlyStats
);

router.get(
  '/realtime',
  cacheMiddleware(30),
  statsController.getRealtimeStats
);

export default router;