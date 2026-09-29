'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { NewsFeed } from './components/NewsFeed';
import { articles } from '@/lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function ActualitesPage() {
  const [articlesData, setArticlesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchArticles = async (showToast: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await articles.getPublished();
      // Extraction robuste des données
      const data = response?.data?.data ?? response?.data ?? [];
      setArticlesData(Array.isArray(data) ? data : []);
      if (showToast) {
        toast.success('✅ Actualités actualisées');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des actualités:', error);
      setError(error?.message || 'Impossible de charger les actualités');
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles(false);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchArticles(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* ─── Hero Section ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4"
            >
              📰 Dernières actualités
            </motion.div>
            <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
              Actualités <span className="text-secondary">Youth Computing</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Restez informé des dernières nouvelles, événements et projets de notre communauté.
            </p>
          </motion.div>
        </section>

        {/* ─── Contenu ────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Barre d'outils */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? 'Chargement...'
                  : `${articlesData.length} article${articlesData.length > 1 ? 's' : ''} trouvé${articlesData.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* État d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl border-2 border-destructive/20 bg-destructive/5 p-6 text-center"
            >
              <AlertCircle className="mx-auto h-10 w-10 text-destructive/60" />
              <p className="mt-2 text-lg font-medium text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Réessayer
              </Button>
            </motion.div>
          )}

          {/* Flux d'actualités */}
          {!error && (
            <NewsFeed
              articles={articlesData}
              loading={isLoading}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}