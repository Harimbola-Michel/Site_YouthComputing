'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { CandidaturesTable } from './components/CandidaturesTable';
import type { Candidature } from './components/CandidaturesTable';
import { CandidatureDetails } from './components/CandidatureDetails';
import { candidatures } from '@/lib/api';
import { extractDataArray } from '@/lib/api-helpers';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminCandidaturesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCandidatures = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      const response = await candidatures.getAll();
      
      // Extraction robuste avec la fonction utilitaire
      const list = extractDataArray<Candidature>(response?.data, []);
      
      // Si la liste est vide, on vérifie si on a une pagination
      if (list.length === 0 && response?.data?.data && Array.isArray(response.data.data)) {
        // On a déjà extrait, mais on peut forcer la récupération
      }
      
      setData(list);
    } catch (err: any) {
      console.error('Erreur chargement candidatures:', err);
      const message = err?.response?.data?.message || 'Impossible de charger les candidatures';
      setError(message);
      toast.error(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchCandidatures();
  }, [authLoading, fetchCandidatures]);

  const handleViewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedCandidature(null);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchCandidatures();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Liste actualisée');
  };

  const handleUpdateSuccess = () => {
    fetchCandidatures();
    toast.success('✅ Candidature mise à jour');
  };

  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Veuillez vous connecter.</p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Candidatures
            </h1>
            <p className="text-muted-foreground">
              Consultez et gérez toutes les candidatures reçues.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Actualisation...' : 'Rafraîchir'}
          </Button>
        </div>

        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchCandidatures} className="ml-auto">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <CandidaturesTable
          data={data}
          loading={loading}
          onViewDetails={handleViewDetails}
          onRefresh={fetchCandidatures}
        />

        {selectedCandidature && (
          <CandidatureDetails
            open={isDetailsOpen}
            onOpenChange={handleCloseDetails}
            candidature={selectedCandidature}
            onUpdate={handleUpdateSuccess}
          />
        )}
      </div>
    </PageTransition>
  );
}