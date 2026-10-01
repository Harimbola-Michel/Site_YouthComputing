// src/lib/api.ts – Version finale avec exports
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth-tokens';
import { API_URL } from './env';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Intercepteurs pour refresh token ──────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

const processQueue = (error: Error | null, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens({ accessToken, refreshToken: newRefreshToken });
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError as Error);
        if (typeof window !== 'undefined') {
          window.location.href = '/connexion';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (error.response?.status === 422) {
      const responseData = error.response?.data;
      const errors = responseData?.errors || responseData?.message || responseData;
      const formattedErrors: Record<string, string[]> = {};
      if (Array.isArray(errors)) {
        errors.forEach((err: any) => {
          if (err.field) {
            if (!formattedErrors[err.field]) formattedErrors[err.field] = [];
            formattedErrors[err.field].push(err.message || err.msg || 'Champ invalide');
          }
        });
      } else if (typeof errors === 'object' && errors !== null) {
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            formattedErrors[field] = messages.filter(Boolean);
          } else if (typeof messages === 'string') {
            formattedErrors[field] = [messages];
          }
        });
      } else if (typeof errors === 'string') {
        formattedErrors._global = [errors];
      }
      error.formattedErrors = formattedErrors;
    }
    return Promise.reject(error);
  }
);

// ─── Authentification ──────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

// ─── Utilisateurs ───────────────────────────────────────────────────
export const users = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: (formData: FormData) => api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data: any) => api.post('/users/change-password', data),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
  getStats: () => api.get('/users/stats'),
};

// ─── Formations ─────────────────────────────────────────────────────
export const formations = {
  getAll: (params?: any) => api.get('/formations', { params }),
  getBySlug: (slug: string) => api.get(`/formations/${slug}`),
  getById: (id: string) => api.get(`/formations/id/${id}`),
  getPublished: () => api.get('/formations/published'),
  getStats: () => api.get('/formations/stats'),
  getPopular: (params?: any) => api.get('/formations/popular', { params }),
  create: (data: any) => api.post('/formations', data),
  update: (id: string, data: any) => api.put(`/formations/${id}`, data),
  delete: (id: string) => api.delete(`/formations/${id}`),
  togglePublish: (id: string) => api.patch(`/formations/${id}/toggle-publish`),
  getSessions: (formationId: string) => api.get(`/formations/${formationId}/sessions`),
  addSession: (formationId: string, data: any) => api.post(`/formations/${formationId}/sessions`, data),
  deleteSession: (sessionId: string) => api.delete(`/formations/sessions/${sessionId}`),
  register: (id: string, data: any) => api.post('/registrations', { ...data, formationId: id }),
};

// ─── Inscriptions ──────────────────────────────────────────────────
export const registrations = {
  getAll: (params?: any) => api.get('/registrations', { params }),
  getById: (id: string) => api.get(`/registrations/${id}`),
  create: (data: any) => api.post('/registrations', data),
  update: (id: string, data: any) => api.put(`/registrations/${id}`, data),
  delete: (id: string) => api.delete(`/registrations/${id}`),
  confirm: (id: string) => api.patch(`/registrations/${id}/confirm`),
  cancel: (id: string) => api.patch(`/registrations/${id}/cancel`),
  complete: (id: string) => api.patch(`/registrations/${id}/complete`),
  getStats: () => api.get('/registrations/stats'),
  getRevenue: () => api.get('/registrations/revenue'),
  getMyRegistrations: () => api.get('/registrations/me'),
};

// ─── Communauté Y2C ───────────────────────────────────────────────
export const y2c = {
  getMembers: (params?: any) => api.get('/y2c/members', { params }),
  getMember: (id: string) => api.get(`/y2c/members/${id}`),
  createMember: (data: any) => api.post('/y2c/members', data),
  updateMember: (id: string, data: any) => api.put(`/y2c/members/${id}`, data),
  deleteMember: (id: string) => api.delete(`/y2c/members/${id}`),
  approveMember: (id: string) => api.patch(`/y2c/members/${id}/approve`),
  getMemberStats: () => api.get('/y2c/members/stats'),
  getEvents: (params?: any) => api.get('/y2c/events', { params }),
  getEvent: (id: string) => api.get(`/y2c/events/${id}`),
  createEvent: (data: any) => api.post('/y2c/events', data),
  updateEvent: (id: string, data: any) => api.put(`/y2c/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/y2c/events/${id}`),
  getEventStats: () => api.get('/y2c/events/stats'),
  registerForEvent: (id: string, data: any) => api.post(`/y2c/events/${id}/register`, data),
  getEventRegistrations: (id: string) => api.get(`/y2c/events/${id}/registrations`),
};

export const comments = {
  getByArticle: (articleId: string) => api.get(`/articles/${articleId}/comments`),
  getByArticleAdmin: (articleId: string) => api.get(`/articles/admin/articles/${articleId}/comments`),
  getPending: () => api.get('/articles/admin/comments/pending'),
  approve: (id: string) => api.patch(`/articles/comments/${id}/approve`),
  delete: (id: string) => api.delete(`/articles/comments/${id}`),
  create: (data: any) => api.post('/articles/comments', data),
};

// ─── Articles ──────────────────────────────────────────────────────
export const articles = {
  getAll: (params?: any) => api.get('/articles', { params }),
  getBySlug: (slug: string) => api.get(`/articles/${slug}`),
  getById: (id: string) => api.get(`/articles/id/${id}`),
  getPublished: () => api.get('/articles/published'),
  create: (data: any) => api.post('/articles', data),
  update: (id: string, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
  publish: (id: string) => api.patch(`/articles/${id}/publish`),
  unpublish: (id: string) => api.patch(`/articles/${id}/unpublish`),
  getStats: () => api.get('/articles/stats'),
  getMostViewed: (params?: any) => api.get('/articles/most-viewed', { params }),
  createComment: (data: any) => api.post('/articles/comments', data),
  getComments: (articleId: string) => api.get(`/articles/${articleId}/comments`),
  approveComment: (id: string) => api.patch(`/articles/comments/${id}/approve`),
  deleteComment: (id: string) => api.delete(`/articles/comments/${id}`),
};

// ─── Projets ───────────────────────────────────────────────────────
export const projects = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getBySlug: (slug: string) => api.get(`/projects/${slug}`),
  getById: (id: string) => api.get(`/projects/id/${id}`),
  getFeatured: () => api.get('/projects/featured'),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
  getMetrics: (projectId: string) => api.get(`/projects/${projectId}/metrics`),
  createMetric: (projectId: string, data: any) => api.post(`/projects/${projectId}/metrics`, data),
  updateMetric: (id: string, data: any) => api.put(`/projects/metrics/${id}`, data),
  deleteMetric: (id: string) => api.delete(`/projects/metrics/${id}`),
};

// ─── Événements ────────────────────────────────────────────────────
export const events = {
  getAll: (params?: any) => api.get('/events', { params }),
  getBySlug: (slug: string) => api.get(`/events/${slug}`),
  getById: (id: string) => api.get(`/events/id/${id}`),
  getPublished: () => api.get('/events/published'),
  getUpcoming: (params?: any) => api.get('/events/upcoming', { params }),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  getStats: () => api.get('/events/stats'),
  register: (id: string, data: any) => api.post(`/events/${id}/register`, data),
  getRegistrations: (id: string) => api.get(`/events/${id}/registrations`),
  confirmRegistration: (id: string) => api.patch(`/events/registrations/${id}/confirm`),
  cancelRegistration: (id: string) => api.patch(`/events/registrations/${id}/cancel`),
};

// ─── Contact ──────────────────────────────────────────────────────
export const contact = {
  send: (data: any) => api.post('/contact', data),
  getAll: (params?: any) => api.get('/contact', { params }),
  getById: (id: string) => api.get(`/contact/${id}`),
  reply: (id: string, data: any) => api.post(`/contact/${id}/reply`, data),
  delete: (id: string) => api.delete(`/contact/${id}`),
  markRead: (id: string) => api.patch(`/contact/${id}/read`),
  getStats: () => api.get('/contact/stats'),
};

// ─── Paiements (correction + ajout sendReceipt) ───────────────────
export const payments = {
  getAll: (params?: any) => api.get('/payments', { params }),
  getById: (id: string) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: string, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: string) => api.delete(`/payments/${id}`),
  confirm: (id: string) => api.patch(`/payments/${id}/confirm`),
  fail: (id: string) => api.patch(`/payments/${id}/fail`),
  refund: (id: string) => api.patch(`/payments/${id}/refund`),
  getStats: () => api.get('/payments/stats'),
  getMyPayments: () => api.get('/payments/my-payments'),
  // ✅ Envoi du reçu par email
  sendReceipt: (id: string) => api.post(`/payments/${id}/send-receipt`),
};

// ─── Partenaires ──────────────────────────────────────────────────
export const partners = {
  getAll: (params?: any) => api.get('/partners', { params }),
  getById: (id: string) => api.get(`/partners/${id}`),
  create: (data: any) => api.post('/partners', data),
  update: (id: string, data: any) => api.put(`/partners/${id}`, data),
  delete: (id: string) => api.delete(`/partners/${id}`),
  getActive: () => api.get('/partners/active'),
  toggleActive: (id: string) => api.patch(`/partners/${id}/toggle-active`),
  getStats: () => api.get('/partners/stats'),
  // ✅ Demande de partenariat (publique, sans authentification)
  requestPartnership: (data: any) => api.post('/partners/request', data),
};

// ─── Recrutements ─────────────────────────────────────────────────
export const recruitments = {
  getAll: (params?: any) => api.get('/recruitments', { params }),
  getBySlug: (slug: string) => api.get(`/recruitments/${slug}`),
  getById: (id: string) => api.get(`/recruitments/id/${id}`),
  getActive: () => api.get('/recruitments/active'),
  create: (data: any) => api.post('/recruitments', data),
  update: (id: string, data: any) => api.put(`/recruitments/${id}`, data),
  delete: (id: string) => api.delete(`/recruitments/${id}`),
  getStats: () => api.get('/recruitments/stats'),
  apply: (formData: FormData) => {
    return api.post('/recruitments/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCandidatures: (id: string) => api.get(`/recruitments/${id}/candidatures`),
  getCandidatureStats: (id: string) => api.get(`/recruitments/${id}/candidatures/stats`),
};

// ─── Candidatures ─────────────────────────────────────────────────
export const candidatures = {
  getAll: (params?: any) => api.get('/candidatures', { params }),
  getById: (id: string) => api.get(`/candidatures/${id}`),
  create: (data: any) => api.post('/candidatures', data),
  update: (id: string, data: any) => api.put(`/candidatures/${id}`, data),
  delete: (id: string) => api.delete(`/candidatures/${id}`),
  getStats: () => api.get('/candidatures/stats'),
  getByRecruitment: (recruitmentId: string) => api.get(`/candidatures/recruitment/${recruitmentId}`),
  
  // Interviews
  getInterviews: (id: string) => api.get(`/candidatures/${id}/interviews`),
  scheduleInterview: (id: string, data: any) => api.post(`/candidatures/${id}/interviews`, data),
  updateInterview: (id: string, data: any) => api.put(`/candidatures/interviews/${id}`, data),
  
  // Evaluations
  getEvaluations: (id: string) => api.get(`/candidatures/${id}/evaluations`),
  addEvaluation: (id: string, data: any) => api.post(`/candidatures/${id}/evaluations`, data),
  getScore: (id: string) => api.get(`/candidatures/${id}/score`),
  
  // Envoi du rapport d’évaluation par email
  sendEvaluationReport: (id: string) => api.post(`/candidatures/${id}/send-evaluation-report`),
};

export const team = {
  getAll: (params?: any) => api.get('/team', { params }),
  getById: (id: string) => api.get(`/team/${id}`),
  create: (data: any) => api.post('/team', data),
  update: (id: string, data: any) => api.put(`/team/${id}`, data),
  delete: (id: string) => api.delete(`/team/${id}`),
  getActive: () => api.get('/team/active'),
  getByDepartment: (department: string) => api.get(`/team/department/${department}`),
  reorder: (data: any) => api.patch('/team/reorder', data),
  toggleActive: (id: string) => api.patch(`/team/${id}/toggle-active`),
  getStats: () => api.get('/team/stats'),
  // ✅ Export des membres (format CSV ou Excel)
  export: (format: string = 'csv', filters?: any) =>
    api.get(`/team/export/${format}`, {
      params: filters,
      responseType: 'blob',
    }),
};

// ─── Tableau de bord ─────────────────────────────────────────────
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
  getChart: (params?: any) => api.get('/dashboard/chart', { params }),
  getActivities: (params?: any) => api.get('/dashboard/activities', { params }),
  getNotifications: () => api.get('/dashboard/notifications'),
  getPerformance: () => api.get('/dashboard/performance'),
  getWidgets: () => api.get('/dashboard/widgets'),
};

// ─── Statistiques globales ───────────────────────────────────────
export const stats = {
  getGlobal: () => api.get('/stats/global'),
  getDaily: (params?: any) => api.get('/stats/daily', { params }),
  getMonthly: (params?: any) => api.get('/stats/monthly', { params }),
  getYearly: (params?: any) => api.get('/stats/yearly', { params }),
  getRealtime: () => api.get('/stats/realtime'),
};

// ─── Upload de fichiers ──────────────────────────────────────────
export const upload = {
  single: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  multiple: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    return api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id: string) => api.delete(`/upload/${id}`),
  getAll: (params?: any) => api.get('/upload', { params }),
  getById: (id: string) => api.get(`/upload/${id}`),
};

// ─── Exports (nouvelle API) ──────────────────────────────────────
export const exports = {
  /**
   * Récupère l'historique des exports
   * GET /api/exports?page=1&limit=50
   */
  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/exports', { params }),

  /**
   * Télécharge directement un fichier d'export
   * GET /api/exports/:type/:format
   * Exemple : /exports/registrations/csv
   */
  download: (type: string, format: string, filters?: any) =>
    api.get(`/exports/${type}/${format}`, {
      params: filters,
      responseType: 'blob',
    }),

  /**
   * Télécharge un fichier depuis l'historique
   * GET /api/exports/:id/download
   */
  downloadById: (id: string) =>
    api.get(`/exports/${id}/download`, { responseType: 'blob' }),

  /**
   * Récupère un export par ID
   */
  getById: (id: string) => api.get(`/exports/${id}`),

  /**
   * Supprime un export de l'historique
   */
  delete: (id: string) => api.delete(`/exports/${id}`),

  /**
   * Statistiques des exports
   */
  getStats: () => api.get('/exports/stats'),

  /**
   * Crée un export asynchrone
   * POST /api/exports
   * Body: { type, format, filters }
   */
  create: (data: { type: string; format: string; filters?: any }) =>
    api.post('/exports', data),
};

// ─── Ancien exportApi (conservé pour compatibilité) ─────────────
export const exportApi = {
  getRegistrations: (format: string, params?: any) =>
    api.get(`/export/registrations/${format}`, { params, responseType: 'blob' }),
  getMembers: (format: string, params?: any) =>
    api.get(`/export/members/${format}`, { params, responseType: 'blob' }),
  getPayments: (format: string, params?: any) =>
    api.get(`/export/payments/${format}`, { params, responseType: 'blob' }),
  getFormations: (format: string, params?: any) =>
    api.get(`/export/formations/${format}`, { params, responseType: 'blob' }),
  getProjects: (format: string, params?: any) =>
    api.get(`/export/projects/${format}`, { params, responseType: 'blob' }),
  getArticles: (format: string, params?: any) =>
    api.get(`/export/articles/${format}`, { params, responseType: 'blob' }),
};

// ─── Notifications ───────────────────────────────────────────────
export const notifications = {
  /**
   * Récupère les notifications de l'utilisateur connecté
   * GET /api/notifications/my-notifications
   */
  getMy: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications/my-notifications', { params }),

  /**
   * Récupère toutes les notifications (admin)
   */
  getAll: (params?: any) => api.get('/notifications', { params }),

  /**
   * Nombre de notifications non lues
   */
  getUnreadCount: () => api.get('/notifications/unread-count'),

  /**
   * Marquer une notification comme lue
   */
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  /**
   * Marquer TOUTES les notifications comme lues
   */
  markAllAsRead: () => api.put('/notifications/read-all'),

  /**
   * Supprimer une notification
   */
  delete: (id: string) => api.delete(`/notifications/${id}`),

  /**
   * Créer une notification (admin)
   */
  create: (data: {
    userId?: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
  }) => api.post('/notifications/admin', data),

  /**
   * Supprimer n'importe quelle notification (admin)
   */
  deleteAdmin: (id: string) => api.delete(`/notifications/admin/${id}`),
};

export default api;