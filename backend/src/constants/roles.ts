export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  CONTRIBUTOR: 'CONTRIBUTOR',
  VIEWER: 'VIEWER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.EDITOR]: 3,
  [ROLES.CONTRIBUTOR]: 2,
  [ROLES.VIEWER]: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Administrateur',
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.EDITOR]: 'Éditeur',
  [ROLES.CONTRIBUTOR]: 'Contributeur',
  [ROLES.VIEWER]: 'Visiteur',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'view_dashboard',
    'view_reports',
    'export_data',
    'manage_contact',
    'manage_payments',
  ],
  [ROLES.EDITOR]: [
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'view_dashboard',
  ],
  [ROLES.CONTRIBUTOR]: [
    'manage_articles',
    'manage_projects',
  ],
  [ROLES.VIEWER]: [],
};