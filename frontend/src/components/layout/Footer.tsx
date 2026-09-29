// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ChevronRight,
} from 'lucide-react';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { footerNavigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
} as const;

/* ============================================================
 *  FALLBACK depuis la config statique
 * ============================================================ */
type FooterColumn = { title: string; links: { label: string; href: string }[] };

function fallbackColumns(): FooterColumn[] {
  const cols: FooterColumn[] = [];
  if (Array.isArray(footerNavigation?.company) && footerNavigation.company.length > 0) {
    cols.push({
      title: 'Youth Computing',
      links: footerNavigation.company.map((c: any) => ({
        label: c.label,
        href: c.href,
      })),
    });
  }
  if (Array.isArray(footerNavigation?.services) && footerNavigation.services.length > 0) {
    cols.push({
      title: 'Services',
      links: footerNavigation.services.map((c: any) => ({
        label: c.label,
        href: c.href,
      })),
    });
  }
  return cols;
}

function fallbackSocial(): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(footerNavigation?.social)) {
    for (const s of footerNavigation.social) {
      if (s?.icon && s?.href) out[s.icon] = s.href;
    }
  }
  return out;
}

/* ============================================================
 *  COMPOSANT
 * ============================================================ */
export function Footer() {
  const year = new Date().getFullYear();
  const { settings } = usePublicSettings();
  const db = settings?.footer ?? {};

  // ─── Colonnes ───
  const dbColumns = Array.isArray(db.columns) ? db.columns : [];
  const columns: FooterColumn[] =
    dbColumns.length > 0 ? dbColumns : fallbackColumns();

  // ─── Réseaux sociaux ───
  const dbSocial = (db.social && typeof db.social === 'object') ? db.social : {};
  const hasDbSocial = Object.values(dbSocial).some(
    (v) => typeof v === 'string' && v.length > 0
  );
  const social: Record<string, string> = hasDbSocial
    ? (dbSocial as Record<string, string>)
    : fallbackSocial();

  // ─── Contact ───
  const contact = {
    email: db.contact?.email || siteConfig?.contact?.email || '',
    phone: db.contact?.phone || siteConfig?.contact?.phone || '',
    address: db.contact?.address || siteConfig?.contact?.address || '',
  };

  // ─── Brand ───
  const brandPrimary = db.brandPrimary || 'Youth';
  const brandSecondary = db.brandSecondary || 'Computing';
  const description =
    db.description || 'Association pour la promotion des NTIC à Madagascar.';

  // ─── Copyright ───
  const copyright =
    db.copyright || `${brandPrimary}${brandSecondary}. Tous droits réservés.`;

  // ─── Social entries ───
  const socialEntries = Object.entries(social).filter(
    ([key, href]) =>
      typeof href === 'string' && href.length > 0 && key in SOCIAL_ICONS
  ) as [keyof typeof SOCIAL_ICONS, string][];

  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* ═══════ Brand ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-ubuntu text-2xl font-bold">
              <span className="text-white">{brandPrimary}</span>
              <span className="text-secondary">{brandSecondary}</span>
            </h3>
            {description && (
              <p className="text-sm text-white/70">{description}</p>
            )}
            {socialEntries.length > 0 && (
              <div className="flex gap-3">
                {socialEntries.map(([key, href]) => {
                  const Icon = SOCIAL_ICONS[key];
                  return (
                    <motion.a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="rounded-full bg-white/10 p-2 transition-colors hover:bg-secondary"
                      aria-label={key}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ═══════ Colonnes dynamiques ═══════ */}
          {columns.map((column, i) => (
            <motion.div
              key={`${column.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
              className="space-y-4"
            >
              <h4 className="font-ubuntu font-semibold">{column.title}</h4>
              <ul className="space-y-2 text-sm text-white/70">
                {(column.links ?? []).map((item, j) => (
                  <li key={`${item.href}-${j}`}>
                    <Link
                      href={item.href || '#'}
                      className="flex items-center gap-1 transition-colors hover:text-secondary"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* ═══════ Contact ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-ubuntu font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {contact.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>{contact.email}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>{contact.phone}</span>
                </li>
              )}
              {contact.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                  <span>{contact.address}</span>
                </li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* ═══════ Bottom bar ═══════ */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-white/50">
          <p>
            &copy; {year} {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}