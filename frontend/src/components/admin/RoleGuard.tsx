'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="font-ubuntu text-xl font-semibold">Accès non autorisé</h3>
        <p className="text-muted-foreground">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <Link href="/connexion">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="font-ubuntu text-xl font-semibold">Accès refusé</h3>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link href="/admin/dashboard">
          <Button variant="outline">Retour au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}