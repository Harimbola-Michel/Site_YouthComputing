// app/(public)/projets/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '@/components/shared/PageTransition';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectSkeleton } from '../components/ProjectSkeleton';
import { projects } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug manquant');
      const response = await projects.getBySlug(slug);
      const data = response?.data?.data ?? response?.data ?? null;
      if (!data) throw new Error('Projet non trouvé');
      return data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <ProjectSkeleton />
        </div>
      </PageTransition>
    );
  }

  if (error || !project) {
    toast.error('Erreur de chargement du projet');
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Oups !</h1>
          <p className="text-muted-foreground">Impossible de charger les détails du projet.</p>
          <Button asChild className="mt-4">
            <Link href="/projets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <ProjectDetail project={project} />
      </div>
    </PageTransition>
  );
}