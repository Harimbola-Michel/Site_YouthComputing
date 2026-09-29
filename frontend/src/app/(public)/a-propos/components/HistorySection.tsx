'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Calendar,
  Users,
  Award,
  Heart,
  Clock,
  Zap,
  Rocket,
  Globe,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ─── Mapping des icônes ────────────────────────────────────────
const iconMap = {
  Calendar,
  Users,
  Award,
  Heart,
  Clock,
  Zap,
  Rocket,
  Globe,
  Star,
  TrendingUp,
} as const;

type IconName = keyof typeof iconMap;

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: IconName;
  color?: string;
  badge?: string;
}

// ─── Données par défaut (2021 → 2026) ──────────────────────────
const defaultMilestones: Milestone[] = [
  {
    year: '2021',
    title: 'Création de l\'association',
    description: 'Youth Computing est fondée par trois étudiants passionnés de technologies.',
    icon: 'Rocket',
    color: 'from-blue-500/20 to-blue-600/10',
    badge: 'Fondation',
  },
  {
    year: '2022',
    title: 'Première formation',
    description: 'Lancement des premières formations en programmation et NTIC.',
    icon: 'Calendar',
    color: 'from-green-500/20 to-green-600/10',
    badge: 'Éducation',
  },
  {
    year: '2023',
    title: 'Communauté Y2C',
    description: 'Création de la communauté Youth Computing Community, rassemblant plus de 50 membres.',
    icon: 'Users',
    color: 'from-purple-500/20 to-purple-600/10',
    badge: 'Communauté',
  },
  {
    year: '2024',
    title: 'Expansion nationale',
    description: 'Développement des activités à travers Madagascar, avec des partenaires locaux.',
    icon: 'Globe',
    color: 'from-amber-500/20 to-amber-600/10',
    badge: 'Expansion',
  },
  {
    year: '2025',
    title: 'Innovation & Digital',
    description: 'Lancement de projets innovants et de hackathons en collaboration avec des entreprises.',
    icon: 'Zap',
    color: 'from-rose-500/20 to-rose-600/10',
    badge: 'Innovation',
  },
  {
    year: '2026',
    title: 'Impact durable',
    description: 'Consolidation des actions, impact sur plus de 1000 bénéficiaires et nouvelles perspectives.',
    icon: 'Star',
    color: 'from-indigo-500/20 to-indigo-600/10',
    badge: 'Impact',
  },
];

interface HistorySectionProps {
  milestones?: Milestone[];
  title?: string;
  subtitle?: string;
}

export function HistorySection({
  milestones = defaultMilestones,
  title = 'Notre Histoire',
  subtitle = 'Découvrez le parcours de Youth Computing depuis sa création',
}: HistorySectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4">
        {/* ─── En-tête ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-ubuntu text-3xl font-bold md:text-4xl">
            {title} <span className="text-secondary">Youth Computing</span>
          </h2>
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-24 bg-secondary rounded-full" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* ─── Timeline ───────────────────────────────────────── */}
        <div className="relative">
          {/* Ligne verticale (centrée) */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-secondary/30 via-secondary/20 to-secondary/5" />

          <div className="space-y-16">
            {milestones.map((milestone, index) => {
              const Icon = iconMap[milestone.icon] || Calendar;
              const isEven = index % 2 === 0;
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  viewport={{ once: true, margin: '-50px' }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={cn(
                    'flex items-start gap-6 md:gap-8',
                    isEven ? 'flex-row' : 'flex-row-reverse'
                  )}
                >
                  {/* Contenu de la carte */}
                  <div className={cn(
                    'flex-1 md:flex-[0.8]',
                    isEven ? 'text-right md:pr-8' : 'text-left md:pl-8'
                  )}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={cn(
                        'p-5 md:p-6 border-2 transition-all duration-300 hover:shadow-xl',
                        isActive
                          ? 'border-secondary/50 shadow-lg'
                          : 'border-border/50 hover:border-secondary/30',
                        `bg-gradient-to-br ${milestone.color || 'from-primary/5 to-secondary/5'}`
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'rounded-full p-2.5 transition-colors',
                            isActive ? 'bg-secondary text-white' : 'bg-secondary/10 text-secondary'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-ubuntu text-lg font-semibold">
                                {milestone.title}
                              </h3>
                              {milestone.badge && (
                                <Badge variant="secondary" className="text-xs bg-secondary/10">
                                  {milestone.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Point central de la timeline */}
                  <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-secondary/20 transition-all duration-300 hover:scale-110 hover:shadow-xl">
                    <span className="text-xs font-bold">{index + 1}</span>
                    <div className="absolute -inset-1 rounded-full border-2 border-secondary/20 animate-pulse" />
                  </div>

                  {/* Espace vide pour équilibre */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── Pied de page ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm text-muted-foreground border border-border/30">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span>Un parcours en constante évolution</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}