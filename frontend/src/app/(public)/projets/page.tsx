'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectFilters } from './components/ProjectFilters';
import { FeaturedProjects } from './components/FeaturedProjects';
import { Pagination } from '@/components/ui/pagination';
import { projects } from '@/lib/api';
// ✅ Import direct depuis project.types (évite l’index global cassé)
import { Project, ProjectStatus } from '@/types/project.types';
import toast from 'react-hot-toast';

const LIMIT = 9;

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: LIMIT,
        // ✅ Filtre sur le statut PUBLISHED
        status: ProjectStatus.PUBLISHED,
        ...filters,
      };
      const response = await projects.getAll(params);
      const data = response?.data?.data ?? response?.data ?? [];
      const pagination = response?.data?.pagination ?? { totalPages: 1 };
      setProjectsData(Array.isArray(data) ? data : []);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error('Erreur chargement projets:', err);
      setError('Impossible de charger les projets. Veuillez réessayer.');
      toast.error('Erreur de chargement');
      setProjectsData([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Mise à jour de l’URL quand la page change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    router.replace(`/projets?${params.toString()}`, { scroll: false });
  }, [currentPage, router, searchParams]);

  const featuredProjects = useMemo(
    () => projectsData.filter((p) => p.isFeatured),
    [projectsData]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const renderContent = () => {
    if (isLoading) return <ProjectGrid loading count={6} />;
    if (error) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-destructive/20 p-12 text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      );
    }
    if (projectsData.length === 0) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">Aucun projet publié</p>
          <p className="text-sm text-muted-foreground/60">Revenez bientôt pour découvrir nos réalisations.</p>
        </div>
      );
    }
    return <ProjectGrid projects={projectsData} />;
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Nos <span className="text-secondary">Projets</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Découvrez les projets réalisés par Youth Computing, porteurs d&apos;innovation et d&apos;impact.
          </p>
        </motion.div>

        {!isLoading && !Object.keys(filters).length && currentPage === 1 && featuredProjects.length > 0 && (
          <FeaturedProjects projects={featuredProjects} />
        )}

        <div className="mt-12">
          <ProjectFilters onFilterChange={handleFilterChange} isLoading={isLoading} />
          <div className="mt-6">{renderContent()}</div>
        </div>

        {!isLoading && !error && projectsData.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
}