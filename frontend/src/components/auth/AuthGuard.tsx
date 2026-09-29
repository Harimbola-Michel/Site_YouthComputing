'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  fallbackPath = '/connexion',
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath);
    }
  }, [isLoading, isAuthenticated, router, fallbackPath]);

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}