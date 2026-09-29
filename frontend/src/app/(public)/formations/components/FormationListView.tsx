'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import type { Formation } from '@/types';

interface FormationListViewProps {
  formations: Formation[];
  loading?: boolean;
}

export function FormationListView({ formations, loading = false }: FormationListViewProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (formations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/30 p-4 mb-4">
          <span className="text-4xl">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground">Aucune formation trouvée</h3>
        <p className="mt-2 text-muted-foreground">
          Aucune formation ne correspond à vos critères. Essayez de modifier votre recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 px-4 py-3 text-sm font-medium text-muted-foreground">
        <div className="col-span-5">Titre</div>
        <div className="col-span-2">Catégorie</div>
        <div className="col-span-2">Niveau</div>
        <div className="col-span-1 text-center">Prix</div>
        <div className="col-span-1 text-center">Prochaine session</div>
        <div className="col-span-1 text-right">Action</div>
      </div>
      <div className="divide-y">
        {formations.map((formation, index) => {
          const nextSession = formation.sessions?.find((s) => new Date(s.startDate) > new Date());
          return (
            <motion.div
              key={formation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-muted/30 transition-colors"
            >
              <div className="col-span-5">
                <Link href={`/formations/${formation.slug}`} className="font-medium hover:text-secondary transition-colors">
                  {formation.title}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{formation.description}</p>
              </div>
              <div className="col-span-2">
                <Badge variant="secondary">{formation.category}</Badge>
              </div>
              <div className="col-span-2">
                <Badge variant="outline">{formation.level}</Badge>
              </div>
              <div className="col-span-1 text-center font-medium">
                {formation.price && formation.price > 0 ? formatCurrency(formation.price) : 'Gratuit'}
              </div>
              <div className="col-span-1 text-center text-sm">
                {nextSession ? formatDateShort(nextSession.startDate) : '—'}
              </div>
              <div className="col-span-1 text-right">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link href={`/formations/${formation.slug}`}>
                    Voir
                  </Link>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}