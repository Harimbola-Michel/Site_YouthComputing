'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Users, Clock, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { y2c } from '@/lib/api';
import type { Y2CEvent } from '@/types/y2c.types';
import { AxiosError } from 'axios';
import { buildImageUrl } from '@/lib/imageUtils';

type Event = Y2CEvent;

const eventTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TRAINING: { label: 'Formation', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: <Sparkles className="h-3 w-3" /> },
  CONFERENCE: { label: 'Conférence', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: <Sparkles className="h-3 w-3" /> },
  WORKSHOP: { label: 'Atelier', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: <Sparkles className="h-3 w-3" /> },
  MEETUP: { label: 'Meetup', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', icon: <Sparkles className="h-3 w-3" /> },
  TEAM_SETUP: { label: 'Team Set Up', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: <Sparkles className="h-3 w-3" /> },
  THREE_S: { label: '3S', color: 'bg-rose-500/10 text-rose-600 border-rose-500/30', icon: <Sparkles className="h-3 w-3" /> },
  TEAM_REALIZE: { label: 'Team Realize', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30', icon: <Sparkles className="h-3 w-3" /> },
  COFFREDAY: { label: 'Coffreday', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: <Sparkles className="h-3 w-3" /> },
  HACKATHON: { label: 'Hackathon', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: <Sparkles className="h-3 w-3" /> },
  OTHER: { label: 'Autre', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: <Sparkles className="h-3 w-3" /> },
};

export function UpcomingEvents() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const { data: events, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      try {
        const res = await y2c.getEvents({ isPublished: true });
        const data = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          console.warn('⚠️ Endpoint /y2c/events introuvable – retour de tableau vide');
          return [];
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const updateButtons = () => {
      setCanScrollLeft(container.scrollLeft > 10);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };
    container.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
    return () => {
      container.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [events]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollTo({
      left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    });
  };

  // ─── États de chargement et d'erreur ──────────────────────
  if (isLoading) {
    return (
      <section className="py-16 bg-background" aria-labelledby="events-title">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 id="events-title" className="font-ubuntu text-2xl font-bold md:text-3xl">
                Événements <span className="text-secondary">à venir</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Chargement...</p>
            </div>
          </div>
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-[280px] shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    console.error('❌ Erreur chargement événements:', error);
    return (
      <section className="py-16 bg-background" aria-labelledby="events-title">
        <div className="container mx-auto px-4 text-center">
          <h2 id="events-title" className="font-ubuntu text-2xl font-bold">
            Événements <span className="text-secondary">à venir</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les événements pour le moment.
          </p>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </section>
    );
  }

  const displayEvents = events ?? [];
  if (displayEvents.length === 0) {
    return (
      <section className="py-16 bg-background" aria-labelledby="events-title">
        <div className="container mx-auto px-4 text-center">
          <h2 id="events-title" className="font-ubuntu text-2xl font-bold">
            Événements <span className="text-secondary">à venir</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Aucun événement prévu pour le moment.</p>
        </div>
      </section>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────
  return (
    <section
      className="py-16 bg-gradient-to-b from-background to-muted/10"
      aria-labelledby="events-title"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h2 id="events-title" className="font-ubuntu text-2xl font-bold md:text-3xl">
              Événements <span className="text-secondary">à venir</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Participez à nos prochains événements
            </p>
          </div>
          <Link
            href="/communaute-y2c"
            className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Carrousel */}
        <div className="relative">
          {/* Conteneur défilant */}
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayEvents.map((event, index) => {
              const typeConfig = eventTypeConfig[event.eventType] || eventTypeConfig.OTHER;
              const hasImage = event.imageUrl && event.imageUrl.trim() !== '';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="snap-start shrink-0 w-[280px] md:w-[300px]"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/40 hover:border-secondary/20 bg-background/50 backdrop-blur-sm group">
                    {/* Image + badge */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
                      {hasImage ? (
                        <Image
                          src={buildImageUrl(event.imageUrl, false)}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/20">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge
                        className={cn(
                          'absolute left-2 top-2 text-[10px] border font-medium shadow-sm',
                          typeConfig.color
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {typeConfig.icon}
                          {typeConfig.label}
                        </span>
                      </Badge>
                    </div>

                    <CardContent className="p-3.5 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-ubuntu text-sm font-semibold leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                          {event.title}
                        </h3>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDate(event.startDate)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-secondary/60" />
                          <span>{formatDate(event.startDate)}</span>
                          <span className="text-[10px]">•</span>
                          <Clock className="h-3 w-3 text-secondary/60" />
                          <span>{formatTime(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-secondary/60" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.maxParticipants && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-secondary/60" />
                            <span>Max {event.maxParticipants} pers.</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-border/20">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full text-xs h-8 bg-secondary hover:bg-secondary/90 text-white transition-colors shadow-sm hover:shadow"
                          asChild
                        >
                          <Link href={`/communaute-y2c#event-${event.id}`}>
                            S'inscrire
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Flèche gauche */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-border/40 transition-all hover:scale-110 hover:shadow-xl focus:outline-none"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}

          {/* Flèche droite */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-border/40 transition-all hover:scale-110 hover:shadow-xl focus:outline-none"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Indicateurs de progression */}
        <div className="mt-6 flex justify-center gap-1.5">
          {displayEvents.map((_, i) => {
            // Calculer si l'élément est visible en fonction du scroll (approximatif)
            const container = scrollContainerRef.current;
            let isActive = false;
            if (container) {
              const cardWidth = container.clientWidth * 0.8;
              const scrollPos = container.scrollLeft;
              const cardIndex = Math.round(scrollPos / (cardWidth + 20));
              isActive = i === cardIndex;
            }
            return (
              <button
                key={i}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (!container) return;
                  const cardWidth = container.clientWidth * 0.8;
                  const scrollAmount = i * (cardWidth + 20);
                  container.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth',
                  });
                }}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  isActive
                    ? 'w-6 bg-secondary'
                    : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Aller à l'événement ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}