'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { RecruitmentsTable } from './components/RecruitmentsTable';
import type { Recruitment } from './components/RecruitmentsTable';
import { RecruitmentFormModal } from './components/RecruitmentFormModal';
import { recruitments } from '@/lib/api';
import { extractDataArray } from '@/lib/api-helpers';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminRecruitmentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState<Recruitment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecruitments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      // Récupérer la liste des recrutements
      const response = await recruitments.getAll();
      let list = extractDataArray<Recruitment>(response?.data, []);

      // ✅ Enrichir chaque recrutement avec le nombre de candidatures
      const enrichedList = await Promise.all(
        list.map(async (item) => {
          try {
            // Appel à l'API pour obtenir les statistiques de candidatures
            const statsResponse = await recruitments.getCandidatureStats(item.id);
            const count = statsResponse?.data?.data?.total ?? statsResponse?.data?.total ?? 0;
            return { ...item, candidatureCount: count };
          } catch {
            // En cas d'erreur, on met 0
            return { ...item, candidatureCount: 0 };
          }
        })
      );

      setData(enrichedList);
    } catch (err: any) {
      console.error('Erreur chargement recrutements:', err);
      const message = err?.response?.data?.message || 'Impossible de charger les offres';
      setError(message);
      toast.error(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchRecruitments();
  }, [authLoading, fetchRecruitments]);

  const handleAdd = () => {
    setEditingRecruitment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Recruitment) => {
    setEditingRecruitment(item);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingRecruitment(null);
    fetchRecruitments();
    toast.success('Offre sauvegardée ✅');
  };

  const handleDelete = async (id: string) => {
    try {
      await recruitments.delete(id);
      toast.success('Offre supprimée');
      fetchRecruitments();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchRecruitments();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Liste actualisée');
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
              Recrutements
            </h1>
            <p className="text-muted-foreground">
              Gérez les offres d’emploi et les candidatures.
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle offre
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRecruitments} className="ml-auto">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <RecruitmentsTable
          data={data}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onRefresh={fetchRecruitments}
        />

        <AnimatePresence>
          {isModalOpen && (
            <RecruitmentFormModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              recruitment={editingRecruitment}
              onSuccess={handleSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}