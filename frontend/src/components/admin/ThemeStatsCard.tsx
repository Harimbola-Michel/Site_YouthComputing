'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ThemeStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function ThemeStatsCard({
  title,
  value,
  icon,
  trend,
  description,
  variant = 'primary',
}: ThemeStatsCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const variants = {
    primary: isDark ? 'bg-primary/20 border-primary/30' : 'bg-primary/10 border-primary/20',
    secondary: isDark ? 'bg-secondary/20 border-secondary/30' : 'bg-secondary/10 border-secondary/20',
    success: isDark ? 'bg-green-500/20 border-green-500/30' : 'bg-green-500/10 border-green-500/20',
    warning: isDark ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-500/10 border-yellow-500/20',
    danger: isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-500/10 border-red-500/20',
  };

  const iconVariants = {
    primary: isDark ? 'text-primary-light' : 'text-primary',
    secondary: isDark ? 'text-secondary-light' : 'text-secondary',
    success: isDark ? 'text-green-400' : 'text-green-600',
    warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
    danger: isDark ? 'text-red-400' : 'text-red-600',
  };

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md',
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-bold font-ubuntu mt-1">
            {value}
          </p>
        </div>
        <div className={cn('p-3 rounded-lg', iconVariants[variant])}>
          {icon}
        </div>
      </div>
      {(trend !== undefined || description) && (
        <div className="flex items-center gap-2 mt-3 text-xs">
          {trend !== undefined && (
            <span className={cn(
              'flex items-center gap-1 font-medium',
              isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
            )}>
              {isPositive && <ArrowUp className="h-3 w-3" />}
              {isNegative && <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          {description && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}