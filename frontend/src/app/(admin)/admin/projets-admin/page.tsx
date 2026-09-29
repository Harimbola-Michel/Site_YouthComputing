'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProjectsTable } from './components/ProjectsTable';
import { ProjectFormModal } from './components/ProjectFormModal';
import { projects } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminProjectsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement des projets ──────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await projects.getAll();

      // 🔍 Log pour voir la structure exacte (à retirer ensuite)
      console.log('📦 Réponse API projets :', response);
      console.log('📦 response.data :', response.data);

      // ✅ Extraction robuste en plusieurs niveaux
      let projectsData = [];

      // 1er niveau : response.data.data
      if (response?.data?.data) {
        if (Array.isArray(response.data.data)) {
          projectsData = response.data.data;
        } 
        // Si response.data.data est un objet avec une clé "data"
        else if (typeof response.data.data === 'object' && 'data' in response.data.data) {
          projectsData = response.data.data.data || [];
        }
      } 
      // 2ème niveau : response.data
      else if (response?.data) {
        if (Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (typeof response.data === 'object' && 'data' in response.data) {
          projectsData = response.data.data || [];
        }
      } 
      // 3ème niveau : response direct (cas rare)
      else if (Array.isArray(response)) {
        projectsData = response;
      }

      // Si ce n'est toujours pas un tableau, on prend un tableau vide
      if (!Array.isArray(projectsData)) {
        console.warn('⚠️ projectsData n’est pas un tableau, force à []');
        projectsData = [];
      }

      console.log('📦 Nombre de projets extraits :', projectsData.length);
      setData(projectsData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      console.error('❌ Erreur chargement projets:', error);
      toast.error('Impossible de charger les projets');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading, fetchProjects]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleProjectSaved = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    fetchProjects();
    toast.success(editingProject ? 'Projet modifié ✅' : 'Projet créé 🎉');
  };

  const handleDelete = async (project) => {
    try {
      await projects.delete(project.id);
      toast.success('Projet supprimé');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  // ─── États de chargement / auth ──────────────────────────
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Projets
            </h1>
            <p className="text-muted-foreground">
              Gérez les projets de l’association.
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
              onClick={handleAdd}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          </div>
        </div>

        {/* Compteur de projets (pour déboguer) */}
        <p className="text-sm text-muted-foreground">
          {data.length} projet{data.length > 1 ? 's' : ''} trouvé(s)
        </p>

        <ProjectsTable
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />

        <AnimatePresence>
          {isModalOpen && (
            <ProjectFormModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              project={editingProject}
              onSuccess={handleProjectSaved}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}