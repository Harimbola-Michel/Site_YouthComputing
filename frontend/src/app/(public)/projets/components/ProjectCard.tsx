'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { buildImageUrl } from '@/lib/imageUtils';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const statusStyles: Record<string, string> = {
  PLANNING: 'bg-blue-500/10 text-blue-500',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500',
  COMPLETED: 'bg-green-500/10 text-green-500',
  ON_HOLD: 'bg-orange-500/10 text-orange-500',
  EVALUATING: 'bg-purple-500/10 text-purple-500',
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  // 🔹 Sécurisation des données
  const {
    title = 'Sans titre',
    slug = '#',
    description = 'Aucune description',
    images = [],
    year = 'Année inconnue',
    category = '',
    status = '',
    isFeatured = false,
    technologies = [],
  } = project || {};

  const imageUrl = images?.[0] || null;
  const displayTechs = technologies.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildImageUrl(imageUrl, false)}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-primary/20">
              {title.charAt(0).toUpperCase()}
            </div>
          )}
          {status && (
            <Badge className={`absolute right-3 top-3 ${statusStyles[status] || ''}`}>
              {status.replace('_', ' ')}
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="default" className="absolute left-3 top-3 bg-secondary text-white">
              ⭐ Vedette
            </Badge>
          )}
        </div>

        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Calendar className="h-4 w-4" />
            <span>{year}</span>
            {category && (
              <>
                <span>•</span>
                <span>{category}</span>
              </>
            )}
          </div>
          <CardTitle className="font-ubuntu text-xl leading-tight">
            <Link href={`/projets/${slug}`} className="hover:text-secondary transition-colors line-clamp-2">
              {title}
            </Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          {displayTechs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {displayTechs.map((tech: string) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {technologies.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{technologies.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button asChild variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
            <Link href={`/projets/${slug}`}>
              Voir le projet
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}