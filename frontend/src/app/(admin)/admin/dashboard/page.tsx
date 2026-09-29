// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { QuickStats } from './components/QuickStats';
// import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';
import { NotificationsPanel } from './components/NotificationsPanel';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  RefreshCw,
  LayoutDashboard,
  Zap,
  BarChart3,
  ListChecks,
  Clock,
  CheckCircle2,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Notification } from '@/hooks/useNotifications';

// ============================================================
// TYPES
// ============================================================
type BadgeColor = 'primary' | 'secondary' | 'amber' | 'emerald';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: BadgeColor;
  iconBg?: string;
  action?: React.ReactNode;
}

// ============================================================
// CONSTANTES
// ============================================================
const BADGE_COLORS: Record<BadgeColor, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  amber: 'text-amber-600 dark:text-amber-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
};

// ============================================================
// SOUS-COMPOSANT — SectionHeader
// ============================================================
function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'primary',
  iconBg = 'bg-primary/10 text-primary',
  action,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          iconBg
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {badge && (
        <span
          className={cn(
            'rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            BADGE_COLORS[badgeColor]
          )}
        >
          {badge}
        </span>
      )}
      {action && <div className="ml-auto">{action}</div>}
    </header>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats();

  // ✅ État local pour éviter le double-clic
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Fetcher REST notifications (fallback socket) ───
  const fetchNotifications = useCallback(async (): Promise<Notification[]> => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
      });
      if (!res.ok) return [];

      const raw = await res.json();

      // ✅ Normalise toujours en tableau
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) return raw.data;
        if (Array.isArray(raw.notifications)) return raw.notifications;
        if (raw.data && Array.isArray(raw.data.notifications))
          return raw.data.notifications;
      }
      return [];
    } catch (err) {
      console.error('[fetchNotifications]', err);
      return [];
    }
  }, []);

  // ─── Greeting stable (calculé une fois) ───
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const userName = user?.firstName || 'Utilisateur';

  // ─── Refetch avec état ───
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      // Petit délai pour le feedback visuel
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [isRefreshing, refetch]);

  // ─── Error normalisée ───
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'Une erreur est survenue';
  }, [error]);

  // ─── Timestamp stable pour la session ───
  const lastUpdate = useMemo(
    () =>
      new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    // Se recalcule quand les stats changent
    [stats]
  );

  const isBusy = loading || isRefreshing;

  return (
    <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']} showError>
      <PageTransition>
        <div className="space-y-8">
          {/* ═══════════════════════════════════════════════════════
              EN-TÊTE
             ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary shadow-sm sm:flex">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-ubuntu text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Tableau de bord
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Wifi className="h-2.5 w-2.5" />
                    Live
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {greeting},{' '}
                  <span className="font-medium text-foreground">
                    {userName}
                  </span>{' '}
                  👋 Voici votre activité en temps réel.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isBusy}
              className="gap-2 border-primary/20 bg-primary/5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10"
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5',
                  isBusy && 'animate-spin'
                )}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </span>
              <span className="sm:hidden">Actu.</span>
            </Button>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════
              ERREUR
             ═══════════════════════════════════════════════════════ */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="alert"
              className="relative overflow-hidden rounded-xl border border-red-200/50 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
              <div className="relative flex items-start gap-3">
                <span className="mt-0.5 text-lg leading-none">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold">Erreur de chargement</p>
                  <p className="mt-0.5 text-xs opacity-90">{errorMessage}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isBusy}
                  className="h-7 gap-1 px-2 text-xs text-red-700 hover:bg-red-100/50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  <RefreshCw
                    className={cn('h-3 w-3', isBusy && 'animate-spin')}
                  />
                  Réessayer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════
              1. EN DIRECT (QuickStats)
             ═══════════════════════════════════════════════════════ */}
          {stats?.quickStats &&
            Object.keys(stats.quickStats).length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                aria-labelledby="section-live"
                className="space-y-4"
              >
                <SectionHeader
                  icon={<Zap className="h-3.5 w-3.5" />}
                  title="En direct"
                  subtitle="Indicateurs temps réel"
                  badge="Live"
                  badgeColor="amber"
                  iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
                <QuickStats data={stats.quickStats} />
              </motion.section>
            )}

          {/* ═══════════════════════════════════════════════════════
              2. VUE D'ENSEMBLE (StatsOverview)
             ═══════════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            aria-labelledby="section-overview"
            className="space-y-4"
          >
            <SectionHeader
              icon={<BarChart3 className="h-3.5 w-3.5" />}
              title="Vue d'ensemble"
              subtitle="Données cumulées et tendances"
              badge="Cumulé"
              badgeColor="primary"
            />
            <StatsOverview stats={stats?.stats} loading={loading} />
          </motion.section>

          {/* ═══════════════════════════════════════════════════════
              3. ACTIONS RAPIDES (décommenter si besoin)
             ═══════════════════════════════════════════════════════ */}
          {/*
          <section aria-label="Actions rapides">
            <QuickActions />
          </section>
          */}

          {/* ═══════════════════════════════════════════════════════
              4. GRAPHIQUES + ACTIVITÉ
             ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* ─── Colonne principale : Graphiques ─── */}
            <div className="space-y-4 lg:col-span-2">
              <SectionHeader
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                title="Analyses & Graphiques"
                subtitle="Évolution des indicateurs clés"
                badge="30 derniers jours"
                badgeColor="secondary"
                iconBg="bg-secondary/10 text-secondary"
              />

              <ChartsSection
                stats={{
                  chartData: stats?.chartData,
                  roleData: stats?.roleData,
                  // ⚠️ summary volontairement omis (StatsOverview gère les cartes)
                }}
                loading={loading}
              />
            </div>

            {/* ─── Colonne latérale : Activité ─── */}
            <div className="space-y-6 lg:col-span-1">
              <section
                aria-labelledby="section-activity"
                className="space-y-4"
              >
                <SectionHeader
                  icon={<ListChecks className="h-3.5 w-3.5" />}
                  title="Activité"
                  subtitle="Notifications et évènements récents"
                  badge="Live"
                  badgeColor="emerald"
                  iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />

                {/* ⚡ Notifications temps réel */}
                <NotificationsPanel fetcher={fetchNotifications} />

                {/* 📋 Activités récentes (5 dernières) */}
                <RecentActivities
                  activities={stats?.activities || []}
                  loading={loading}
                  limit={5}
                />

                {/* 🕐 Timestamp */}
                <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Dernière mise à jour :{' '}
                    <span className="font-medium text-foreground">
                      {lastUpdate}
                    </span>
                  </span>
                </div>

                {/* ✅ Indicateur de santé */}
                {!error && !loading && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Système opérationnel</span>
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}