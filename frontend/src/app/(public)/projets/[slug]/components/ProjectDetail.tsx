// app/(public)/projets/[slug]/components/ProjectDetail.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Users, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectGallery } from './ProjectGallery';
import { ProjectMetrics } from './ProjectMetrics';
import { ProjectTeam } from './ProjectTeam';
import { Project } from '@/types';

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const {
    title,
    description,
    objectives,
    impact,
    images = [],
    technologies = [],
    year,
    category,
    status,
    isFeatured,
    metrics,
    team,
    links = [],
    createdAt,
  } = project;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Bouton retour */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/projets">
            <ArrowLeft className="h-4 w-4" />
            Retour aux projets
          </Link>
        </Button>
      </div>

      {/* En-tête */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {category || 'Non catégorisé'}
          </Badge>
          {status && (
            <Badge variant="secondary" className="text-sm">
              {status.replace('_', ' ')}
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="default" className="bg-secondary text-white text-sm">
              ⭐ En vedette
            </Badge>
          )}
        </div>
        <h1 className="font-ubuntu text-3xl font-bold md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{year || new Date(createdAt).getFullYear()}</span>
          </div>
          {technologies.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{technologies.length} technologies</span>
            </div>
          )}
        </div>
      </div>

      {/* Galerie */}
      {images.length > 0 && (
        <section>
          <ProjectGallery images={images} title={title} />
        </section>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-2xl">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {description || 'Aucune description disponible.'}
          </p>
        </CardContent>
      </Card>

      {/* Objectifs & Impact */}
      <div className="grid gap-6 md:grid-cols-2">
        {objectives && (
          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-xl">Objectifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{objectives}</p>
            </CardContent>
          </Card>
        )}
        {impact && (
          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-xl">Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{impact}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Métriques */}
      {metrics && metrics.length > 0 && (
        <section>
          <h2 className="font-ubuntu text-2xl font-semibold mb-4">Métriques clés</h2>
          <ProjectMetrics metrics={metrics} />
        </section>
      )}

      {/* Équipe */}
      {team && team.length > 0 && (
        <section>
          <h2 className="font-ubuntu text-2xl font-semibold mb-4">Équipe du projet</h2>
          <ProjectTeam team={team} />
        </section>
      )}

      {/* Technologies */}
      {technologies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-ubuntu text-xl">Technologies utilisées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech: string) => (
                <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liens */}
      {links && links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-ubuntu text-xl">Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {links.map((link: { label: string; url: string }) => (
                <Button key={link.url} variant="outline" size="sm" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {link.label || 'Lien'}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}