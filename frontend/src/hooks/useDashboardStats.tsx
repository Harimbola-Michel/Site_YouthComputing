// src/hooks/useDashboardStats.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// ============================================================
// TYPES
// ============================================================
export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalFormations: number;
    totalRegistrations: number;
    totalY2CMembers: number;
    totalPayments: number;
    totalProjects: number;
    totalEvents: number;
    totalArticles: number;
    revenue: number;
    pendingValidations: number;
    recentSignups: number;
  };
  realtime: {
    onlineUsers: number;
    todayVisits: number;
    activeSessions: number;
  };
  activities: Array<{
    id: string;
    action: string;
    resource: string;
    createdAt: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string | null;
    } | null;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  quickStats: {
    activeUsers: number;
    newUsersToday: number;
    registrationsThisWeek: number;
    revenueThisMonth: number;
  };
  chartData: Array<{
    month: string;
    inscriptions: number;
    formations: number;
    y2c: number;
  }>;
  roleData: Array<{ name: string; value: number }>;
  timestamp: string;
}

// ============================================================
// VALEURS PAR DÉFAUT
// ============================================================
const defaultStats: DashboardStats = {
  stats: {
    totalUsers: 0,
    totalFormations: 0,
    totalRegistrations: 0,
    totalY2CMembers: 0,
    totalPayments: 0,
    totalProjects: 0,
    totalEvents: 0,
    totalArticles: 0,
    revenue: 0,
    pendingValidations: 0,
    recentSignups: 0,
  },
  realtime: { onlineUsers: 0, todayVisits: 0, activeSessions: 0 },
  activities: [],
  notifications: [],
  quickStats: {
    activeUsers: 0,
    newUsersToday: 0,
    registrationsThisWeek: 0,
    revenueThisMonth: 0,
  },
  chartData: [],
  roleData: [],
  timestamp: new Date().toISOString(),
};

// ============================================================
// HELPERS — Extraction sécurisée
// ============================================================
function num(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const parsed = Number(v);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function str(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return new Date().toISOString();
}

function arr<T = any>(...values: unknown[]): T[] {
  for (const v of values) {
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

// ============================================================
// CACHE SESSION (affichage instantané)
// ============================================================
const CACHE_KEY = 'dashboard-stats-cache';

function loadCache(): DashboardStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Vérifie que le cache n'est pas trop vieux (5 min)
    if (
      parsed?.timestamp &&
      Date.now() - new Date(parsed.timestamp).getTime() < 5 * 60 * 1000
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCache(data: DashboardStats) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ============================================================
// HOOK
// ============================================================
export function useDashboardStats() {
  // ✅ Charge le cache en premier pour affichage instantané
  const [stats, setStats] = useState<DashboardStats>(
    () => loadCache() || defaultStats
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Refs pour éviter les re-renders inutiles
  const abortRef = useRef<AbortController | null>(null);
  const errorToastShownRef = useRef(false);
  const isMountedRef = useRef(true);

  // ─── Cleanup unmount ───
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // ─── Fetch principal ───
  const fetchStats = useCallback(async (options?: { silent?: boolean }) => {
    const { silent = false } = options || {};

    // ✅ Annule la requête précédente
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      if (!silent) setLoading(true);
      setError(null);

      // ✅ Logs de debug
      if (process.env.NODE_ENV === 'development') {
        console.log('🎣 [useDashboardStats] Fetching...');
      }

      const [statsRes, quickRes] = await Promise.all([
        api.get('/dashboard/stats', { signal: abortRef.current.signal }),
        api
          .get('/dashboard/quick-stats', { signal: abortRef.current.signal })
          .catch(() => ({ data: {} })), // Fallback si quick-stats échoue
      ]);

      // Guard unmount
      if (!isMountedRef.current) return;

      // ─── Extraction multi-format ───
      const rawData: any =
        statsRes?.data?.data?.data ??
        statsRes?.data?.data ??
        statsRes?.data ??
        {};

      const quickRaw: any =
        quickRes?.data?.data ?? quickRes?.data ?? {};

      if (process.env.NODE_ENV === 'development') {
        console.log('🎣 [useDashboardStats] rawData:', rawData);
        console.log('🎣 [useDashboardStats] quickRaw:', quickRaw);
      }

      // ─── Support multi-format pour stats ───
      // Format 1 : { stats: { totalUsers, totalFormations, ... } }
      // Format 2 : { stats: { users: { total }, formations: { total }, ... } }
      // Format 3 : { totalUsers, totalFormations, ... }
      const statsSrc = rawData.stats ?? rawData;

      const normalizeStats = (src: any) => ({
        totalUsers: num(
          src?.users?.total,
          src?.totalUsers,
          src?.total_users,
          src?.users
        ),
        totalFormations: num(
          src?.formations?.total,
          src?.totalFormations,
          src?.total_formations,
          src?.formations
        ),
        totalRegistrations: num(
          src?.registrations?.total,
          src?.totalRegistrations,
          src?.total_registrations,
          src?.registrations
        ),
        totalY2CMembers: num(
          src?.y2c?.total,
          src?.y2cMembers?.total,
          src?.totalY2CMembers,
          src?.total_y2c_members,
          src?.y2cMembers
        ),
        totalPayments: num(
          src?.payments?.total,
          src?.totalPayments,
          src?.total_payments,
          src?.payments
        ),
        totalProjects: num(
          src?.projects?.total,
          src?.totalProjects,
          src?.total_projects,
          src?.projects
        ),
        totalEvents: num(
          src?.events?.total,
          src?.totalEvents,
          src?.total_events,
          src?.events
        ),
        totalArticles: num(
          src?.articles?.total,
          src?.totalArticles,
          src?.total_articles,
          src?.articles
        ),
        revenue: num(
          src?.payments?.revenue,
          src?.payments?.totalAmount,
          src?.revenue,
          src?.totalRevenue,
          src?.total_revenue
        ),
        pendingValidations: num(
          src?.pendingValidations,
          src?.pending_validations,
          src?.contact?.unread,
          src?.pending
        ),
        recentSignups: num(
          src?.recentSignups,
          src?.recent_signups,
          src?.newUsersThisMonth
        ),
      });

      // ─── Normalisation activités ───
      const rawActivities = arr(rawData.activities, rawData.recentActivities);
      const normalizedActivities = rawActivities.map((a: any) => ({
        id: a.id || `activity-${Math.random()}`,
        action: a.action || 'action',
        resource: a.resource || '',
        createdAt: str(a.createdAt, a.timestamp),
        user: a.User
          ? {
              id: a.User.id,
              firstName: a.User.firstName || '',
              lastName: a.User.lastName || '',
              email: a.User.email || '',
              avatar: a.User.avatar || null,
            }
          : a.user
            ? {
                id: a.user.id,
                firstName: a.user.firstName || '',
                lastName: a.user.lastName || '',
                email: a.user.email || '',
                avatar: a.user.avatar || null,
              }
            : null,
      }));

      // ─── Normalisation notifications ───
      const normalizedNotifications = arr(rawData.notifications).map(
        (n: any) => ({
          id: n.id || `notif-${Math.random()}`,
          title: n.title || 'Notification',
          message: n.message || '',
          read: Boolean(n.isRead ?? n.read ?? false),
          createdAt: str(n.createdAt),
          link: n.link || undefined,
          type: n.type || 'info',
        })
      );

      // ─── Normalisation chartData ───
      const normalizedChartData = arr<any>(rawData.chartData).map(
        (c: any) => ({
          month: String(c.month || c.label || ''),
          inscriptions: num(c.inscriptions, c.registrations),
          formations: num(c.formations),
          y2c: num(c.y2c, c.members),
        })
      );

      // ─── Normalisation roleData ───
      const normalizedRoleData = arr<any>(rawData.roleData).map((r: any) => ({
        name: String(r.name || r.role || 'Utilisateur'),
        value: num(r.value, r.count),
      }));

      // ─── Construction objet final ───
      const normalized: DashboardStats = {
        stats: normalizeStats(statsSrc),
        realtime: {
          onlineUsers: num(
            rawData.realtime?.activeUsers,
            rawData.realtime?.onlineUsers,
            rawData.realtime?.online
          ),
          todayVisits: num(rawData.realtime?.todayVisits, rawData.realtime?.visits),
          activeSessions: num(rawData.realtime?.activeSessions, rawData.realtime?.sessions),
        },
        activities: normalizedActivities,
        notifications: normalizedNotifications,
        quickStats: {
          activeUsers: num(quickRaw.activeUsers, quickRaw.active_users),
          newUsersToday: num(quickRaw.newUsersToday, quickRaw.new_users_today),
          registrationsThisWeek: num(
            quickRaw.registrationsThisWeek,
            quickRaw.registrations_this_week
          ),
          revenueThisMonth: num(
            quickRaw.revenueThisMonth,
            quickRaw.revenue_this_month
          ),
        },
        chartData: normalizedChartData,
        roleData: normalizedRoleData,
        timestamp: str(rawData.timestamp),
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('🎣 [useDashboardStats] Normalized:', normalized);
      }

      // ✅ Met à jour l'état + le cache
      setStats(normalized);
      saveCache(normalized);

      // ✅ Reset le flag d'erreur toast (car succès)
      errorToastShownRef.current = false;
    } catch (err: any) {
      // ✅ Ignore si annulé
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return;
      }

      if (!isMountedRef.current) return;

      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Erreur de chargement des statistiques';

      setError(message);

      // ✅ Gestion 401 → déconnexion
      if (status === 401) {
        console.warn('🎣 [useDashboardStats] 401 Unauthorized → déconnexion');
        // Le api.ts gère déjà la redirection via intercepteur
        // On n'affiche pas de toast pour éviter le spam
      } else if (!errorToastShownRef.current) {
        // ✅ Un seul toast par session d'erreur
        toast.error(message, { id: 'dashboard-stats-error' });
        errorToastShownRef.current = true;
      }

      // ⚠️ IMPORTANT : on garde les stats actuelles (cache ou précédentes)
      // On ne fait PLUS setStats(defaultStats) → les cartes restent visibles
    } finally {
      if (isMountedRef.current && !silent) {
        setLoading(false);
      }
    }
  }, []);

  // ─── Fetch initial ───
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ✅ Expose refetch avec option silent
  const refetch = useCallback(
    (options?: { silent?: boolean }) => fetchStats(options),
    [fetchStats]
  );

  return { stats, loading, error, refetch };
} 