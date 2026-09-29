// src/hooks/useHomeData.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api, y2c } from '@/lib/api';
import type { Article, Stats } from '@/types';
import type { Y2CEvent } from '@/types/y2c.types';
import { AxiosError } from 'axios';

export interface HomeData {
  stats: Stats;
  articles: Article[];
  events: Y2CEvent[];
}

// ─── Données par défaut ────────────────────────────────────
const defaultStats: Stats = {
  users: 0,
  formations: 0,
  registrations: 0,
  y2cMembers: 0,
  projects: 0,
  payments: 0,
  articles: 0,
  revenue: 0,
};

const defaultArticles: Article[] = [];
const defaultEvents: Y2CEvent[] = [];

// ─── Fonction d’extraction robuste du total ──────────────
const extractTotal = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'total' in value) {
    return typeof value.total === 'number' ? value.total : 0;
  }
  if (Array.isArray(value)) return value.length;
  return 0;
};

// ─── Fonction de transformation des stats brutes ──────────
const transformStats = (rawStats: any): Stats => {
  return {
    users: extractTotal(rawStats.users),
    formations: extractTotal(rawStats.formations),
    registrations: extractTotal(rawStats.registrations),
    y2cMembers: extractTotal(rawStats.y2c),
    projects: extractTotal(rawStats.projects),
    payments: extractTotal(rawStats.payments),
    articles: extractTotal(rawStats.articles),
    revenue: typeof rawStats.payments === 'object' && rawStats.payments?.totalAmount
      ? rawStats.payments.totalAmount
      : 0,
  };
};

// ─── Fonctions de récupération ─────────────────────────────
const fetchHomeData = async (): Promise<HomeData> => {
  try {
    const [statsRes, articlesRes, eventsRes] = await Promise.all([
      api.get('/stats/global').catch((err) => {
        console.warn('⚠️ Erreur chargement stats:', err.message);
        return { data: { data: defaultStats } };
      }),
      api.get('/articles/published?limit=3&sort=desc').catch((err) => {
        console.warn('⚠️ Erreur chargement articles:', err.message);
        return { data: { data: defaultArticles } };
      }),
      y2c.getEvents({ limit: 3, isPublished: true }).catch((err) => {
        console.warn('⚠️ Erreur chargement événements:', err.message);
        return { data: { data: defaultEvents } };
      }),
    ]);

    const rawStats = statsRes?.data?.data ?? defaultStats;
    const stats = transformStats(rawStats);

    const articles = Array.isArray(articlesRes?.data?.data) ? articlesRes.data.data : defaultArticles;
    const events = Array.isArray(eventsRes?.data?.data?.data ?? eventsRes?.data?.data ?? eventsRes?.data)
      ? (eventsRes?.data?.data?.data ?? eventsRes?.data?.data ?? eventsRes?.data)
      : defaultEvents;

    return { stats, articles, events };
  } catch (error) {
    console.error('❌ Erreur globale chargement homeData:', error);
    return { stats: defaultStats, articles: defaultArticles, events: defaultEvents };
  }
};

export const useHomeData = (
  options?: Omit<UseQueryOptions<HomeData, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HomeData, Error>({
    queryKey: ['homeData'],
    queryFn: fetchHomeData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

// ─── Hooks spécialisés ─────────────────────────────────────
export const useHomeStats = (
  options?: Omit<UseQueryOptions<Stats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Stats, Error>({
    queryKey: ['homeStats'],
    queryFn: async () => {
      try {
        const res = await api.get('/stats/global');
        const rawStats = res.data?.data ?? defaultStats;
        return transformStats(rawStats);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Erreur chargement stats (fallback) :', error instanceof Error ? error.message : error);
        }
        return defaultStats;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

export const useHomeArticles = (
  limit: number = 3,
  options?: Omit<UseQueryOptions<Article[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Article[], Error>({
    queryKey: ['homeArticles', limit],
    queryFn: async () => {
      try {
        const res = await api.get(`/articles/published?limit=${limit}&page=1`);
        const payload = res.data?.data;
        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        return data;
      } catch (error) {
        console.error('❌ Erreur chargement articles:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

export const useHomeEvents = (
  limit: number = 3,
  options?: Omit<UseQueryOptions<Y2CEvent[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Y2CEvent[], Error>({
    queryKey: ['homeEvents', limit],
    queryFn: async () => {
      try {
        const res = await y2c.getEvents({ limit, isPublished: true });
        const data = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('❌ Erreur chargement événements Y2C:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};