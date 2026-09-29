'use client';

import { ProjectCard } from './ProjectCard';
import { ProjectSkeleton } from './ProjectSkeleton';
import { Project } from '@/types';

interface ProjectGridProps {
  projects?: Project[];
  loading?: boolean;
  count?: number;
}

export function ProjectGrid({ projects = [], loading = false, count = 6 }: ProjectGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 🔹 Vérification que projects est bien un tableau
  const safeProjects = Array.isArray(projects) ? projects : [];

  if (safeProjects.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">Aucun projet trouvé</p>
        <p className="text-sm text-muted-foreground/60">Aucun projet ne correspond à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {safeProjects.map((project, index) => (
        <ProjectCard key={project.id || `project-${index}`} project={project} index={index} />
      ))}
    </div>
  );
}