'use client';

import { motion } from 'framer-motion';
import { FormationCard } from './FormationCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Formation } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';

interface FormationGridProps {
  formations: Formation[];
  loading?: boolean;
  onRegister?: (formationId: string, sessionId: string) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export function FormationGrid({
  formations,
  loading = false,
  onRegister,
  onRefresh,
  emptyMessage = 'Aucune formation trouvée',
}: FormationGridProps) {
  const safeFormations = Array.isArray(formations) ? formations : [];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (safeFormations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="rounded-full bg-muted/30 p-6 mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{emptyMessage}</h3>
        <p className="mt-2 text-muted-foreground max-w-md">
          Aucune formation ne correspond à vos critères. Essayez de modifier votre recherche
          ou de consulter les formations disponibles.
        </p>
        {onRefresh && (
          <Button variant="outline" className="mt-6 gap-2" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {safeFormations.map((formation, index) => (
        <FormationCard
          key={formation.id || `formation-${index}`}
          formation={formation}
          index={index}
          onRegister={onRegister}
          isFeatured={index < 2}
        />
      ))}
    </div>
  );
}