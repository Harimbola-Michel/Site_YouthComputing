export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    STATS: '/users/stats',
    TOGGLE_ACTIVE: (id: string) => `/users/${id}/toggle-active`,
  },

  // Formations
  FORMATIONS: {
    LIST: '/formations',
    DETAIL: (slug: string) => `/formations/${slug}`,
    DETAIL_BY_ID: (id: string) => `/formations/id/${id}`,
    CREATE: '/formations',
    UPDATE: (id: string) => `/formations/${id}`,
    DELETE: (id: string) => `/formations/${id}`,
    PUBLISHED: '/formations/published',
    CATEGORY: (category: string) => `/formations/category/${category}`,
    LEVEL: (level: string) => `/formations/level/${level}`,
    STATS: '/formations/stats',
    POPULAR: '/formations/popular',
    SESSIONS: (id: string) => `/formations/${id}/sessions`,
    REGISTER: (id: string) => `/formations/${id}/register`,
  },

  // Registrations
  REGISTRATIONS: {
    LIST: '/registrations',
    DETAIL: (id: string) => `/registrations/${id}`,
    CREATE: '/registrations',
    UPDATE: (id: string) => `/registrations/${id}`,
    DELETE: (id: string) => `/registrations/${id}`,
    CONFIRM: (id: string) => `/registrations/${id}/confirm`,
    CANCEL: (id: string) => `/registrations/${id}/cancel`,
    COMPLETE: (id: string) => `/registrations/${id}/complete`,
    STATS: '/registrations/stats',
    REVENUE: '/registrations/revenue',
    BY_FORMATION: (formationId: string) =>
      `/registrations/formation/${formationId}`,
    BY_SESSION: (sessionId: string) => `/registrations/session/${sessionId}`,
  },

  // Y2C
  Y2C: {
    MEMBERS: '/y2c/members',
    MEMBER_DETAIL: (id: string) => `/y2c/members/${id}`,
    MEMBER_CREATE: '/y2c/members',
    MEMBER_UPDATE: (id: string) => `/y2c/members/${id}`,
    MEMBER_DELETE: (id: string) => `/y2c/members/${id}`,
    MEMBER_APPROVE: (id: string) => `/y2c/members/${id}/approve`,
    MEMBER_STATS: '/y2c/members/stats',
    EVENTS: '/y2c/events',
    EVENT_DETAIL: (id: string) => `/y2c/events/${id}`,
    EVENT_CREATE: '/y2c/events',
    EVENT_UPDATE: (id: string) => `/y2c/events/${id}`,
    EVENT_DELETE: (id: string) => `/y2c/events/${id}`,
    EVENT_STATS: '/y2c/events/stats',
    EVENT_REGISTER: (id: string) => `/y2c/events/${id}/register`,
    EVENT_REGISTRATIONS: (id: string) => `/y2c/events/${id}/registrations`,
  },

  // Articles
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (slug: string) => `/articles/${slug}`,
    DETAIL_BY_ID: (id: string) => `/articles/id/${id}`,
    CREATE: '/articles',
    UPDATE: (id: string) => `/articles/${id}`,
    DELETE: (id: string) => `/articles/${id}`,
    PUBLISHED: '/articles/published',
    STATS: '/articles/stats',
    MOST_VIEWED: '/articles/most-viewed',
    COMMENTS: (articleId: string) => `/articles/${articleId}/comments`,
    CREATE_COMMENT: '/articles/comments',
    APPROVE_COMMENT: (id: string) => `/articles/comments/${id}/approve`,
    DELETE_COMMENT: (id: string) => `/articles/comments/${id}`,
  },

  // Projects
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (slug: string) => `/projects/${slug}`,
    DETAIL_BY_ID: (id: string) => `/projects/id/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    FEATURED: '/projects/featured',
    CATEGORY: (category: string) => `/projects/category/${category}`,
    YEAR: (year: number) => `/projects/year/${year}`,
    STATS: '/projects/stats',
    METRICS: (projectId: string) => `/projects/${projectId}/metrics`,
    CREATE_METRIC: (projectId: string) =>
      `/projects/${projectId}/metrics`,
    UPDATE_METRIC: (id: string) => `/projects/metrics/${id}`,
    DELETE_METRIC: (id: string) => `/projects/metrics/${id}`,
  },

  // Events
  EVENTS: {
    LIST: '/events',
    DETAIL: (slug: string) => `/events/${slug}`,
    DETAIL_BY_ID: (id: string) => `/events/id/${id}`,
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
    PUBLISHED: '/events/published',
    UPCOMING: '/events/upcoming',
    TYPE: (type: string) => `/events/type/${type}`,
    STATS: '/events/stats',
    REGISTRATIONS: (id: string) => `/events/${id}/registrations`,
    REGISTER: (id: string) => `/events/${id}/register`,
    CONFIRM_REGISTRATION: (id: string) =>
      `/events/registrations/${id}/confirm`,
    CANCEL_REGISTRATION: (id: string) =>
      `/events/registrations/${id}/cancel`,
  },

  // Contact
  CONTACT: {
    SEND: '/contact',
    LIST: '/contact',
    DETAIL: (id: string) => `/contact/${id}`,
    REPLY: (id: string) => `/contact/${id}/reply`,
    DELETE: (id: string) => `/contact/${id}`,
    MARK_READ: (id: string) => `/contact/${id}/read`,
    STATS: '/contact/stats',
  },

  // Payments
  PAYMENTS: {
    LIST: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
    CREATE: '/payments',
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
    CONFIRM: (id: string) => `/payments/${id}/confirm`,
    FAIL: (id: string) => `/payments/${id}/fail`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    STATS: '/payments/stats',
    MY_PAYMENTS: '/payments/my-payments',
  },

  // Partners
  PARTNERS: {
    LIST: '/partners',
    DETAIL: (id: string) => `/partners/${id}`,
    CREATE: '/partners',
    UPDATE: (id: string) => `/partners/${id}`,
    DELETE: (id: string) => `/partners/${id}`,
    ACTIVE: '/partners/active',
    TOGGLE_ACTIVE: (id: string) => `/partners/${id}/toggle-active`,
    STATS: '/partners/stats',
  },

  // Recruitments
  RECRUITMENTS: {
    LIST: '/recruitments',
    DETAIL: (slug: string) => `/recruitments/${slug}`,
    DETAIL_BY_ID: (id: string) => `/recruitments/id/${id}`,
    CREATE: '/recruitments',
    UPDATE: (id: string) => `/recruitments/${id}`,
    DELETE: (id: string) => `/recruitments/${id}`,
    ACTIVE: '/recruitments/active',
    STATS: '/recruitments/stats',
    APPLY: '/recruitments/apply',
    CANDIDATURES: (id: string) => `/recruitments/${id}/candidatures`,
    CANDIDATURE_STATS: (id: string) =>
      `/recruitments/${id}/candidatures/stats`,
  },

  // Candidatures
  CANDIDATURES: {
    LIST: '/candidatures',
    DETAIL: (id: string) => `/candidatures/${id}`,
    CREATE: '/candidatures',
    UPDATE: (id: string) => `/candidatures/${id}`,
    DELETE: (id: string) => `/candidatures/${id}`,
    STATS: '/candidatures/stats',
    BY_RECRUITMENT: (recruitmentId: string) =>
      `/candidatures/recruitment/${recruitmentId}`,
    INTERVIEWS: (id: string) => `/candidatures/${id}/interviews`,
    SCHEDULE_INTERVIEW: (id: string) =>
      `/candidatures/${id}/interviews`,
    UPDATE_INTERVIEW: (id: string) => `/candidatures/interviews/${id}`,
    EVALUATIONS: (id: string) => `/candidatures/${id}/evaluations`,
    ADD_EVALUATION: (id: string) => `/candidatures/${id}/evaluations`,
    SCORE: (id: string) => `/candidatures/${id}/score`,
  },

  // Team
  TEAM: {
    LIST: '/team',
    DETAIL: (id: string) => `/team/${id}`,
    CREATE: '/team',
    UPDATE: (id: string) => `/team/${id}`,
    DELETE: (id: string) => `/team/${id}`,
    ACTIVE: '/team/active',
    DEPARTMENT: (department: string) => `/team/department/${department}`,
    REORDER: '/team/reorder',
    TOGGLE_ACTIVE: (id: string) => `/team/${id}/toggle-active`,
    STATS: '/team/stats',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    QUICK_STATS: '/dashboard/quick-stats',
    CHART: '/dashboard/chart',
    ACTIVITIES: '/dashboard/activities',
    NOTIFICATIONS: '/dashboard/notifications',
    PERFORMANCE: '/dashboard/performance',
    WIDGETS: '/dashboard/widgets',
  },

  // Stats
  STATS: {
    GLOBAL: '/stats/global',
    DAILY: '/stats/daily',
    MONTHLY: '/stats/monthly',
    YEARLY: '/stats/yearly',
    REALTIME: '/stats/realtime',
  },

  // Export
  EXPORT: {
    REGISTRATIONS: (format: string) => `/export/registrations/${format}`,
    MEMBERS: (format: string) => `/export/members/${format}`,
    PAYMENTS: (format: string) => `/export/payments/${format}`,
    FORMATIONS: (format: string) => `/export/formations/${format}`,
    PROJECTS: (format: string) => `/export/projects/${format}`,
    ARTICLES: (format: string) => `/export/articles/${format}`,
  },

  // Upload
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
    DELETE: (id: string) => `/upload/${id}`,
    LIST: '/upload',
    DETAIL: (id: string) => `/upload/${id}`,
  },
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS;