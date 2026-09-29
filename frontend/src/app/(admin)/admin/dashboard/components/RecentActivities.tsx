// src/app/(admin)/admin/dashboard/components/RecentActivities.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import {
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view';

export type ActivityItem = {
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
};

interface RecentActivitiesProps {
  activities?: ActivityItem[];
  loading?: boolean;
  limit?: number;
}

// ============================================================
// CONFIG DES ACTIONS
// ============================================================
const ACTION_STYLES: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  login: {
    icon: <LogIn className="h-3 w-3" />,
    color:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
    label: 'Connexion',
  },
  logout: {
    icon: <LogOut className="h-3 w-3" />,
    color:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20',
    label: 'Déconnexion',
  },
  create: {
    icon: <UserPlus className="h-3 w-3" />,
    color:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20',
    label: 'Création',
  },
  update: {
    icon: <Edit3 className="h-3 w-3" />,
    color:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
    label: 'Modification',
  },
  delete: {
    icon: <Trash2 className="h-3 w-3" />,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20',
    label: 'Suppression',
  },
  view: {
    icon: <Eye className="h-3 w-3" />,
    color:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 ring-gray-500/20',
    label: 'Consultation',
  },
};

// ============================================================
// UTILS
// ============================================================
const getFullName = (user: ActivityItem['user']) => {
  if (!user) return 'Utilisateur inconnu';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.email || 'Utilisateur';
};

const getInitials = (user: ActivityItem['user']) => {
  if (!user) return '?';
  const f = user.firstName?.charAt(0) || '';
  const l = user.lastName?.charAt(0) || '';
  return (f + l).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
};

const getFallbackColor = (userId?: string) => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-amber-500 to-amber-600',
    'bg-gradient-to-br from-rose-500 to-rose-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
  ];
  if (!userId) return 'bg-muted';
  const idx =
    userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) %
    colors.length;
  return colors[idx];
};

// ============================================================
// COMPOSANT
// ============================================================
export function RecentActivities({
  activities = [],
  loading = false,
  limit = 8,
}: RecentActivitiesProps) {
  const list = activities.slice(0, limit);

  if (loading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-secondary">
              <Activity className="h-3.5 w-3.5" />
            </span>
            Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      {/* ─── Header ─── */}
      <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/10 text-secondary">
            <Activity className="h-3.5 w-3.5" />
          </span>
          Activités récentes
          {list.length > 0 && (
            <span className="ml-auto rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {list.length} dernières
            </span>
          )}
        </CardTitle>
      </CardHeader>

      {/* ─── Liste avec timeline ─── */}
      <CardContent className="relative p-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
              <Activity className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Aucune activité récente
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Les actions apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="relative space-y-1">
            {/* Ligne verticale de timeline */}
            <div
              className="absolute left-[22px] top-3 bottom-3 w-px bg-gradient-to-b from-border via-border to-transparent"
              aria-hidden="true"
            />

            {list.map((activity, index) => {
              const userName = getFullName(activity.user);
              const initials = getInitials(activity.user);
              const fallbackColor = getFallbackColor(activity.user?.id);
              const actionKey = activity.action?.toLowerCase() || 'view';
              const actionStyle =
                ACTION_STYLES[actionKey] || ACTION_STYLES.view;

              return (
                <motion.div
                  key={activity.id || index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40"
                >
                  {/* ─── Avatar avec badge d'action ─── */}
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 ring-2 ring-background transition-transform duration-300 group-hover:scale-105">
                      {activity.user?.avatar && (
                        <AvatarImage
                          src={activity.user.avatar}
                          alt={userName}
                          loading="lazy"
                        />
                      )}
                      <AvatarFallback
                        className={cn(
                          'text-xs font-bold text-white',
                          fallbackColor
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Badge action en overlay */}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-background',
                        actionStyle.color
                      )}
                      title={actionStyle.label}
                    >
                      {actionStyle.icon}
                    </span>
                  </div>

                  {/* ─── Contenu ─── */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold text-foreground">
                        {userName}
                      </span>
                      <span className="mx-1.5 text-muted-foreground/40">
                        •
                      </span>
                      <span className="text-muted-foreground">
                        {actionStyle.label}
                      </span>
                      {activity.resource && (
                        <>
                          <span className="mx-1.5 text-muted-foreground/40">
                            •
                          </span>
                          <span className="font-medium text-foreground/85">
                            {activity.resource}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}