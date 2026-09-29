'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { HistorySection } from './components/HistorySection';
import { OrganigrammeSection } from './components/OrganigrammeSection';
import { TeamSection } from './components/TeamSection';
import { ValuesSection } from './components/ValuesSection';
import { motion } from 'framer-motion';
import { Users, Heart, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* ─── Hero Section ────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Heart className="h-4 w-4" />
                Qui sommes-nous ?
              </div>
              <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
                À propos <span className="text-secondary">Youth Computing</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Découvrez l’histoire, l’organisation et les valeurs de notre association.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── Contenu ────────────────────────────────────────── */}
        <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-20">
          <HistorySection />
          <OrganigrammeSection />
          <TeamSection />
          <ValuesSection />

          {/* ─── Call to Action ────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8 md:p-12 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
              <Sparkles className="h-4 w-4" />
              Rejoignez-nous
            </div>
            <h3 className="font-ubuntu text-2xl md:text-3xl font-bold">Prêt à faire partie de l’aventure ?</h3>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Rejoignez notre communauté et participez à la transformation numérique de Madagascar.
            </p>
          </motion.section>
        </div>
      </div>
    </PageTransition>
  );
}