'use client';

import { motion } from 'framer-motion';
import { Globe, Users, Heart, Lightbulb, Shield, Award, Zap, Star } from 'lucide-react';

const iconMap = {
  Globe: Globe,
  Users: Users,
  Heart: Heart,
  Lightbulb: Lightbulb,
  Shield: Shield,
  Award: Award,
  Zap: Zap,
  Star: Star,
};

const defaultValues = [
  { icon: 'Globe', title: 'Inclusion', description: 'Rendre la culture numérique accessible à tous, sans distinction.', color: 'from-blue-500/20 to-blue-500/5' },
  { icon: 'Lightbulb', title: 'Innovation', description: 'Encourager la créativité et les solutions innovantes.', color: 'from-yellow-500/20 to-yellow-500/5' },
  { icon: 'Heart', title: 'Solidarité', description: 'Travailler ensemble pour un avenir numérique meilleur.', color: 'from-red-500/20 to-red-500/5' },
  { icon: 'Shield', title: 'Intégrité', description: 'Agir avec transparence et éthique.', color: 'from-green-500/20 to-green-500/5' },
  { icon: 'Users', title: 'Communauté', description: 'Construire une communauté forte et engagée.', color: 'from-purple-500/20 to-purple-500/5' },
  { icon: 'Award', title: 'Excellence', description: 'Viser l\'excellence dans toutes nos actions.', color: 'from-pink-500/20 to-pink-500/5' },
];

export function ValuesSection() {
  const values = defaultValues;

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-ubuntu text-2xl font-bold text-primary dark:text-white">
          Nos Valeurs
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
        <p className="mt-4 text-muted-foreground">
          Les principes qui guident nos actions au quotidien
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value, index) => {
          const Icon = iconMap[value.icon as keyof typeof iconMap] || Star;
          return (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div className={`rounded-xl bg-gradient-to-br ${value.color} p-6 text-center transition-all duration-300 hover:shadow-lg`}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-ubuntu text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}