// src/components/home/FeatureCards.tsx
'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Users, Building2, BookOpen, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: GraduationCap,
    title: 'Formations de qualité',
    description: 'Des formations adaptées à tous les niveaux dans le domaine des NTIC.',
  },
  {
    icon: Users,
    title: 'Communauté Y2C',
    description: "Rejoignez une communauté de passionnés et d'experts.",
  },
  {
    icon: Building2,
    title: 'Projets innovants',
    description: 'Des projets concrets qui font la différence à Madagascar.',
  },
  {
    icon: BookOpen,
    title: 'Ressources éducatives',
    description: 'Accédez à des tutoriels et ressources pour apprendre.',
  },
  {
    icon: Calendar,
    title: 'Événements',
    description: 'Participez à nos événements et ateliers techniques.',
  },
  {
    icon: Mail,
    title: 'Support continu',
    description: 'Un accompagnement personnalisé pour tous les membres.',
  },
] as const;

export function FeatureCards() {
  return (
    <section className="bg-background py-20" aria-labelledby="features-title">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 id="features-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
            Pourquoi <span className="text-secondary">Youth Computing</span> ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Découvrez ce que notre association peut vous apporter
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-xl focus-within:shadow-xl">
                <CardHeader>
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-ubuntu">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}