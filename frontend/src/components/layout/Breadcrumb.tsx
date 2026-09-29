'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  'admin': 'Administration',
  'dashboard': 'Tableau de bord',
  'formations': 'Formations',
  'inscriptions': 'Inscriptions',
  'y2c': 'Communauté Y2C',
  'membres': 'Membres',
  'evenements': 'Événements',
  'articles': 'Articles',
  'projets-admin': 'Projets',
  'utilisateurs': 'Utilisateurs',
  'messages': 'Messages',
  'partenaires': 'Partenaires',
  'recrutements': 'Recrutements',
  'candidatures': 'Candidatures',
  'paiements': 'Paiements',
  'exports': 'Exports',
  'parametres': 'Paramètres',
  'a-propos': 'À propos',
  'communaute-y2c': 'Communauté Y2C',
  'projets': 'Projets',
  'blog': 'Blog',
  'contact': 'Contact',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Fil d'Ariane">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Accueil</span>
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={segment} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}