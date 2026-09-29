export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Content management
  MANAGE_ARTICLES: 'manage_articles',
  MANAGE_FORMATIONS: 'manage_formations',
  MANAGE_Y2C: 'manage_y2c',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_TEAM: 'manage_team',
  MANAGE_PARTNERS: 'manage_partners',
  MANAGE_RECRUITMENTS: 'manage_recruitments',
  
  // Dashboard and reports
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // System
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_CONTACT: 'manage_contact',
  MANAGE_PAYMENTS: 'manage_payments',
  
  // All permissions
  ALL: '*',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
  ],
  CONTENT_MANAGEMENT: [
    PERMISSIONS.MANAGE_ARTICLES,
    PERMISSIONS.MANAGE_FORMATIONS,
    PERMISSIONS.MANAGE_Y2C,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.MANAGE_PARTNERS,
    PERMISSIONS.MANAGE_RECRUITMENTS,
  ],
  DASHBOARD: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
  ],
  SYSTEM: [
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_CONTACT,
    PERMISSIONS.MANAGE_PAYMENTS,
  ],
} as const;

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.MANAGE_USERS]: 'Gérer les utilisateurs',
  [PERMISSIONS.MANAGE_ROLES]: 'Gérer les rôles',
  [PERMISSIONS.MANAGE_ARTICLES]: 'Gérer les articles',
  [PERMISSIONS.MANAGE_FORMATIONS]: 'Gérer les formations',
  [PERMISSIONS.MANAGE_Y2C]: 'Gérer la communauté Y2C',
  [PERMISSIONS.MANAGE_PROJECTS]: 'Gérer les projets',
  [PERMISSIONS.MANAGE_EVENTS]: 'Gérer les événements',
  [PERMISSIONS.MANAGE_TEAM]: 'Gérer l\'équipe',
  [PERMISSIONS.MANAGE_PARTNERS]: 'Gérer les partenaires',
  [PERMISSIONS.MANAGE_RECRUITMENTS]: 'Gérer les recrutements',
  [PERMISSIONS.VIEW_DASHBOARD]: 'Voir le tableau de bord',
  [PERMISSIONS.VIEW_REPORTS]: 'Voir les rapports',
  [PERMISSIONS.EXPORT_DATA]: 'Exporter les données',
  [PERMISSIONS.MANAGE_SETTINGS]: 'Gérer les paramètres',
  [PERMISSIONS.MANAGE_CONTACT]: 'Gérer les messages de contact',
  [PERMISSIONS.MANAGE_PAYMENTS]: 'Gérer les paiements',
  [PERMISSIONS.ALL]: 'Toutes les permissions',
};