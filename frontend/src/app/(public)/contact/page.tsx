'use client';

import { motion } from 'framer-motion';
import { PageTransition } from '../../../components/shared/PageTransition';
import { ContactForm } from './components/ContactForm';
import { ContactInfo } from './components/ContactInfo';
import { ContactMap } from './components/ContactMap';

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="font-ubuntu text-4xl font-bold md:text-5xl">
            Contactez-<span className="text-secondary">nous</span>
          </h1>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block h-1.5 w-16 rounded-full bg-secondary" />
            <span className="inline-block h-1.5 w-8 rounded-full bg-primary/30" />
          </div>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Une question, une suggestion ou une collaboration ? N'hésitez pas à nous écrire.
            Nous vous répondrons dans les plus brefs délais.
          </p>
        </motion.div>

        {/* Grille contact */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          {/* Informations */}
          <div>
            <ContactInfo />
          </div>
        </div>

        {/* Carte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <ContactMap />
        </motion.div>
      </div>
    </PageTransition>
  );
}