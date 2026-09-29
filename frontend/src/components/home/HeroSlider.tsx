'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 📸 Toutes les images sont des URLs Unsplash (pas de dépendance locale)
const slides = [
  {
    id: 0,
    title: 'La culture numérique pour tous',
    subtitle: 'Youth Computing',
    description: "Promouvoir l'inclusion numérique à Madagascar",
    cta: 'Découvrir',
    link: '/a-propos',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80',
  },
  {
    id: 1,
    title: 'Rejoignez la communauté Y2C',
    subtitle: 'Une communauté de passionnés',
    description: 'Échangez, apprenez et innovez ensemble',
    cta: 'Adhérer',
    link: '/communaute-y2c',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80',
  },
  {
    id: 2,
    title: 'Formations de qualité',
    subtitle: 'Développez vos compétences',
    description: 'Des programmes adaptés à tous les niveaux',
    cta: 'Voir les formations',
    link: '/formations',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  // Préchargement des images avec l'API standard du navigateur
  useEffect(() => {
    const loadImages = async () => {
      const loaded = await Promise.all(
        slides.map((slide) => {
          return new Promise<boolean>((resolve) => {
            // Utiliser `window.Image` pour éviter tout conflit avec Next.js
            const img = new window.Image();
            img.src = slide.image;
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });
        })
      );
      setImagesLoaded(loaded);
    };
    loadImages();
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const [isHovering, setIsHovering] = useState(false);
  const currentSlide = slides[current];
  const isImageLoaded = imagesLoaded[current] !== false;

  return (
    <section
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* Fond image */}
          <div className="absolute inset-0 bg-primary/40">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className={cn(
                'h-full w-full object-cover transition-opacity duration-1000',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading={current === 0 ? 'eager' : 'lazy'}
            />
          </div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />

          {/* Pattern décoratif */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenu */}
      <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-secondary border border-secondary/30">
                  <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  {currentSlide.subtitle}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-ubuntu text-4xl font-bold text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-tight"
              >
                {currentSlide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/80 sm:text-xl max-w-2xl leading-relaxed"
              >
                {currentSlide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="group bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/30 hover:shadow-secondary/50 transition-all duration-300"
                  onClick={() => (window.location.href = currentSlide.link)}
                >
                  {currentSlide.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => (window.location.href = '/formations')}
                >
                  Explorer
                </Button>
              </motion.div>

              {/* Indicateur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 pt-4"
              >
                <span className="text-sm font-medium text-white/60">
                  {String(current + 1).padStart(2, '0')}
                </span>
                <div className="h-px w-12 bg-white/20" />
                <span className="text-sm font-medium text-white/40">
                  {String(slides.length).padStart(2, '0')}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Contrôles */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-500 cursor-pointer',
                index === current
                  ? 'w-10 bg-secondary shadow-lg shadow-secondary/30'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              )}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>
        <span className="w-px h-6 bg-white/20" />
        <button
          onClick={toggleAutoPlay}
          className="text-white/50 hover:text-white transition-colors"
          aria-label={isAutoPlaying ? 'Pause' : 'Lecture'}
        >
          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className={cn(
          'absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all duration-300',
          'hover:bg-white/20 hover:scale-110',
          isHovering ? 'opacity-100' : 'opacity-0 lg:opacity-100'
        )}
        aria-label="Précédent"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className={cn(
          'absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all duration-300',
          'hover:bg-white/20 hover:scale-110',
          isHovering ? 'opacity-100' : 'opacity-0 lg:opacity-100'
        )}
        aria-label="Suivant"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </section>
  );
}