// src/app/(admin)/admin/dashboard/components/QuickActions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  GraduationCap,
  UsersRound,
  CalendarPlus,
  FileText,
  Mail,
  DollarSign,
  Settings,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
type ActionColor =
  | 'blue'
  | 'amber'
  | 'purple'
  | 'cyan'
  | 'emerald'
  | 'rose'
  | 'green'
  | 'gray';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: ActionColor;
}

// ============================================================
// PALETTE
// ============================================================
const COLOR_STYLES: Record<
  ActionColor,
  {
    bg: string;
    hover: string;
    icon: string;
    iconHover: string;
    border: string;
    arrow: string;
  }
> = {
  blue: {
    bg: 'bg-blue-500/5',
    hover: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    iconHover: 'group-hover:bg-blue-500 group-hover:text-white',
    border: 'border-blue-500/20',
    arrow: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    bg: 'bg-amber-500/5',
    hover: 'hover:bg-amber-500/10 hover:border-amber-500/30',
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    iconHover: 'group-hover:bg-amber-500 group-hover:text-white',
    border: 'border-amber-500/20',
    arrow: 'text-amber-600 dark:text-amber-400',
  },
  purple: {
    bg: 'bg-purple-500/5',
    hover: 'hover:bg-purple-500/10 hover:border-purple-500/30',
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    iconHover: 'group-hover:bg-purple-500 group-hover:text-white',
    border: 'border-purple-500/20',
    arrow: 'text-purple-600 dark:text-purple-400',
  },
  cyan: {
    bg: 'bg-cyan-500/5',
    hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/30',
    icon: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    iconHover: 'group-hover:bg-cyan-500 group-hover:text-white',
    border: 'border-cyan-500/20',
    arrow: 'text-cyan-600 dark:text-cyan-400',
  },
  emerald: {
    bg: 'bg-emerald-500/5',
    hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    iconHover: 'group-hover:bg-emerald-500 group-hover:text-white',
    border: 'border-emerald-500/20',
    arrow: 'text-emerald-600 dark:text-emerald-400',
  },
  rose: {
    bg: 'bg-rose-500/5',
    hover: 'hover:bg-rose-500/10 hover:border-rose-500/30',
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    iconHover: 'group-hover:bg-rose-500 group-hover:text-white',
    border: 'border-rose-500/20',
    arrow: 'text-rose-600 dark:text-rose-400',
  },
  green: {
    bg: 'bg-green-500/5',
    hover: 'hover:bg-green-500/10 hover:border-green-500/30',
    icon: 'bg-green-500/10 text-green-600 dark:text-green-400',
    iconHover: 'group-hover:bg-green-500 group-hover:text-white',
    border: 'border-green-500/20',
    arrow: 'text-green-600 dark:text-green-400',
  },
  gray: {
    bg: 'bg-gray-500/5',
    hover: 'hover:bg-gray-500/10 hover:border-gray-500/30',
    icon: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    iconHover: 'group-hover:bg-gray-500 group-hover:text-white',
    border: 'border-gray-500/20',
    arrow: 'text-gray-600 dark:text-gray-400',
  },
};

// ============================================================
// COMPOSANT
// ============================================================
export function QuickActions() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      label: 'Ajouter un utilisateur',
      description: 'Créer un nouveau compte',
      icon: <UserPlus className="h-4 w-4" />,
      href: '/admin/utilisateurs?action=add',
      color: 'blue',
    },
    {
      label: 'Créer une formation',
      description: 'Nouvelle formation',
      icon: <GraduationCap className="h-4 w-4" />,
      href: '/admin/formations/nouveau',
      color: 'amber',
    },
    {
      label: 'Gérer Y2C',
      description: 'Membres & événements',
      icon: <UsersRound className="h-4 w-4" />,
      href: '/admin/y2c/membres',
      color: 'purple',
    },
    {
      label: 'Nouvel événement',
      description: 'Planifier un événement',
      icon: <CalendarPlus className="h-4 w-4" />,
      href: '/admin/evenements/nouveau',
      color: 'cyan',
    },
    {
      label: 'Rédiger un article',
      description: 'Publier du contenu',
      icon: <FileText className="h-4 w-4" />,
      href: '/admin/articles/nouveau',
      color: 'emerald',
    },
    {
      label: 'Voir les messages',
      description: 'Boîte de réception',
      icon: <Mail className="h-4 w-4" />,
      href: '/admin/messages',
      color: 'rose',
    },
    {
      label: 'Gérer les paiements',
      description: 'Suivi des transactions',
      icon: <DollarSign className="h-4 w-4" />,
      href: '/admin/paiements',
      color: 'green',
    },
    {
      label: 'Paramètres',
      description: 'Configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/admin/parametres',
      color: 'gray',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-border/60 shadow-sm">
        {/* ─── Header ─── */}
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-3.5 w-3.5" />
            </span>
            Actions rapides
            <span className="ml-auto rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {actions.length} raccourcis
            </span>
          </CardTitle>
        </CardHeader>

        {/* ─── Grille ─── */}
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action, index) => {
              const styles = COLOR_STYLES[action.color];
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(action.href)}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    styles.border,
                    styles.bg,
                    styles.hover
                  )}
                >
                  {/* Icône */}
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
                      styles.icon,
                      styles.iconHover
                    )}
                  >
                    {action.icon}
                  </div>

                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold leading-tight text-foreground">
                      {action.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  {/* Flèche */}
                  <ArrowRight
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100',
                      styles.arrow
                    )}
                  />
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}