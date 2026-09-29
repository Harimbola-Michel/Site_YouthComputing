// src/components/shared/AnimatedCounter.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  separator?: boolean;
}

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 800,
  separator = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView || typeof target !== 'number' || isNaN(target)) {
      setDisplayValue(0);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;
    const targetValue = Math.max(0, target);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * targetValue);
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isInView, target, duration]);

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