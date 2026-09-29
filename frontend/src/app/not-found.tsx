// src/app/not-found.tsx (version sans dépendances)
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <div className="relative">
        <h1 className="font-ubuntu text-9xl font-bold text-primary/10 dark:text-primary/20">404</h1>
        <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary dark:text-white">
          Page non trouvée
        </span>
      </div>

      <h2 className="font-ubuntu text-2xl font-semibold text-foreground">
        Oups ! La page que vous cherchez n'existe pas.
      </h2>
      <p className="max-w-md text-muted-foreground">
        Il se peut que le lien soit cassé ou que la page ait été supprimée.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Nous contacter
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <Link href="/a-propos" className="hover:text-primary hover:underline transition-colors">
          À propos
        </Link>
        <span>•</span>
        <Link href="/formations" className="hover:text-primary hover:underline transition-colors">
          Formations
        </Link>
        <span>•</span>
        <Link href="/communaute-y2c" className="hover:text-primary hover:underline transition-colors">
          Communauté Y2C
        </Link>
        <span>•</span>
        <Link href="/blog" className="hover:text-primary hover:underline transition-colors">
          Blog
        </Link>
        <span>•</span>
        <Link href="/contact" className="hover:text-primary hover:underline transition-colors">
          Contact
        </Link>
      </div>
    </motion.div>
  );
}