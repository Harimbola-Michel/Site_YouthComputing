'use client';

import { ReactNode, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  once?: boolean;
  threshold?: number;
  spring?: boolean;
}

const directionVariants = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  once = true,
  threshold = 0.1,
  spring = false,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const variants: Variants = {
    hidden: directionVariants[direction].hidden,
    visible: {
      ...directionVariants[direction].visible,
      transition: spring
        ? {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            delay,
          }
        : {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
            delay,
          },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}