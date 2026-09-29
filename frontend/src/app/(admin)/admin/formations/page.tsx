'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { FormationTable } from './components/FormationTable';
import { FormationFormModal } from './components/FormationFormModal';
import { EditFormationModal } from './components/EditFormationModal';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminFormationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Récupération des formations ──────────────────────────────
  const fetchFormations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await formations.getAll(filters);
      // Extraction robuste des données
      let formationsData =
        response?.data?.data?.data ??
        response?.data?.data ??
        response?.data ??
        [];
      // Si c'est un objet avec une clé "data", on le prend
      if (formationsData && typeof formationsData === 'object' && !Array.isArray(formationsData)) {
        formationsData = formationsData.data || formationsData.results || Object.values(formationsData).flat() || [];
      }
      setData(Array.isArray(formationsData) ? formationsData : []);
    } catch (err: any) {
      console.error('Erreur chargement formations:', err);
      const msg = err?.response?.data?.message || err?.message || 'Impossible de charger les formations';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated]);

  // ─── Premier chargement ───────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      fetchFormations();
    }
  }, [authLoading, fetchFormations]);

  // ─── Gestionnaires ────────────────────────────────────────────
  const handleFormationCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    fetchFormations(); // Recharge la liste
    toast.success('Formation créée avec succès 🎉');
  }, [fetchFormations]);

  const handleEdit = useCallback((formation: any) => {
    setSelectedFormation(formation);
    setIsEditModalOpen(true);
  }, []);

  const handleFormationUpdated = useCallback(() => {
    setIsEditModalOpen(false);
    fetchFormations();
    toast.success('Formation mise à jour ✅');
  }, [fetchFormations]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await formations.delete(id);
      toast.success('Formation supprimée');
      fetchFormations(); // Recharge après suppression
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(msg);
      throw err; // Pour que le tableau puisse gérer l'erreur
    }
  }, [fetchFormations]);

  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFormations();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  // ─── Rendu ──────────────────────────────────────────────────
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
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Formations
            </h1>
            <p className="text-muted-foreground">
              Gérez les formations de l’association.
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
              Rafraîchir
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvelle formation
            </Button>
          </div>
        </div>

        {/* ─── Erreur ────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ─── Tableau ───────────────────────────────────────── */}
        <FormationTable
          data={data}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        {/* ─── Modales ───────────────────────────────────────── */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <FormationFormModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onSuccess={handleFormationCreated}
            />
          )}
          {isEditModalOpen && selectedFormation && (
            <EditFormationModal
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formation={selectedFormation}
              onSuccess={handleFormationUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}