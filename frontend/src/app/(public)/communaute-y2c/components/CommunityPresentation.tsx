// src/app/(public)/communaute-y2c/components/CommunityPresentation.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Users, Calendar, Award, ArrowRight, Briefcase, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useY2CStats } from '@/hooks/useY2CStats';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { cn } from '@/lib/utils';

const STATS_CONFIG = [
  { key: 'members', icon: Users, label: 'Membres actifs', suffix: '' },
  { key: 'events', icon: Calendar, label: 'Événements organisés', suffix: '+' },
  { key: 'certifications', icon: Award, label: 'Certifications délivrées', suffix: '+' },
  { key: 'projects', icon: Briefcase, label: 'Projets réalisés', suffix: '+' },
] as const;

interface CommunityPresentationProps {
  imageSrc?: string | null;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function CommunityPresentation({
  imageSrc,
  imageAlt = 'Communauté Youth Computing',
  title = 'Une communauté pour les passionnés des NTIC',
  subtitle = 'Communauté',
  description = 'La communauté Y2C est un espace d\'échange et de partage pour les étudiants et passionnés des Nouvelles Technologies de l\'Information et de la Communication à Madagascar. Rejoignez-nous pour apprendre, innover et grandir ensemble.',
  ctaText = 'Rejoindre la communauté',
  ctaLink = '#inscription',
  className,
}: CommunityPresentationProps) {
  const { stats, loading, error } = useY2CStats();
  const [imageError, setImageError] = useState(false);

  // Image par défaut (si erreur ou absente)
  const defaultImage = '/images/community/default.jpg';
  const finalImageSrc = imageSrc && !imageError ? imageSrc : defaultImage;

  return (
    <section className={cn('mb-16 lg:mb-20', className)}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        {/* ─── Image à gauche ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1 relative"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl bg-muted/20">
            <Image
              src={finalImageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized // ✅ Pour les URLs externes
              onError={() => setImageError(true)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
          {/* Badge Y2C */}
          <div className="absolute -bottom-4 -right-4 rounded-full bg-secondary px-6 py-3 text-white shadow-xl">
            <span className="font-bold text-lg">Y2C</span>
          </div>
        </motion.div>

        {/* ─── Contenu ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 space-y-6"
        >
          <div>
            <span className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              {subtitle}
            </span>
            <h2 className="mt-3 font-ubuntu text-3xl font-bold text-primary dark:text-white lg:text-4xl">
              {title}
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed lg:text-lg">{description}</p>

          {/* ─── Statistiques ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {STATS_CONFIG.map((stat, index) => {
              const value = stats[stat.key as keyof typeof stats] || 0;
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-2 font-ubuntu text-xl font-bold text-primary dark:text-white">
                    {loading ? (
                      <Skeleton className="h-6 w-12 mx-auto" />
                    ) : error ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      <AnimatedCounter target={value} suffix={stat.suffix} duration={600} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ─── Points clés ────────────────────────────────────── */}
          <ul className="space-y-2">
            {[
              'Échanger avec d\'autres passionnés',
              'Participer à des événements exclusifs',
              'Accéder à des ressources éducatives',
              'Collaborer sur des projets innovants',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <span className="text-xs font-bold">✓</span>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* ─── Call-to-action ──────────────────────────────────── */}
          <div className="pt-4">
            <Button
              size="lg"
              className="group gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              asChild
            >
              <a href={ctaLink}>
                {ctaText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Adhésion à partir de 25 000 Ar
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}