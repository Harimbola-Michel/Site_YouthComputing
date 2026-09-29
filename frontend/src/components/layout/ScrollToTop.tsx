'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export function ScrollToTop({ threshold = 400, className }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // ─── Gestion du scroll avec throttling ──────────────────────
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsVisible(scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    // Utilisation d'un throttle simple pour éviter trop d'appels
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            // Responsive : plus proche du bord sur mobile
            'sm:bottom-8 sm:right-8',
            className
          )}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              size="icon"
              className={cn(
                'h-12 w-12 rounded-full shadow-lg',
                'bg-secondary text-white hover:bg-secondary/90',
                'dark:bg-secondary dark:hover:bg-secondary/80',
                'transition-all duration-300'
              )}
              onClick={scrollToTop}
              aria-label="Retour en haut de la page"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}