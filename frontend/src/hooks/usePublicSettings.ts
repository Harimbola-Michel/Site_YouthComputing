// src/hooks/usePublicSettings.ts
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/* ============================================================
 *  TYPES
 * ============================================================ */
export interface NavbarSettings {
  logoUrl?: string;
  logoAlt?: string;
  brandPrimary?: string;
  brandSecondary?: string;
  navItems?: { label: string; href: string }[];
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  showAuthButtons?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterSettings {
  brandPrimary?: string;
  brandSecondary?: string;
  description?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  columns?: FooterColumn[];
  contact?: { email?: string; phone?: string; address?: string };
  copyright?: string;
}

export interface GeneralSettings {
  siteName?: string;
  siteUrl?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
}

export interface PublicSettings {
  navbar?: NavbarSettings;
  footer?: FooterSettings;
  general?: GeneralSettings;
  public?: Record<string, any>;
  [key: string]: any;
}

/* ============================================================
 *  CACHE + BROADCAST
 * ============================================================ */
const CACHE_TTL_MS = 30_000;
const EVENT_NAME = 'public-settings:updated';
const STORAGE_KEY = 'public-settings:broadcast';
const BC_NAME = 'public-settings';

let cache: PublicSettings | null = null;
let cacheTime = 0;
let inflight: Promise<PublicSettings> | null = null;
const listeners = new Set<(s: PublicSettings) => void>();

function isCacheValid() {
  return cache !== null && Date.now() - cacheTime < CACHE_TTL_MS;
}

function emit(settings: PublicSettings) {
  listeners.forEach((fn) => {
    try {
      fn(settings);
    } catch (e) {
      /* ignore */
    }
  });
}

/* ============================================================
 *  CHARGEMENT
 * ============================================================ */
async function fetchSettings(force = false): Promise<PublicSettings> {
  if (!force && isCacheValid()) return cache!;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await api.get('/settings/public');
      const data = res.data?.data ?? res.data ?? {};
      cache = data;
      cacheTime = Date.now();
    } catch (err) {
      console.error('[usePublicSettings] fetch error:', err);
      if (!cache) cache = {};
    } finally {
      inflight = null;
    }
    return cache!;
  })();

  return inflight;
}

/** Force le rechargement + notifie tous les abonnés et les autres onglets */
export async function refreshPublicSettings(): Promise<PublicSettings> {
  cache = null;
  cacheTime = 0;
  inflight = null;

  const data = await fetchSettings(true);
  emit(data);

  // Propagation même onglet
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch {}

  // Propagation cross-onglets
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
  try {
    const bc = new BroadcastChannel(BC_NAME);
    bc.postMessage({ type: 'update', ts: Date.now() });
    bc.close();
  } catch {}

  return data;
}

/* ============================================================
 *  HOOK
 * ============================================================ */
export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(cache);
  const [isLoading, setIsLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const apply = (s: PublicSettings) => {
      if (mounted) setSettings(s);
    };
    listeners.add(apply);

    // Fetch initial
    fetchSettings()
      .then((d) => {
        if (mounted) setSettings(d);
      })
      .catch((e) => {
        if (mounted) setError(e?.message ?? 'Erreur');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    // Revalidation sur focus fenêtre
    const onFocus = () => {
      if (!isCacheValid()) fetchSettings(true).then(apply);
    };
    // Revalidation sur changement d'onglet
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !isCacheValid()) {
        fetchSettings(true).then(apply);
      }
    };
    // Cross-onglets : localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) fetchSettings(true).then(apply);
    };
    // Cross-onglets : BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = () => fetchSettings(true).then(apply);
    } catch {}
    // Même onglet : custom event
    const onCustom = (e: Event) => {
      const d = (e as CustomEvent).detail as PublicSettings | undefined;
      if (d) apply(d);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVENT_NAME, onCustom);

    return () => {
      mounted = false;
      listeners.delete(apply);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVENT_NAME, onCustom);
      bc?.close();
    };
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    const data = await refreshPublicSettings();
    setSettings(data);
    setIsLoading(false);
  };

  return { settings, isLoading, error, refresh };
}