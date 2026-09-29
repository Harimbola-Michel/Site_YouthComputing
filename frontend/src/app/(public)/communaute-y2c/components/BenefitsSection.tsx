'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, BookOpen, Calendar, Award, Rocket } from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Réseautage',
    description: 'Connectez-vous avec des professionnels et passionnés des NTIC.',
  },
  {
    icon: BookOpen,
    title: 'Ressources exclusives',
    description: 'Accédez à des formations, tutoriels et ressources éducatives.',
  },
  {
    icon: Calendar,
    title: 'Événements privés',
    description: 'Participez à des événements réservés aux membres Y2C.',
  },
  {
    icon: Award,
    title: 'Certification',
    description: 'Obtenez des certificats pour vos compétences acquises.',
  },
  {
    icon: Rocket,
    title: 'Projets collaboratifs',
    description: 'Collaborez sur des projets innovants avec d\'autres membres.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
          Avantages de l'adhésion
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
        <p className="mt-4 text-muted-foreground">
          Pourquoi rejoindre la communauté Y2C ?
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-lg border bg-card p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <benefit.icon className="h-6 w-6" />
            </div>
            <h3 className="font-ubuntu font-semibold">{benefit.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}