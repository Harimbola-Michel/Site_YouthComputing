'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Users, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import { Formation } from '@/types';

interface FormationCardProps {
  formation: Formation;
  className?: string;
  index?: number;
}

export function FormationCard({ formation, className, index = 0 }: FormationCardProps) {
  const {
    id,
    title,
    slug,
    description,
    duration,
    level,
    price,
    category,
    imageUrl,
    isPublished,
    sessions,
  } = formation;

  const nextSession = sessions?.find((s) => new Date(s.startDate) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Card className={cn('group h-full overflow-hidden transition-all duration-300 hover:shadow-xl', className)}>
        {/* Image avec overlay */}
        <div className="relative aspect-video overflow-hidden bg-primary/5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-4xl font-bold text-primary/20">{title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge
            variant={isPublished ? 'success' : 'secondary'}
            className="absolute right-3 top-3"
          >
            {isPublished ? 'Publié' : 'Brouillon'}
          </Badge>
          <Badge variant="outline" className="absolute left-3 top-3 border-white/20 bg-black/40 text-white backdrop-blur-sm">
            {category}
          </Badge>
          <Badge className="absolute bottom-3 left-3 bg-secondary text-white">
            {level}
          </Badge>
        </div>

        <CardHeader className="space-y-1">
          <CardTitle className="line-clamp-2 font-ubuntu text-xl">
            <Link href={`/formations/${slug}`} className="hover:text-secondary transition-colors">
              {title}
            </Link>
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{formation.maxParticipants || 'Illimité'}</span>
            </div>
            {nextSession && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{nextSession.location}</span>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">
              {price && price > 0 ? formatCurrency(price) : 'Gratuit'}
            </span>
            {nextSession && (
              <span className="text-xs text-muted-foreground">
                Prochaine session : {formatDateShort(nextSession.startDate)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <Button asChild className="w-full gap-2 group-hover:bg-secondary/90">
            <Link href={`/formations/${slug}`}>
              Voir la formation
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}