// src/routes/index.ts
import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import formationRoutes from './formation.routes';
import registrationRoutes from './registration.routes';
import y2cRoutes from './y2c.routes';
import articleRoutes from './article.routes';
import projectRoutes from './project.routes';
import eventRoutes from './event.routes';
import contactRoutes from './contact.routes';
import paymentRoutes from './payment.routes';
//import partnerRoutes from './partner.routes';
import recruitmentRoutes from './recruitment.routes';
import candidatureRoutes from './candidature.routes';
import teamMemberRoutes from './teamMember.routes';
import dashboardRoutes from './dashboard.routes';
import statsRoutes from './stats.routes';
import exportRoutes from './export.routes'; // ✅ importé
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import settingRoutes from './setting.routes';

const router = Router();

// ─── Health check ──────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Root endpoint ──────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Youth Computing API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// ─── Documentation API ──────────────────────────────────────────
// Tous les endpoints sont décrits sous forme de chaînes pour une
// sérialisation JSON correcte.
router.get('/docs', (_req: Request, res: Response) => {
  res.json({
    name: 'Youth Computing API',
    version: '1.0.0',
    description: 'API pour la plateforme Youth Computing',
    baseUrl: '/api',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        verifyEmail: 'POST /api/auth/verify-email',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
      },
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        changePassword: 'POST /api/users/change-password',
        toggleActive: 'PATCH /api/users/:id/toggle-active',
        stats: 'GET /api/users/stats',
        uploadAvatar: 'POST /api/users/avatar',
      },
      formations: {
        list: 'GET /api/formations',
        get: 'GET /api/formations/:slug',
        getById: 'GET /api/formations/id/:id',
        create: 'POST /api/formations',
        update: 'PUT /api/formations/:id',
        delete: 'DELETE /api/formations/:id',
        published: 'GET /api/formations/published',
        category: 'GET /api/formations/category/:category',
        level: 'GET /api/formations/level/:level',
        stats: 'GET /api/formations/stats',
        popular: 'GET /api/formations/popular',
        sessions: 'GET /api/formations/:id/sessions',
      },
      registrations: {
        list: 'GET /api/registrations',
        get: 'GET /api/registrations/:id',
        create: 'POST /api/registrations',
        update: 'PUT /api/registrations/:id',
        delete: 'DELETE /api/registrations/:id',
        confirm: 'PATCH /api/registrations/:id/confirm',
        cancel: 'PATCH /api/registrations/:id/cancel',
        complete: 'PATCH /api/registrations/:id/complete',
        stats: 'GET /api/registrations/stats',
        revenue: 'GET /api/registrations/revenue',
      },
      y2c: {
        members: 'GET /api/y2c/members',
        memberDetail: 'GET /api/y2c/members/:id',
        createMember: 'POST /api/y2c/members',
        updateMember: 'PUT /api/y2c/members/:id',
        deleteMember: 'DELETE /api/y2c/members/:id',
        approveMember: 'PATCH /api/y2c/members/:id/approve',
        memberStats: 'GET /api/y2c/members/stats',
        events: 'GET /api/y2c/events',
        eventDetail: 'GET /api/y2c/events/:id',
        createEvent: 'POST /api/y2c/events',
        updateEvent: 'PUT /api/y2c/events/:id',
        deleteEvent: 'DELETE /api/y2c/events/:id',
        eventStats: 'GET /api/y2c/events/stats',
        registerEvent: 'POST /api/y2c/events/:id/register',
        eventRegistrations: 'GET /api/y2c/events/:id/registrations',
      },
      articles: {
        list: 'GET /api/articles',
        get: 'GET /api/articles/:slug',
        getById: 'GET /api/articles/id/:id',
        create: 'POST /api/articles',
        update: 'PUT /api/articles/:id',
        delete: 'DELETE /api/articles/:id',
        published: 'GET /api/articles/published',
        stats: 'GET /api/articles/stats',
        mostViewed: 'GET /api/articles/most-viewed',
        comments: 'GET /api/articles/:articleId/comments',
        createComment: 'POST /api/articles/comments',
        approveComment: 'PATCH /api/articles/comments/:id/approve',
        deleteComment: 'DELETE /api/articles/comments/:id',
      },
      projects: {
        list: 'GET /api/projects',
        get: 'GET /api/projects/:slug',
        getById: 'GET /api/projects/id/:id',
        create: 'POST /api/projects',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        featured: 'GET /api/projects/featured',
        category: 'GET /api/projects/category/:category',
        year: 'GET /api/projects/year/:year',
        stats: 'GET /api/projects/stats',
        metrics: 'GET /api/projects/:projectId/metrics',
        createMetric: 'POST /api/projects/:projectId/metrics',
        updateMetric: 'PUT /api/projects/metrics/:id',
        deleteMetric: 'DELETE /api/projects/metrics/:id',
      },
      events: {
        list: 'GET /api/events',
        get: 'GET /api/events/:slug',
        getById: 'GET /api/events/id/:id',
        create: 'POST /api/events',
        update: 'PUT /api/events/:id',
        delete: 'DELETE /api/events/:id',
        published: 'GET /api/events/published',
        upcoming: 'GET /api/events/upcoming',
        type: 'GET /api/events/type/:type',
        stats: 'GET /api/events/stats',
        registrations: 'GET /api/events/:id/registrations',
        register: 'POST /api/events/:id/register',
        confirmRegistration: 'PATCH /api/events/registrations/:id/confirm',
        cancelRegistration: 'PATCH /api/events/registrations/:id/cancel',
      },
      contact: {
        send: 'POST /api/contact',
        list: 'GET /api/contact',
        get: 'GET /api/contact/:id',
        reply: 'POST /api/contact/:id/reply',
        delete: 'DELETE /api/contact/:id',
        markRead: 'PATCH /api/contact/:id/read',
        stats: 'GET /api/contact/stats',
      },
      payments: {
        list: 'GET /api/payments',
        get: 'GET /api/payments/:id',
        create: 'POST /api/payments',
        update: 'PUT /api/payments/:id',
        delete: 'DELETE /api/payments/:id',
        confirm: 'PATCH /api/payments/:id/confirm',
        fail: 'PATCH /api/payments/:id/fail',
        refund: 'PATCH /api/payments/:id/refund',
        stats: 'GET /api/payments/stats',
        myPayments: 'GET /api/payments/my-payments',
      },
      partners: {
        list: 'GET /api/partners',
        get: 'GET /api/partners/:id',
        create: 'POST /api/partners',
        update: 'PUT /api/partners/:id',
        delete: 'DELETE /api/partners/:id',
        active: 'GET /api/partners/active',
        toggleActive: 'PATCH /api/partners/:id/toggle-active',
        stats: 'GET /api/partners/stats',
      },
      recruitments: {
        list: 'GET /api/recruitments',
        get: 'GET /api/recruitments/:slug',
        getById: 'GET /api/recruitments/id/:id',
        create: 'POST /api/recruitments',
        update: 'PUT /api/recruitments/:id',
        delete: 'DELETE /api/recruitments/:id',
        active: 'GET /api/recruitments/active',
        stats: 'GET /api/recruitments/stats',
        apply: 'POST /api/recruitments/apply',
        candidatures: 'GET /api/recruitments/:id/candidatures',
        candidatureStats: 'GET /api/recruitments/:id/candidatures/stats',
      },
      candidatures: {
        list: 'GET /api/candidatures',
        get: 'GET /api/candidatures/:id',
        create: 'POST /api/candidatures',
        update: 'PUT /api/candidatures/:id',
        delete: 'DELETE /api/candidatures/:id',
        stats: 'GET /api/candidatures/stats',
        byRecruitment: 'GET /api/candidatures/recruitment/:recruitmentId',
        interviews: 'GET /api/candidatures/:id/interviews',
        scheduleInterview: 'POST /api/candidatures/:id/interviews',
        updateInterview: 'PUT /api/candidatures/interviews/:id',
        evaluations: 'GET /api/candidatures/:id/evaluations',
        addEvaluation: 'POST /api/candidatures/:id/evaluations',
        score: 'GET /api/candidatures/:id/score',
      },
      team: {
        list: 'GET /api/team',
        get: 'GET /api/team/:id',
        create: 'POST /api/team',
        update: 'PUT /api/team/:id',
        delete: 'DELETE /api/team/:id',
        active: 'GET /api/team/active',
        department: 'GET /api/team/department/:department',
        reorder: 'PATCH /api/team/reorder',
        toggleActive: 'PATCH /api/team/:id/toggle-active',
        stats: 'GET /api/team/stats',
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats',
        quickStats: 'GET /api/dashboard/quick-stats',
        chart: 'GET /api/dashboard/chart',
        activities: 'GET /api/dashboard/activities',
        notifications: 'GET /api/dashboard/notifications',
        performance: 'GET /api/dashboard/performance',
        widgets: 'GET /api/dashboard/widgets',
      },
      stats: {
        global: 'GET /api/stats/global',
        daily: 'GET /api/stats/daily',
        monthly: 'GET /api/stats/monthly',
        yearly: 'GET /api/stats/yearly',
        realtime: 'GET /api/stats/realtime',
      },
      export: {
        // ✅ Correction des chemins pour correspondre aux vraies routes
        history: 'GET /api/exports',
        stats: 'GET /api/exports/stats',
        create: 'POST /api/exports',
        get: 'GET /api/exports/:id',
        delete: 'DELETE /api/exports/:id',
        download: 'GET /api/exports/:id/download',
        registrations: 'GET /api/exports/registrations/:format',
        members: 'GET /api/exports/members/:format',
        payments: 'GET /api/exports/payments/:format',
        formations: 'GET /api/exports/formations/:format',
        projects: 'GET /api/exports/projects/:format',
        articles: 'GET /api/exports/articles/:format',
      },
      upload: {
        single: 'POST /api/upload/single',
        multiple: 'POST /api/upload/multiple',
        delete: 'DELETE /api/upload/:id',
        list: 'GET /api/upload',
        get: 'GET /api/upload/:id',
      },
    },
  });
});

// ─── Montage des sous‑routeurs ─────────────────────────────────
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/formations', formationRoutes);
router.use('/registrations', registrationRoutes);
router.use('/y2c', y2cRoutes);
router.use('/articles', articleRoutes);
router.use('/projects', projectRoutes);
router.use('/events', eventRoutes);
router.use('/contact', contactRoutes);
router.use('/payments', paymentRoutes);
//router.use('/partners', partnerRoutes);
router.use('/recruitments', recruitmentRoutes);
router.use('/candidatures', candidatureRoutes);
router.use('/team', teamMemberRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/stats', statsRoutes);
router.use('/exports', exportRoutes); // ✅ Modifié : '/export' → '/exports'
router.use('/upload', uploadRoutes);
router.use('/settings', settingRoutes);
router.use('/notifications', notificationRoutes);

export default router;