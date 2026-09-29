// src/components/auth/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/connexion',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  const redirectUrl = useMemo(() => {
    const returnUrl = encodeURIComponent(pathname);
    return `${redirectTo}?returnUrl=${returnUrl}`;
  }, [pathname, redirectTo]);

  const handleUnauthorized = useCallback(() => {
    router.push(redirectUrl);
  }, [router, redirectUrl]);

  const handleForbidden = useCallback(() => {
    router.push('/unauthorized');
  }, [router]);

  useEffect(() => {
    if (isLoading) {
      // On attend le chargement
      return;
    }

    if (!isAuthenticated) {
      handleUnauthorized();
      setIsChecking(false);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      handleForbidden();
      setIsChecking(false);
      return;
    }

    // Tout est ok
    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, allowedRoles, handleUnauthorized, handleForbidden]);

  if (isLoading || isChecking) {
    return <LoadingSpinner fullScreen label="Vérification des accès..." />;
  }

  // Si l'utilisateur n'est pas autorisé (mais normalement déjà redirigé)
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}