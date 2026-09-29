export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/a-propos',
  FORMATIONS: '/formations',
  FORMATION_DETAIL: (slug: string) => `/formations/${slug}`,
  Y2C: '/communaute-y2c',
  PROJECTS: '/projets',
  PROJECT_DETAIL: (slug: string) => `/projets/${slug}`,
  BLOG: '/blog',
  ARTICLE: (slug: string) => `/blog/${slug}`,
  CONTACT: '/contact',

  // Auth routes
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',

    ADMIN_TEAM: '/admin/team',
  ADMIN_TEAM_STATS: '/admin/team/stats',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_FORMATIONS: '/admin/formations',

  ADMIN_FORMATION_NEW: '/admin/formations/nouveau',
  ADMIN_FORMATION_EDIT: (id: string) => `/admin/formations/${id}`,
  ADMIN_REGISTRATIONS: '/admin/inscriptions',
  ADMIN_Y2C_MEMBERS: '/admin/y2c/membres',
  ADMIN_Y2C_EVENTS: '/admin/y2c/evenements',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_ARTICLE_NEW: '/admin/articles/nouveau',
  ADMIN_ARTICLE_EDIT: (id: string) => `/admin/articles/${id}`,
  ADMIN_PROJECTS: '/admin/projets-admin',
  ADMIN_PROJECT_NEW: '/admin/projets-admin/nouveau',
  ADMIN_PROJECT_EDIT: (id: string) => `/admin/projets-admin/${id}`,
  ADMIN_USERS: '/admin/utilisateurs',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_PARTNERS: '/admin/partenaires',
  ADMIN_RECRUITMENTS: '/admin/recrutements',
  ADMIN_CANDIDATURES: '/admin/candidatures',
  ADMIN_PAYMENTS: '/admin/paiements',
  ADMIN_EXPORTS: '/admin/exports',
  ADMIN_SETTINGS: '/admin/parametres',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];