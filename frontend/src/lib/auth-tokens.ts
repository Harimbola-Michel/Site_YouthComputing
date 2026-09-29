// src/lib/auth-tokens.ts
import Cookies from 'js-cookie';
import type { AuthTokens } from '@/types';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════
const COOKIE_KEY = 'auth_tokens';
const ACCESS_COOKIE = 'auth-token';
const REFRESH_COOKIE = 'refresh-token';
const LS_ACCESS_KEY = 'auth-token';
const LS_REFRESH_KEY = 'refresh-token';

// En dev, on ne met pas `secure: true` (sinon le cookie est ignoré sur http)
const COOKIE_OPTIONS = {
  expires: 7, // 7 jours
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // ⚠️ Lax (pas strict) pour compat Next.js proxy
  path: '/',
};

// ═══════════════════════════════════════════════════════════════
// STOCKAGE — Écrit dans localStorage ET cookies
// ═══════════════════════════════════════════════════════════════
export function setTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  if (!tokens?.accessToken) return;

  const { accessToken, refreshToken } = tokens;

  // ─── 1) localStorage (source de vérité pour axios) ───
  try {
    localStorage.setItem(LS_ACCESS_KEY, accessToken);
    localStorage.setItem('access_token', accessToken); // alias
    localStorage.setItem('token', accessToken); // alias
    if (refreshToken) {
      localStorage.setItem(LS_REFRESH_KEY, refreshToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  } catch (err) {
    console.warn('[auth-tokens] localStorage indisponible:', err);
  }

  // ─── 2) Cookies (pour le proxy Next.js / SSR) ───
  try {
    // Cookie JSON complet (rétrocompat)
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({ accessToken, refreshToken }),
      COOKIE_OPTIONS
    );

    // Cookies individuels — noms compatibles avec le proxy
    Cookies.set(ACCESS_COOKIE, accessToken, COOKIE_OPTIONS);
    if (refreshToken) {
      Cookies.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    }

    // Alias pour compatibilité anciens composants
    Cookies.set('access_token', accessToken, COOKIE_OPTIONS);
    if (refreshToken) {
      Cookies.set('refresh_token', refreshToken, COOKIE_OPTIONS);
    }
  } catch (err) {
    console.warn('[auth-tokens] Cookies indisponibles:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// LECTURE — localStorage en priorité, puis cookies
// ═══════════════════════════════════════════════════════════════
export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;

  // ─── 1) localStorage ───
  try {
    const accessToken =
      localStorage.getItem(LS_ACCESS_KEY) ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token');

    if (accessToken) {
      const refreshToken =
        localStorage.getItem(LS_REFRESH_KEY) ||
        localStorage.getItem('refresh_token') ||
        '';
      return { accessToken, refreshToken };
    }
  } catch {
    /* ignore */
  }

  // ─── 2) Cookie JSON ───
  try {
    const raw = Cookies.get(COOKIE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) {
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken || '',
        };
      }
    }
  } catch {
    /* ignore */
  }

  // ─── 3) Cookies individuels ───
  const access =
    Cookies.get(ACCESS_COOKIE) || Cookies.get('access_token') || null;
  if (access) {
    return {
      accessToken: access,
      refreshToken:
        Cookies.get(REFRESH_COOKIE) ||
        Cookies.get('refresh_token') ||
        '',
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// SUPPRESSION — nettoie tout
// ═══════════════════════════════════════════════════════════════
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  // ─── 1) localStorage ───
  try {
    [
      LS_ACCESS_KEY,
      LS_REFRESH_KEY,
      'access_token',
      'refresh_token',
      'token',
      'auth-token',
      'auth_tokens',
    ].forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }

  // ─── 2) Cookies ───
  try {
    [
      COOKIE_KEY,
      ACCESS_COOKIE,
      REFRESH_COOKIE,
      'access_token',
      'refresh_token',
      'token',
    ].forEach((name) => Cookies.remove(name, { path: '/' }));
  } catch {
    /* ignore */
  }
}

// ═══════════════════════════════════════════════════════════════
// ACCESS TOKEN — pour intercepteurs axios
// ═══════════════════════════════════════════════════════════════
export function getAccessToken(): string | null {
  const tokens = getTokens();
  return tokens?.accessToken || null;
}

// ═══════════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════
export function getRefreshToken(): string | null {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS BONUS
// ═══════════════════════════════════════════════════════════════
export function hasTokens(): boolean {
  return !!getAccessToken();
}

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}