// src/app/(admin)/admin/dashboard/components/StatCard.tsx
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export type StatColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BreakdownItem {
  label: string;
  value: number | string;
  color?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
  color?: StatColor;
  delay?: number;
  format?: 'number' | 'currency' | 'compact' | 'percent';
  currency?: string;
  suffix?: string;
  prefix?: string;
  sparkline?: number[];
  progress?: number;
  isNew?: boolean;
  breakdown?: BreakdownItem[];
  onClick?: () => void;
}

// ============================================================
// PALETTE PREMIUM
// ============================================================
interface ColorScheme {
  iconBg: string;
  iconRing: string;
  glow: string;
  spark: string;
  sparkGradient: [string, string];
  progress: string;
  progressGlow: string;
  accent: string;
  badge: string;
  cornerAccent: string;
}

const COLOR_SCHEMES: Record<StatColor, ColorScheme> = {
  primary: {
    iconBg: 'bg-primary/10 text-primary dark:bg-primary/15',
    iconRing: 'ring-primary/20',
    glow: 'from-primary/15 via-primary/5 to-transparent',
    spark: '#010B40',
    sparkGradient: ['#010B40', '#1a2b5c'],
    progress: 'bg-gradient-to-r from-primary to-primary/70',
    progressGlow: 'shadow-[0_0_10px_rgba(1,11,64,0.4)]',
    accent: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
    cornerAccent: 'bg-primary/40',
  },
  secondary: {
    iconBg: 'bg-secondary/10 text-secondary dark:bg-secondary/15',
    iconRing: 'ring-secondary/20',
    glow: 'from-secondary/15 via-secondary/5 to-transparent',
    spark: '#F13544',
    sparkGradient: ['#F13544', '#f55a67'],
    progress: 'bg-gradient-to-r from-secondary to-secondary/70',
    progressGlow: 'shadow-[0_0_10px_rgba(241,53,68,0.4)]',
    accent: 'text-secondary',
    badge: 'bg-secondary/10 text-secondary border-secondary/20',
    cornerAccent: 'bg-secondary/40',
  },
  success: {
    iconBg:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    iconRing: 'ring-emerald-500/20',
    glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    spark: '#10b981',
    sparkGradient: ['#10b981', '#34d399'],
    progress: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    progressGlow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    accent: 'text-emerald-600 dark:text-emerald-400',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    cornerAccent: 'bg-emerald-500/40',
  },
  warning: {
    iconBg:
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    iconRing: 'ring-amber-500/20',
    glow: 'from-amber-500/15 via-amber-500/5 to-transparent',
    spark: '#f59e0b',
    sparkGradient: ['#f59e0b', '#fbbf24'],
    progress: 'bg-gradient-to-r from-amber-500 to-amber-400',
    progressGlow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    accent: 'text-amber-600 dark:text-amber-400',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    cornerAccent: 'bg-amber-500/40',
  },
  danger: {
    iconBg: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    iconRing: 'ring-red-500/20',
    glow: 'from-red-500/15 via-red-500/5 to-transparent',
    spark: '#ef4444',
    sparkGradient: ['#ef4444', '#f87171'],
    progress: 'bg-gradient-to-r from-red-500 to-red-400',
    progressGlow: 'shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    accent: 'text-red-600 dark:text-red-400',
    badge:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    cornerAccent: 'bg-red-500/40',
  },
  info: {
    iconBg:
      'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    iconRing: 'ring-cyan-500/20',
    glow: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    spark: '#06b6d4',
    sparkGradient: ['#06b6d4', '#22d3ee'],
    progress: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    progressGlow: 'shadow-[0_0_10px_rgba(6,182,212,0.4)]',
    accent: 'text-cyan-600 dark:text-cyan-400',
    badge:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    cornerAccent: 'bg-cyan-500/40',
  },
};

// ============================================================
// SPARKLINE
// ============================================================
interface SparklineProps {
  data: number[];
  color: string;
  gradient: [string, string];
  gradientId: string;
  isInView: boolean;
  delay?: number;
}

function Sparkline({
  data,
  color,
  gradient,
  gradientId,
  isInView,
  delay = 0,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const width = 120;
  const height = 36;
  const padding = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - padding - ((v - min) / range) * (height - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.35} />
          <stop offset="100%" stopColor={gradient[1]} stopOpacity={0} />
        </linearGradient>
      </defs>

      <motion.path
        d={areaD}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      />

      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 1 }}
        transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
      />

      <motion.circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={3.5}
        fill={color}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: delay + 1.1 }}
        style={{ transformOrigin: `${lastPoint.x}px ${lastPoint.y}px` }}
      />
    </svg>
  );
}

// ============================================================
// HOOK — Compteur animé
// ============================================================
function useAnimatedCount(
  target: number | string,
  enabled: boolean
): number | string | null {
  const [display, setDisplay] = useState<number | string | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof target !== 'number') {
      setDisplay(target);
      return;
    }

    if (!enabled || prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    const duration = 900;
    const from = 0;
    const to = target;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(from + (to - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled, prefersReducedMotion]);

  return display;
}

// ============================================================
// COMPOSANT PRINCIPAL — ✅ TOUJOURS VISIBLE
// ============================================================
export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendLabel = 'vs mois dernier',
  loading = false,
  className,
  color = 'primary',
  delay = 0,
  format = 'number',
  currency = '',
  suffix = '',
  prefix = '',
  sparkline,
  progress,
  isNew = false,
  breakdown,
  onClick,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // ✅ FIX 1 : option permissive (amount au lieu de margin)
  const isInView = useInView(ref, { once: true, amount: 0.01 });

  // ✅ FIX 2 : force la visibilité après 300ms (fallback garanti)
  const [forceVisible, setForceVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // ✅ FIX 3 : la visibilité = isInView OU forceVisible
  const shouldAnimate = isInView || forceVisible;

  const gradientId = useId().replace(/:/g, '-');
  const scheme = COLOR_SCHEMES[color];

  const isNumeric = typeof value === 'number';
  const animatedCount = useAnimatedCount(value, shouldAnimate && !loading);
  const isInteractive = !!onClick;

  // ─── Formatage mémoïsé ───
  const formatValue = useMemo(
    () =>
      (val: number | string): string => {
        if (typeof val === 'string') return val;

        let formatted = '';
        switch (format) {
          case 'currency': {
            const currencyCode = currency || 'EUR';
            try {
              formatted = val.toLocaleString('fr-FR', {
                style: 'currency',
                currency: currencyCode,
                maximumFractionDigits: 0,
              });
            } catch {
              formatted = val.toLocaleString('fr-FR') + ' ' + currencyCode;
            }
            break;
          }
          case 'compact':
            if (val >= 1_000_000) formatted = (val / 1_000_000).toFixed(1) + 'M';
            else if (val >= 1_000) formatted = (val / 1_000).toFixed(1) + 'k';
            else formatted = val.toLocaleString('fr-FR');
            break;
          case 'percent':
            formatted = val.toFixed(1) + '%';
            break;
          default:
            formatted = val.toLocaleString('fr-FR');
        }

        if (prefix) formatted = prefix + formatted;
        if (suffix) formatted += suffix;
        return formatted;
      },
    [format, currency, prefix, suffix]
  );

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend !== undefined && trend === 0;

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-9 w-full rounded-lg" />
      </div>
    );
  }

  // ─── Valeur affichée ───
  const displayValue =
    animatedCount !== null && isNumeric
      ? formatValue(animatedCount)
      : formatValue(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={isInteractive ? `${title} : ${displayValue}` : undefined}
      // ✅ FIX 4 : animation initial → animate avec fallback toujours visible
      initial={{ opacity: 0, y: 20 }}
      animate={
        shouldAnimate
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: 0 } // ← Toujours visible même si non animé
      }
      transition={{ duration: 0.4, delay: delay * 0.06, ease: 'easeOut' }}
      whileHover={isInteractive ? { y: -2 } : undefined}
      whileTap={isInteractive ? { scale: 0.99 } : undefined}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card',
        'text-left shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-lg',
        isInteractive && 'cursor-pointer',
        isInteractive &&
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      {/* ═══ Décor 1 — Glow au survol ═══ */}
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100',
          scheme.glow
        )}
        aria-hidden="true"
      />

      {/* ═══ Décor 2 — Grille subtile ═══ */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* ═══ Décor 3 — Accent d'angle ═══ */}
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 h-16 w-16 rotate-45 rounded-sm opacity-0 transition-all duration-500 group-hover:opacity-100',
          scheme.cornerAccent
        )}
        aria-hidden="true"
      />

      {/* ═══ Badge "Nouveau" ═══ */}
      {isNew && (
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 15,
            delay: delay * 0.06 + 0.3,
          }}
          className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-secondary to-secondary/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg"
        >
          <Sparkles className="h-2.5 w-2.5" />
          Nouveau
        </motion.div>
      )}

      {/* ═══ Contenu ═══ */}
      <div className="relative p-5">
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {title}
            </p>
            <p
              className="mt-1.5 text-[1.6rem] font-bold leading-none tracking-tight text-foreground tabular-nums"
              aria-label={`${title} : ${displayValue}`}
            >
              {displayValue}
            </p>
          </div>

          {/* ─── Icône ─── */}
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-500',
              'group-hover:scale-110 group-hover:rotate-3',
              scheme.iconBg,
              scheme.iconRing
            )}
          >
            {icon}
          </div>
        </div>

        {/* ─── Trend + Description ─── */}
        {(trend !== undefined || description) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums transition-all',
                  trendPositive &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
                  trendNegative &&
                    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400',
                  trendNeutral &&
                    'border-border bg-muted text-muted-foreground'
                )}
              >
                {trendPositive && <ArrowUp className="h-3 w-3" />}
                {trendNegative && <ArrowDown className="h-3 w-3" />}
                {trendNeutral && <Minus className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
            <span className="truncate text-muted-foreground">
              {description || trendLabel}
            </span>
          </div>
        )}

        {/* ─── Sparkline ─── */}
        {sparkline && sparkline.length > 1 && (
          <div className="mt-3 -mx-1">
            <Sparkline
              data={sparkline}
              color={scheme.spark}
              gradient={scheme.sparkGradient}
              gradientId={`spark-${gradientId}`}
              isInView={shouldAnimate}
              delay={delay * 0.06}
            />
          </div>
        )}

        {/* ─── Progress bar ─── */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium">
              <span className="uppercase tracking-wide text-muted-foreground">
                Progression
              </span>
              <span className={cn('tabular-nums font-bold', scheme.accent)}>
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70"
              role="progressbar"
              aria-valuenow={Math.min(Math.round(progress), 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  // ✅ FIX : toujours animé
                  width: `${Math.min(progress, 100)}%`,
                }}
                transition={{
                  duration: 1,
                  delay: delay * 0.06 + 0.3,
                  ease: 'easeOut',
                }}
                className={cn(
                  'relative h-full overflow-hidden rounded-full',
                  scheme.progress,
                  scheme.progressGlow
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  aria-hidden="true"
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* ─── Breakdown ─── */}
        {breakdown && breakdown.length > 0 && (
          <div
            className={cn(
              'mt-4 grid gap-3 border-t border-border/40 pt-3',
              breakdown.length === 1 && 'grid-cols-1',
              breakdown.length === 2 && 'grid-cols-2',
              breakdown.length === 3 && 'grid-cols-3',
              breakdown.length >= 4 && 'grid-cols-2 sm:grid-cols-4'
            )}
          >
            {breakdown.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={cn(
                    'truncate text-sm font-bold tabular-nums',
                    item.color || 'text-foreground'
                  )}
                >
                  {typeof item.value === 'number'
                    ? item.value.toLocaleString('fr-FR')
                    : item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Barre inférieure décorative ═══ */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full',
          scheme.progress
        )}
        aria-hidden="true"
      />
    </motion.div>
  );
}