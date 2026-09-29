// src/app/(admin)/admin/dashboard/components/WidgetsGrid.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  FileText,
  Calendar,
  CreditCard,
  GraduationCap,
  Briefcase,
  Star,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export type WidgetColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type WidgetIconName =
  | 'Users'
  | 'FileText'
  | 'Calendar'
  | 'CreditCard'
  | 'GraduationCap'
  | 'Briefcase'
  | 'Star'
  | 'TrendingUp';

export interface Widget {
  id: string;
  title: string;
  value: number | string;
  icon: WidgetIconName;
  color: WidgetColor;
  trend?: number;
  suffix?: string;
  prefix?: string;
}

interface WidgetsGridProps {
  widgets: Widget[];
}

// ============================================================
// ICON MAP — typé strict
// ============================================================
const ICON_MAP: Record<WidgetIconName, LucideIcon> = {
  Users,
  FileText,
  Calendar,
  CreditCard,
  GraduationCap,
  Briefcase,
  Star,
  TrendingUp,
};

// ============================================================
// PALETTE — couleurs contrôlées
// ============================================================
const COLOR_MAP: Record<
  WidgetColor,
  { bg: string; glow: string; trend: string }
> = {
  primary: {
    bg: 'bg-primary text-primary-foreground',
    glow: 'from-primary/8 via-primary/4 to-transparent',
    trend: 'text-primary',
  },
  secondary: {
    bg: 'bg-secondary text-secondary-foreground',
    glow: 'from-secondary/8 via-secondary/4 to-transparent',
    trend: 'text-secondary',
  },
  success: {
    bg: 'bg-emerald-500 text-white',
    glow: 'from-emerald-500/8 via-emerald-500/4 to-transparent',
    trend: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500 text-white',
    glow: 'from-amber-500/8 via-amber-500/4 to-transparent',
    trend: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    bg: 'bg-red-500 text-white',
    glow: 'from-red-500/8 via-red-500/4 to-transparent',
    trend: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-cyan-500 text-white',
    glow: 'from-cyan-500/8 via-cyan-500/4 to-transparent',
    trend: 'text-cyan-600 dark:text-cyan-400',
  },
};

// ============================================================
// COMPOSANT
// ============================================================
export function WidgetsGrid({ widgets }: WidgetsGridProps) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((widget, index) => {
        const Icon = ICON_MAP[widget.icon] || Users;
        const scheme = COLOR_MAP[widget.color] || COLOR_MAP.primary;

        const trendPositive = widget.trend !== undefined && widget.trend > 0;
        const trendNegative = widget.trend !== undefined && widget.trend < 0;
        const trendNeutral = widget.trend === 0;

        const displayValue =
          typeof widget.value === 'number'
            ? widget.value.toLocaleString('fr-FR')
            : widget.value;

        return (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.06,
              ease: 'easeOut',
            }}
          >
            <Card className="group relative overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              {/* Glow au survol */}
              <div
                className={cn(
                  'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                  scheme.glow
                )}
                aria-hidden="true"
              />

              <CardContent className="relative p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {widget.title}
                    </p>
                    <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">
                      {widget.prefix}
                      {displayValue}
                      {widget.suffix}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                      scheme.bg
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {widget.trend !== undefined && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums',
                        trendPositive &&
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        trendNegative &&
                          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        trendNeutral && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {trendPositive && <ArrowUp className="h-3 w-3" />}
                      {trendNegative && <ArrowDown className="h-3 w-3" />}
                      {trendNeutral && <Minus className="h-3 w-3" />}
                      {Math.abs(widget.trend)}%
                    </span>
                    <span className="truncate text-muted-foreground">
                      vs période préc.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}