'use client';

import { motion } from 'framer-motion';
import { Users, Coffee, Code, Award, Calendar, Rocket } from 'lucide-react';

const activities = [
  {
    icon: Users,
    title: 'Team Set Up',
    description: 'Rencontres mensuelles pour échanger et partager des idées.',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    icon: Coffee,
    title: 'Coffreday',
    description: 'Ateliers autour d\'un café pour discuter de technologies.',
    color: 'from-amber-500/20 to-amber-500/5',
  },
  {
    icon: Code,
    title: 'Team Realize',
    description: 'Sessions de codage collaboratif sur des projets concrets.',
    color: 'from-green-500/20 to-green-500/5',
  },
  {
    icon: Rocket,
    title: 'Hack a Town',
    description: 'Hackathon annuel pour innover et résoudre des problèmes.',
    color: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: Calendar,
    title: '3S',
    description: 'Formations sur les technologies et méthodologies innovantes.',
    color: 'from-red-500/20 to-red-500/5',
  },
  {
    icon: Award,
    title: 'Événements spéciaux',
    description: 'Conférences, ateliers et rencontres exclusives.',
    color: 'from-pink-500/20 to-pink-500/5',
  },
];

export function ActivitiesGrid() {
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
          Nos Activités
        </h2>
        <div className="mt-2 h-1 w-20 bg-secondary rounded-full" />
        <p className="mt-4 text-muted-foreground">
          Découvrez les activités de la communauté Y2C
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
          >
            <div className={`rounded-xl bg-gradient-to-br ${activity.color} p-6`}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <activity.icon className="h-6 w-6" />
              </div>
              <h3 className="font-ubuntu text-lg font-semibold">{activity.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}