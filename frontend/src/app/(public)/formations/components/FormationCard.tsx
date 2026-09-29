'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Clock,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle,
  XCircle,
  UserPlus,
  Star,
  ImageOff,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import type { Formation } from '@/types';

interface FormationCardProps {
  formation: Formation;
  className?: string;
  index?: number;
  onRegister?: (formationId: string, sessionId: string) => void;
  isFeatured?: boolean;
}

export function FormationCard({
  formation,
  className,
  index = 0,
  onRegister,
  isFeatured = false,
}: FormationCardProps) {
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
    maxParticipants,
    sessions,
  } = formation;

  const nextSession = sessions?.find((s) => new Date(s.startDate) > new Date());
  const hasSessions = sessions && sessions.length > 0;
  const isFull = nextSession?.currentParticipants >= nextSession?.maxParticipants;
  const placesLeft = nextSession
    ? (nextSession.maxParticipants || 0) - (nextSession.currentParticipants || 0)
    : 0;

  const [imageError, setImageError] = useState(false);

  // Construire l'URL avec fallback (placeholder si image manquante)
  const imageSrc = buildImageUrl(imageUrl, true);
  const showPlaceholder = !imageSrc || imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card
        className={cn(
          'group relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl',
          isFeatured && 'border-2 border-secondary/30',
          className
        )}
      >
        {isFeatured && (
          <div className="absolute -right-8 top-6 z-10 rotate-45 bg-secondary px-8 py-1 text-xs font-semibold text-white shadow-md">
            À la une
          </div>
        )}

        {/* Zone image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
          {showPlaceholder ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
              <ImageOff className="h-12 w-12 text-gray-300" />
              <span className="mt-2 text-sm text-gray-400">Image non disponible</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={title || 'Formation'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges supérieurs */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
              {category || 'Formation'}
            </Badge>
            {isFeatured && (
              <Badge variant="default" className="bg-secondary text-white">
                <Star className="h-3 w-3 mr-1" />
                Populaire
              </Badge>
            )}
          </div>

          {/* Badges inférieurs */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge className="bg-secondary text-white">{level || 'Débutant'}</Badge>
            {nextSession && (
              <Badge variant="outline" className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDateShort(nextSession.startDate)}
              </Badge>
            )}
            {hasSessions && (
              <Badge
                variant={isFull ? 'destructive' : 'success'}
                className={cn(
                  isFull ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'
                )}
              >
                {isFull ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                {isFull ? 'Complet' : `${placesLeft} places`}
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="space-y-1">
          <CardTitle className="line-clamp-2 font-ubuntu text-xl">
            <Link href={`/formations/${slug}`} className="hover:text-secondary transition-colors">
              {title || 'Sans titre'}
            </Link>
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description || ''}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration || 'Non défini'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{maxParticipants || 'Illimité'}</span>
            </div>
            {hasSessions && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{sessions.length} session(s)</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">
              {price && price > 0 ? formatCurrency(price) : 'Gratuit'}
            </span>
            {hasSessions && !isFull && nextSession && (
              <span className="text-xs font-medium text-green-600">
                {placesLeft} place{placesLeft > 1 ? 's' : ''} disponible{placesLeft > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex w-full gap-2">
            <Button asChild className="flex-1 gap-2 group-hover:bg-secondary/90">
              <Link href={`/formations/${slug}`}>
                Voir
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {hasSessions && !isFull && nextSession && onRegister && (
              <Button
                variant="default"
                className="gap-2 bg-secondary hover:bg-secondary/90"
                onClick={() => onRegister(id, nextSession.id)}
              >
                <UserPlus className="h-4 w-4" />
                S'inscrire
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}