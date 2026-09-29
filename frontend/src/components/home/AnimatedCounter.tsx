'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  prefix?: string;      // ✅ Ajout d’un préfixe (ex: "+", "$")
  suffix?: string;      // ✅ Ajout d’un suffixe (ex: "+", "€")
  duration?: number;    // ms
  separator?: boolean;  // ajouter séparateurs de milliers
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 800,
  separator = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Ne pas lancer si l’élément n’est pas visible ou si target n’est pas un nombre valide
    if (!isInView || typeof target !== 'number' || isNaN(target)) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;
    const targetValue = Math.max(0, target); // ✅ Valeur absolue pour l’animation (ou garder négatif si voulu)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Courbe d'accélération (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * targetValue);

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    // Démarrer l’animation
    animationRef.current = requestAnimationFrame(animate);

    // Nettoyer l’animation au démontage ou si les dépendances changent
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isInView, target, duration]);

  // Fonction de formatage
  const formatNumber = (value: number) => {
    if (separator) {
      return value.toLocaleString('fr-FR');
    }
    return value.toString();
  };

  return (
    <span ref={ref}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}