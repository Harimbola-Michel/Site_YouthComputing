// src/lib/cookies.ts

/**
 * Définit un cookie avec un nom, une valeur et une durée de vie en jours.
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Récupère la valeur d'un cookie par son nom.
 * Retourne la valeur décodée ou null si le cookie n'existe pas.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const last = parts.pop();
    if (last) {
      const first = last.split(';').shift();
      return first ? decodeURIComponent(first) : null;
    }
  }
  return null;
}

/**
 * Supprime un cookie en définissant sa date d'expiration dans le passé.
 */
export function removeCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}