'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Pause, Play, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Testimonial {
  id: string | number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string | null;
}

interface TestimonialCarouselProps {
  testimonials?: Testimonial[];
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  showCounter?: boolean;
  className?: string;
  onSlideChange?: (index: number) => void;
}

function getDefaultTestimonials(): Testimonial[] {
  return [
    {
      id: 1,
      name: 'Marie Claire',
      role: 'Membre Y2C',
      content: "Youth Computing m'a permis de développer mes compétences en programmation et de rencontrer une communauté passionnante.",
      rating: 5,
    },
    {
      id: 2,
      name: 'Jean Rakoto',
      role: 'Bénéficiaire formation',
      content: 'Les formations sont de très haute qualité. Les formateurs sont experts et pédagogues.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Sarah Andri',
      role: 'Membre Y2C',
      content: 'Une association qui fait vraiment la différence pour la jeunesse malgache. Je recommande !',
      rating: 5,
    },
  ];
}

export function TestimonialCarousel({
  testimonials: propTestimonials,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  showCounter = true,
  className,
  onSlideChange,
}: TestimonialCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(propTestimonials || []);
  const [loading, setLoading] = useState(!propTestimonials);
  const [error, setError] = useState<Error | null>(null);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (propTestimonials) return;
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await api.get('/testimonials');
        const data = response?.data?.data || response?.data || [];
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement témoignages:', err);
        setError(err as Error);
        setTestimonials(getDefaultTestimonials());
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [propTestimonials]);

  const total = testimonials.length;
  const safeTotal = total > 0 ? total : 0;

  const goTo = useCallback(
    (index: number) => {
      if (safeTotal === 0) return;
      const clampedIndex = ((index % safeTotal) + safeTotal) % safeTotal;
      if (clampedIndex === current) return;
      setDirection(clampedIndex > current ? 1 : -1);
      setCurrent(clampedIndex);
      onSlideChange?.(clampedIndex);
    },
    [current, safeTotal, onSlideChange]
  );

  const next = useCallback(() => {
    if (safeTotal === 0) return;
    goTo((current + 1) % safeTotal);
  }, [current, goTo, safeTotal]);

  const prev = useCallback(() => {
    if (safeTotal === 0) return;
    goTo((current - 1 + safeTotal) % safeTotal);
  }, [current, goTo, safeTotal]);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused && safeTotal > 1) {
      timerRef.current = setInterval(next, autoPlayInterval);
    }
  }, [isPaused, next, autoPlayInterval, safeTotal]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  if (loading) {
    return (
      <section className={cn('py-20 bg-background', className)}>
        <div className="container-custom text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-secondary" />
          <p className="mt-4 text-muted-foreground">Chargement des témoignages...</p>
        </div>
      </section>
    );
  }

  if (safeTotal === 0) {
    return (
      <section className={cn('py-20 bg-background', className)}>
        <div className="container-custom text-center">
          <p className="text-muted-foreground">Aucun témoignage disponible pour le moment.</p>
        </div>
      </section>
    );
  }

  const currentTestimonial = testimonials[current];

  return (
    <section className={cn('py-20 bg-background', className)} aria-labelledby="testimonials-title">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 id="testimonials-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
            Ce qu'ils disent de <span className="text-secondary">Youth Computing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Découvrez les témoignages de nos membres et bénéficiaires</p>
        </motion.div>

        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onFocus={handlePause}
          onBlur={handleResume}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-5 w-5',
                            i < currentTestimonial.rating
                              ? 'fill-secondary text-secondary'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                    <blockquote className="text-lg italic text-muted-foreground">
                      &quot;{currentTestimonial.content}&quot;
                    </blockquote>
                    <div className="mt-6 flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-secondary/20">
                        <AvatarImage src={currentTestimonial.avatar ? buildImageUrl(currentTestimonial.avatar, false) : undefined} alt={currentTestimonial.name} />
                        <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                          {currentTestimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold">{currentTestimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {showControls && safeTotal > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-background p-2 shadow-md hover:bg-muted transition-colors z-10 border"
                aria-label="Témoignage précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-background p-2 shadow-md hover:bg-muted transition-colors z-10 border"
                aria-label="Témoignage suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {safeTotal > 1 && (
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="absolute -bottom-12 right-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isPaused ? 'Reprendre le défilement' : 'Mettre en pause'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </div>

        {showIndicators && safeTotal > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === current ? 'w-8 bg-secondary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                )}
                aria-label={`Témoignage ${index + 1}`}
              />
            ))}
          </div>
        )}

        {showCounter && safeTotal > 1 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {current + 1} / {safeTotal}
          </p>
        )}
      </div>
    </section>
  );
}