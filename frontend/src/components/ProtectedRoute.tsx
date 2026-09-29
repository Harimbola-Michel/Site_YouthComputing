// src/components/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/hooks/usePermissions';

// ============================================================
// TYPES
// ============================================================
interface ProtectedRouteProps {
  children: ReactNode;
  /** Rôles autorisés (ex: ['ADMIN', 'SUPER_ADMIN']) */
  roles?: string[];
  /** Permissions requises (ex: ['manage_payments']) */
  permissions?: Permission[];
  /** Si true : TOUTES les permissions sont requises. Sinon : au moins une. */
  requireAll?: boolean;
  /** URL de redirection si non connecté */
  redirectTo?: string;
  /** Affiche une page d'erreur inline au lieu de rediriger (accès refusé) */
  showError?: boolean;
  /** Composant de chargement personnalisé */
  loadingComponent?: ReactNode;
}

// ============================================================
// COMPOSANT
// ============================================================
export default function ProtectedRoute({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  redirectTo = '/connexion',
  showError = true,
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasRole, hasAnyPermission, hasAllPermissions } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();

  // ─── Stabilisation des tableaux (évite les re-runs infinis) ───
  const rolesKey = useMemo(() => roles.join('|'), [roles]);
  const permissionsKey = useMemo(() => permissions.join('|'), [permissions]);

  // ─── Calcul de l'autorisation (dérivé, pas d'état) ───
  const { isAuthorized, reason } = useMemo(() => {
    if (!user) {
      return { isAuthorized: false, reason: 'unauthenticated' as const };
    }
    if (roles.length > 0 && !hasRole(roles)) {
      return { isAuthorized: false, reason: 'role' as const };
    }
    if (permissions.length > 0) {
      const ok = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
      if (!ok) return { isAuthorized: false, reason: 'permission' as const };
    }
    return { isAuthorized: true, reason: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, rolesKey, permissionsKey, requireAll]);

  // ─── Redirection ───
  useEffect(() => {
    if (loading) return;

    // Non connecté → /connexion avec redirect
    if (!user) {
      const url = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(url);
      return;
    }

    // Connecté mais non autorisé + pas de mode showError → /403
    if (!isAuthorized && !showError) {
      router.replace('/login');
    }
  }, [loading, user, isAuthorized, showError, redirectTo, pathname, router]);

  // ============================================================
  // RENDU
  // ============================================================

  // 1) Chargement
  if (loading) {
    return (
      <>
        {loadingComponent ?? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Vérification des accès…</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // 2) Non connecté → on ne rend rien (redirection en cours)
  if (!user) return null;

  // 3) Non autorisé
  if (!isAuthorized) {
    // Mode redirect → rien à afficher ici
    if (!showError) return null;

    // Mode showError → page d'erreur inline
    const isRoleIssue = reason === 'role';
    const isPermIssue = reason === 'permission';

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200/60 bg-red-50/70 p-6 text-center shadow-sm dark:border-red-800/40 dark:bg-red-950/20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
            Accès refusé
          </h2>
          <p className="mt-2 text-sm text-red-600/80 dark:text-red-300/80">
            {isRoleIssue &&
              "Votre rôle ne vous permet pas d'accéder à cette section."}
            {isPermIssue &&
              "Vous ne disposez pas des permissions nécessaires pour cette page."}
            {!isRoleIssue && !isPermIssue &&
              "Vous n'avez pas les droits nécessaires pour accéder à cette page."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-300/60 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // 4) Autorisé ✅
  return <>{children}</>;
}