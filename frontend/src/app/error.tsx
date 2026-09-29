'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
    >
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="font-ubuntu text-3xl font-bold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="max-w-md text-muted-foreground">
        {error.message || 'Nous rencontrons un problème technique.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          Réessayer
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          Retour à l'accueil
        </Button>
      </div>
    </motion.div>
  );
}