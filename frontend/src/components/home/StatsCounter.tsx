// src/components/home/StatsCounter.tsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
// ✅ Import relatif (correct)
import { useHomeStats } from '../../hooks/Usehomedata';
import { AnimatedCounter } from './AnimatedCounter';

const STAT_ITEMS_CONFIG = [
  { key: 'y2cMembers', label: 'Membres actifs', icon: Users, suffix: '' },
  { key: 'formations', label: 'Formations réalisées', icon: GraduationCap, suffix: '+' },
  { key: 'registrations', label: 'Bénéficiaires', icon: Globe, suffix: '+' },
  { key: 'projects', label: 'Projets communautaires', icon: Building2, suffix: '' },
] as const;

export function StatsCounter() {
  const { data, isLoading, error } = useHomeStats();

  // ✅ Transformation sécurisée des données (fallback à 0 si undefined)
  const safeStats = useMemo(() => {
    if (!data) {
      return { y2cMembers: 0, formations: 0, registrations: 0, projects: 0 };
    }
    return {
      y2cMembers: data.y2cMembers ?? 0,
      formations: data.formations ?? 0,
      registrations: data.registrations ?? 0,
      projects: data.projects ?? 0,
    };
  }, [data]);

  // ✅ Construction des items avec les valeurs extraites
  const statItems = useMemo(() =>
    STAT_ITEMS_CONFIG.map((config) => ({
      ...config,
      value: safeStats[config.key as keyof typeof safeStats] || 0,
    })),
    [safeStats]
  );

  // ─── État de chargement ──────────────────────────────────
  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-primary/5 py-16 dark:bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                <Skeleton className="mx-auto mt-2 h-8 w-20" />
                <Skeleton className="mx-auto mt-1 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative overflow-hidden bg-primary/5 py-16 dark:bg-primary/10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-primary dark:text-white md:text-4xl lg:text-5xl font-ubuntu tabular-nums">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
