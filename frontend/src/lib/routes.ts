// src/lib/routes.ts

// ============================================================
// 1. ROUTES PUBLIQUES — accessibles SANS connexion (visiteur)
// ============================================================
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/a-propos',
  FORMATIONS: '/formations',
  FORMATION_DETAIL: (slug: string) => `/formations/${slug}`,
  Y2C: '/communaute-y2c',
  PROJECTS: '/projets',
  PROJECT_DETAIL: (slug: string) => `/projets/${slug}`,
  BLOG: '/blog',
  ARTICLE: (slug: string) => `/blog/${slug}`,
  EVENTS: '/evenements',
  EVENT_DETAIL: (slug: string) => `/evenements/${slug}`,
  CONTACT: '/contact',
  MENTIONS_LEGALES: '/mentions-legales',
  CONFIDENTIALITE: '/confidentialite',
} as const;

// ============================================================
// 2. ROUTES AUTH — accessibles aux visiteurs
// ============================================================
export const AUTH_ROUTES = {
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',
  VERIFY_EMAIL: '/verifier-email',
} as const;

// ============================================================
// 3. ROUTES ADMIN — protégées + permissions associées
// ============================================================
export const ADMIN_ROUTES = {
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Formations
  ADMIN_FORMATIONS: '/admin/formations',
  ADMIN_FORMATION_NEW: '/admin/formations/nouveau',
  ADMIN_FORMATION_EDIT: (id: string) => `/admin/formations/${id}`,
  ADMIN_REGISTRATIONS: '/admin/inscriptions',

  // Y2C
  ADMIN_Y2C_MEMBERS: '/admin/y2c/membres',
  ADMIN_Y2C_EVENTS: '/admin/y2c/evenements',

  // Articles / Blog
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_ARTICLE_NEW: '/admin/articles/nouveau',
  ADMIN_ARTICLE_EDIT: (id: string) => `/admin/articles/${id}`,

  // Projets
  ADMIN_PROJECTS: '/admin/projets-admin',
  ADMIN_PROJECT_NEW: '/admin/projets-admin/nouveau',
  ADMIN_PROJECT_EDIT: (id: string) => `/admin/projets-admin/${id}`,

  // Équipe
  ADMIN_TEAM: '/admin/team',
  ADMIN_TEAM_STATS: '/admin/team/stats',

  // Utilisateurs
  ADMIN_USERS: '/admin/utilisateurs',

  // Messages & Partenaires & Recrutements
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_PARTNERS: '/admin/partenaires',
  ADMIN_RECRUITMENTS: '/admin/recrutements',
  ADMIN_CANDIDATURES: '/admin/candidatures',

  // 💰 Paiements (permission : manage_payments)
  ADMIN_PAYMENTS: '/admin/paiements',

  // Exports & Paramètres
  ADMIN_EXPORTS: '/admin/exports',
  ADMIN_SETTINGS: '/admin/parametres',
} as const;

// ============================================================
// 4. ROUTES PROTÉGÉES (utilisateur connecté, hors admin)
// ============================================================
export const PRIVATE_ROUTES = {
  MON_COMPTE: '/mon-compte',
  MES_FORMATIONS: '/mes-formations',
  MES_INSCRIPTIONS: '/mes-inscriptions',
  MES_PAIEMENTS: '/mes-paiements',
  PROFIL: '/profil',
} as const;

// ============================================================
// 5. REGROUPEMENT GLOBAL
// ============================================================
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
  ...PRIVATE_ROUTES,
} as const;

// ============================================================
// 6. TYPES
// ============================================================
export type RouteKey = keyof typeof ROUTES;
export type RouteValue = typeof ROUTES[RouteKey];

// ============================================================
// 7. HELPERS — vérification d'accès
// ============================================================
const PUBLIC_PATHS: string[] = [
  '/',
  '/a-propos',
  '/formations',
  '/communaute-y2c',
  '/projets',
  '/blog',
  '/evenements',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
  '/verifier-email',
];

const PROTECTED_PREFIXES = [
  '/admin',
  '/mon-compte',
  '/mes-formations',
  '/mes-inscriptions',
  '/mes-paiements',
  '/profil',
];

/** Vrai si le chemin est public (accessible sans connexion) */
export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Gère les sous-routes publiques (ex: /formations/mon-slug, /blog/article-x)
  return PUBLIC_PATHS.some(
    (p) => p !== '/' && pathname.startsWith(p + '/')
  );
}

/** Vrai si le chemin est protégé (connexion requise) */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
}

// ============================================================
// 8. MAP ROUTE → PERMISSION REQUISE
// ============================================================
import type { Permission } from '@/hooks/usePermissions';

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/admin/dashboard': 'view_dashboard',
  '/admin/utilisateurs': 'manage_users',
  '/admin/formations': 'manage_formations',
  '/admin/inscriptions': 'manage_formations',
  '/admin/y2c/membres': 'manage_y2c',
  '/admin/y2c/evenements': 'manage_y2c',
  '/admin/articles': 'manage_articles',
  '/admin/projets-admin': 'manage_projects',
  '/admin/team': 'manage_team',
  '/admin/partenaires': 'manage_partners',
  '/admin/recrutements': 'manage_recruitments',
  '/admin/candidatures': 'manage_recruitments',
  '/admin/paiements': 'manage_payments',      // ✅ corrigé
  '/admin/exports': 'export_data',
  '/admin/parametres': 'manage_roles',
  '/admin/messages': 'manage_contact',
};

/** Retourne la permission requise pour un chemin admin (ou null) */
export function getRequiredPermission(pathname: string): Permission | null {
  // Match exact d'abord
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  // Puis match par préfixe
  const match = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length) // plus spécifique d'abord
    .find((route) => pathname.startsWith(route + '/'));
  return match ? ROUTE_PERMISSIONS[match] : null;
}