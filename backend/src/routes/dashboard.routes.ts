// backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate, isAdmin);

router.get('/stats', dashboardController.getStats);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/quick-stats', dashboardController.getQuickStats);
router.get('/chart', dashboardController.getChartData);
router.get('/performance', dashboardController.getPerformance);
router.get('/widgets', dashboardController.getWidgets);
router.get('/notifications', dashboardController.getNotifications);

export default router;