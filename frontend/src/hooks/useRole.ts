// hooks/useRole.ts
import { useAuth } from '@/contexts/AuthContext';

// Définition des permissions disponibles (optionnel, peut être externalisé)
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
  | 'manage_payments'
  | 'manage_contact'
  | 'export_data'
  | 'view_reports';

// Mapping rôle -> permissions
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
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
    'manage_payments',
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
  ],
  CONTRIBUTOR: [
    'view_dashboard',
    // Les contributeurs peuvent proposer des articles, etc.
  ],
  VIEWER: [
    // Pas de permissions spécifiques, seulement la lecture publique
  ],
};

/**
 * Hook personnalisé pour gérer les rôles et permissions
 * Si l'utilisateur n'est pas connecté, on le considère comme VIEWER (fallback)
 */
export function useRole() {
  const { user } = useAuth();

  // Rôle par défaut : VIEWER si non connecté ou pas de rôle
  const role = user?.role || 'VIEWER';

  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isEditor = role === 'EDITOR';
  const isContributor = role === 'CONTRIBUTOR';
  const isViewer = role === 'VIEWER';

  // Vérifier si l'utilisateur a un des rôles donnés
  const hasRole = (roles: string[]): boolean => {
    return roles.includes(role);
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission: Permission): boolean => {
    if (role === 'SUPER_ADMIN') return true; // Super Admin a tout
    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes(permission);
  };

  // Vérifier si l'utilisateur a au moins une des permissions données
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  // Vérifier si l'utilisateur a toutes les permissions données
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return {
    // États booléens
    isAdmin,
    isSuperAdmin,
    isEditor,
    isContributor,
    isViewer,
    // Rôle actuel
    role,
    // Méthodes utilitaires
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}