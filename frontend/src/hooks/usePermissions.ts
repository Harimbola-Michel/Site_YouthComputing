// src/hooks/usePermissions.ts
'use client';

import { useAuth } from '@/hooks/useAuth';

// ============================================================
// TYPES
// ============================================================
export type Permission =
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_articles'
  | 'manage_formations'
  | 'manage_y2c'
  | 'manage_projects'
  | 'manage_events'
  | 'manage_team'
  | 'manage_partners'
  | 'manage_recruitments'
  | 'manage_payments'      // ✅ corrigé
  | 'manage_contact'
  | 'export_data'
  | 'view_reports';

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'CONTRIBUTOR'
  | 'MEMBER_Y2C'
  | 'USER'
  | 'VIEWER'
  | 'VISITOR'; // 🔓 visiteur non connecté

// ============================================================
// MATRICE RÔLE → PERMISSIONS
// ============================================================
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'view_dashboard',
    'manage_users',
    'manage_roles',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_payments',
    'manage_contact',
    'export_data',
    'view_reports',
  ],
  ADMIN: [
    'view_dashboard',
    'manage_users',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_payments',   // ✅ ADMIN gère les paiements
    'manage_contact',
    'export_data',
    'view_reports',
  ],
  EDITOR: [
    'view_dashboard',
    'manage_articles',
    'manage_formations',
    'manage_y2c',
    'manage_projects',
    'manage_events',
    'manage_team',
    'manage_partners',
    'manage_recruitments',
    'manage_contact',
  ],
  CONTRIBUTOR: ['view_dashboard'],
  MEMBER_Y2C: [],
  USER: [],
  VIEWER: [],
  VISITOR: [], // 🔓 rien à voir avec l'admin — juste navigation publique
};

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export const usePermissions = () => {
  const { user } = useAuth();

  // 🔓 Si pas d'utilisateur → VISITOR (pas VIEWER)
  //    Ça évite de bloquer les pages publiques.
  const role: Role = (user?.role as Role) || 'VISITOR';
  const isAuthenticated = !!user;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const isEditor = role === 'EDITOR';
  const isContributor = role === 'CONTRIBUTOR';
  const isViewer = role === 'VIEWER';
  const isVisitor = role === 'VISITOR';

  const hasRole = (roles: string[]): boolean => roles.includes(role);

  const hasPermission = (permission: Permission): boolean => {
    if (isSuperAdmin) return true;
    return (ROLE_PERMISSIONS[role] || []).includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((p) => hasPermission(p));

  // ─── Helpers métier ───
  return {
    // Rôle & état
    role,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isEditor,
    isContributor,
    isViewer,
    isVisitor,

    // Helpers génériques
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // 🔑 Helpers spécifiques (source de vérité)
    canManageUsers: isAdmin,
    canManageRoles: isSuperAdmin,
    canManagePayments: isAdmin,       // ✅ 'manage_payments' exposé
    canEditContent: isEditor || isAdmin,
    canViewDashboard: isAuthenticated, // ✅ tout utilisateur connecté
    canManageSettings: isAdmin,
    canExportData: isAdmin,
    canViewReports: isAdmin,

    // 🔓 Public — visiteur peut naviguer partout sur le site public
    canBrowsePublic: true,
  };
};

// ============================================================
// EXPORTS UTILITAIRES (hors hook — pour SSR/middleware)
// ============================================================
export function roleHasPermission(role: Role, permission: Permission): boolean {
  if (role === 'SUPER_ADMIN') return true;
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

export { ROLE_PERMISSIONS };