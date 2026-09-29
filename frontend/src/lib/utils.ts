// frontend/src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// CLASSES CSS
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// DATES - FONCTIONS SÉCURISÉES
// ============================================================

/**
 * Convertit une entrée en objet Date, retourne null si invalide
 */
function safeParseDate(date: string | Date | null | undefined): Date | null {
  if (date === null || date === undefined) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formate une date en français (jour mois année)
 * Retourne "Date invalide" si la date est invalide
 */
export function formatDate(date: string | Date | null | undefined): string {
  const d = safeParseDate(date);
  if (!d) return 'Date invalide';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate une date en court (jour mois année)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  const d = safeParseDate(date);
  if (!d) return 'Date invalide';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formate une date avec heure
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  const d = safeParseDate(date);
  if (!d) return 'Date invalide';
  return d.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * ✅ Formate uniquement l'heure (HH:MM)
 * Utile pour les événements, calendriers, etc.
 */
export function formatTime(date: string | Date | null | undefined): string {
  const d = safeParseDate(date);
  if (!d) return '';
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une date en "il y a X"
 * Retourne "Date invalide" si la date est invalide
 */
export function formatTimeAgo(date: string | Date | null | undefined): string {
  const d = safeParseDate(date);
  if (!d) return 'Date invalide';

  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Si la date est dans le futur (diff négatif), on affiche la date normale
  if (diff < 0) return formatDateShort(d);

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours} h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} j`;

  return formatDateShort(d);
}

// ============================================================
// AUTRES FORMATAGES
// ============================================================

/**
 * Formate un nombre
 */
export function formatNumber(number: number, decimals: number = 0): string {
  if (number === undefined || number === null) return '0';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Formate un montant en monnaie (MGA par défaut)
 */
export function formatCurrency(amount: number, currency: string = 'MGA'): string {
  if (amount === undefined || amount === null) return '0 MGA';
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Tronque un texte
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Génère un slug à partir d'un texte
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Génère des initiales (sécurisé)
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.trim() || '';
  const l = lastName?.trim() || '';
  const initials = (f.charAt(0) + l.charAt(0)).toUpperCase();
  return initials || 'U';
}

/**
 * Couleur aléatoire
 */
export function getRandomColor(): string {
  const colors = [
    '#F13544', '#010B40', '#2E86AB', '#F4A261', '#E76F51',
    '#6C5B7B', '#F8B195', '#355C7D', '#E5989B', '#6B705C',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}