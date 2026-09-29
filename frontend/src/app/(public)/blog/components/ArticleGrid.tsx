'use client';

import { motion } from 'framer-motion';
import { ArticleCard } from './ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Article } from './ArticleCard';

interface ArticleGridProps {
  articles?: Article[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ArticleGrid({
  articles = [],
  loading = false,
  error = null,
  onRetry,
}: ArticleGridProps) {
  const safeArticles = Array.isArray(articles) ? articles : [];

  // ─── État de chargement ────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-card p-4 border border-border/50">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── État d’erreur ────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-12 text-center backdrop-blur-sm"
      >
        <AlertCircle className="h-12 w-12 text-destructive/60" />
        <p className="mt-4 text-lg font-medium text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          Une erreur est survenue lors du chargement des articles.
        </p>
        {onRetry && (
          <Button variant="outline" className="mt-4 gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        )}
      </motion.div>
    );
  }

  // ─── Aucun article ────────────────────────────────────────────
  if (safeArticles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center"
      >
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg font-medium text-muted-foreground">Aucun article publié</p>
        <p className="text-sm text-muted-foreground/60 max-w-sm">
          Revenez plus tard pour découvrir de nouveaux contenus sur la transformation numérique à Madagascar.
        </p>
      </motion.div>
    );
  }

  // ─── Grille ────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {safeArticles.map((article, index) => (
        <ArticleCard
          key={article.id || `article-${index}`}
          article={article}
          index={index}
        />
      ))}
    </motion.div>
  );
}