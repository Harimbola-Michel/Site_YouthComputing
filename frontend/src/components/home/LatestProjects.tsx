'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, ImageIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { projects as projectsApi } from '@/lib/api';
import { buildImageUrl } from '@/lib/imageUtils';
import type { Project } from '@/types';

export function LatestProjects() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['homeProjects', 3],
    queryFn: async () => {
      const res = await projectsApi.getAll({ limit: 3, page: 1, sort: 'desc' });
      const payload = res.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      return list as Project[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const projects = data ?? [];

  if (isLoading) {
    return (
      <section className="py-20 bg-background" aria-labelledby="projects-title">
        <div className="container-custom">
          <Skeleton className="mb-8 h-10 w-72" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 bg-background text-center" aria-labelledby="projects-title">
        <h2 id="projects-title" className="font-ubuntu text-3xl font-bold">
          Projets <span className="text-secondary">récents</span>
        </h2>
        <p className="mt-4 text-muted-foreground">Impossible de charger les projets.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Réessayer
        </Button>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-20 bg-background text-center" aria-labelledby="projects-title">
        <h2 id="projects-title" className="font-ubuntu text-3xl font-bold">
          Projets <span className="text-secondary">récents</span>
        </h2>
        <p className="mt-4 text-muted-foreground">Aucun projet publié pour le moment.</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background" aria-labelledby="projects-title">
      <div className="container-custom">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="projects-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
              Projets <span className="text-secondary">récents</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Découvrez nos dernières réalisations</p>
          </div>
          <Link href="/projets" className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project, index) => {
            const imagePath = project.images?.[0];
            const imageUrl = imagePath ? buildImageUrl(imagePath, true) : null;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted/30">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={project.title} fill className="object-cover" unoptimized sizes="33vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <Badge variant="secondary">{project.category}</Badge>
                      <span>•</span>
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                    <CardTitle className="font-ubuntu text-lg line-clamp-2">
                      <Link href={`/projets/${project.slug}`} className="hover:text-secondary">
                        {project.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/projets/${project.slug}`} className="text-sm font-medium text-secondary hover:underline flex items-center gap-1">
                      Voir le projet
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
