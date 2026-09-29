'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { FormationGrid } from './components/FormationGrid';
import { FormationListView } from './components/FormationListView';
import { FormationFilters } from './components/FormationFilters';
import { FormationSearch } from './components/FormationSearch';
import { ViewToggle } from './components/ViewToggle';
import { formations } from '@/lib/api';
import type { Formation } from '@/types';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 🔁 Délai exponentiel avec jitter
const getRetryDelay = (attempt: number) => {
  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
  const jitter = 0.8 + Math.random() * 0.4;
  return Math.floor(baseDelay * jitter);
};

export default function FormationsPage() {
  const [formationsData, setFormationsData] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFormations = useCallback(async (signal?: AbortSignal, skipRetry = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const abortSignal = signal || controller.signal;

    try {
      setIsLoading(true);
      setError(null);
      setIsRetrying(false);

      const params = { ...filters, search: searchQuery };
      const response = await formations.getPublished({ params, signal: abortSignal });
      const data = response?.data?.data ?? response?.data ?? [];
      setFormationsData(Array.isArray(data) ? data : []);
      setRetryCount(0);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }

      console.error('❌ Erreur chargement formations:', err);

      let errorMsg = 'Impossible de charger les formations.';
      const status = err.response?.status;

      if (status === 429) {
        errorMsg = 'Trop de requêtes. Veuillez patienter avant de réessayer.';
        if (!skipRetry && retryCount < 3) {
          const delay = getRetryDelay(retryCount);
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          toast.loading(`Tentative de reconnexion (${retryCount + 1}/3)...`, { duration: delay });
          setTimeout(() => {
            fetchFormations(undefined, false);
          }, delay);
          return;
        } else if (retryCount >= 3) {
          errorMsg = 'Le serveur est saturé. Veuillez réessayer dans quelques minutes.';
        }
      } else if (status === 404) {
        errorMsg = 'Aucune formation trouvée.';
        setFormationsData([]);
      } else {
        errorMsg = err?.message || 'Une erreur est survenue.';
      }

      setError(errorMsg);
      toast.error(errorMsg);
      setFormationsData([]);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [filters, searchQuery, retryCount]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFormations(controller.signal);
    return () => {
      controller.abort();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRetryCount(0);
    fetchFormations(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery]);

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchFormations(undefined, true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* ─── Hero Section ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 py-16 md:py-24">
          {/* ✅ Aucune image de fond qui provoque une 404 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4"
            >
              <Sparkles className="h-4 w-4" />
              Apprendre autrement
            </motion.div>
            <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
              Nos <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Formations</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Découvrez nos programmes de formation en NTIC, conçus pour vous accompagner dans votre développement professionnel.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                onClick={() => document.getElementById('formations-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="h-4 w-4" />
                Explorer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ─── Contenu principal ────────────────────────────────── */}
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl" id="formations-section">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <FormationSearch onSearch={handleSearch} initialValue={searchQuery} />
              </div>
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
            <FormationFilters onFilterChange={handleFilterChange} />
          </div>

          {/* État d’erreur */}
          {error && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-destructive/20 p-12 text-center my-8">
              <p className="text-lg font-medium text-destructive">{error}</p>
              {!isRetrying && (
                <Button variant="outline" className="mt-4 gap-2" onClick={handleRetry}>
                  Réessayer
                </Button>
              )}
              {isRetrying && (
                <p className="mt-2 text-sm text-muted-foreground">Nouvelle tentative en cours...</p>
              )}
            </div>
          )}

          {/* Affichage des formations */}
          {!error && (
            <>
              {viewMode === 'grid' ? (
                <FormationGrid formations={formationsData} loading={isLoading} />
              ) : (
                <FormationListView formations={formationsData} loading={isLoading} />
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}