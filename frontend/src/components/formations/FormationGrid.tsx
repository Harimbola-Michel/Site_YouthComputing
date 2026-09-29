'use client';

import { motion } from 'framer-motion';
import { FormationCard } from './FormationCard';
import { Formation } from '@/types';
import { cn } from '@/lib/utils';

interface FormationGridProps {
  formations: Formation[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  emptyMessage?: string;
}

export function FormationGrid({
  formations,
  className,
  columns = 3,
  loading = false,
  emptyMessage = 'Aucune formation trouvée',
}: FormationGridProps) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[400px] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!formations || formations.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Essayez de modifier vos filtres ou revenez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', cols[columns], className)}>
      {formations.map((formation, index) => (
        <FormationCard key={formation.id} formation={formation} index={index} />
      ))}
    </div>
  );
}