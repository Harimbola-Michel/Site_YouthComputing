'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { buildImageUrl } from '@/lib/imageUtils';

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const featured = projects[0];
  if (!featured) return null;

  const imageUrl = featured.images?.[0] || null;
  const technologies = featured.technologies ?? [];
  const displayTechnologies = technologies.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-12"
    >
      <Card className="overflow-hidden border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-shadow">
        <div className="grid md:grid-cols-2">
          <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/10 to-secondary/10 relative">
            {imageUrl ? (
              <img src={buildImageUrl(imageUrl, false)} alt={featured.title} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-bold text-primary/20">★</div>
            )}
            <Badge className="absolute right-4 top-4 bg-secondary text-white shadow-lg">Projet vedette</Badge>
          </div>
          <CardContent className="flex flex-col justify-center p-6 md:p-8">
            <h3 className="font-ubuntu text-2xl font-bold">{featured.title}</h3>
            <p className="mt-2 text-muted-foreground line-clamp-3">{featured.description}</p>
            {displayTechnologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {displayTechnologies.map((tech: string) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {technologies.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{technologies.length - 5}
                  </Badge>
                )}
              </div>
            )}
            <Button asChild className="mt-6 gap-2 self-start">
              <Link href={`/projets/${featured.slug}`}>
                Voir le projet
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}