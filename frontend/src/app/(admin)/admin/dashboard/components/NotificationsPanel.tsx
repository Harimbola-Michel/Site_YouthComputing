// src/app/(admin)/admin/dashboard/components/NotificationsPanel.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ChevronRight,
  BellOff,
  Trash2,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocket } from '@/hooks/useSocket';
import type { Notification } from '@/hooks/useNotifications';

// ============================================================
// TYPES
// ============================================================
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type FilterType = 'all' | NotificationType | 'unread';

interface NotificationsPanelProps {
  fetcher?: () => Promise<unknown>;
  eventName?: string;
  collapsedLimit?: number;
}

// ============================================================
// CONFIG — Types de notifications
// ============================================================
const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    iconBg: string;
    accentBar: string;
    dot: string;
  }
> = {
  info: {
    icon: Info,
    label: 'Information',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    accentBar: 'bg-blue-500',
    dot: 'bg-blue-500',
  },
  success: {
    icon: CheckCircle2,
    label: 'Succès',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accentBar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Avertissement',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    accentBar: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
  error: {
    icon: XCircle,
    label: 'Erreur',
    iconBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
    accentBar: 'bg-red-500',
    dot: 'bg-red-500',
  },
};

// ============================================================
// HELPERS
// ============================================================
function getDateGroup(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    if (date >= today) return "Aujourd'hui";
    if (date >= yesterday) return 'Hier';
    if (date >= weekAgo) return 'Cette semaine';
    return 'Plus ancien';
  } catch {
    return 'Plus ancien';
  }
}

const GROUP_ORDER = [
  "Aujourd'hui",
  'Hier',
  'Cette semaine',
  'Plus ancien',
] as const;

// ✅ Normalise en tableau (sécurité)
function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function NotificationsPanel({
  fetcher,
  eventName = 'notification',
  collapsedLimit = 5,
}: NotificationsPanelProps) {
  // ═══════════════════════════════════════════════════════════
  // HOOKS — ordre STABLE
  // ═══════════════════════════════════════════════════════════

  // 1. Router
  const router = useRouter();

  // 2. Socket — récupère `isConnected` (le nom réel)
  const socketCtx = useSocket();
  const isConnected = socketCtx?.isConnected ?? false;

  // 3. Notifications
  const {
    notifications: rawNotifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
  } = useNotifications({ fetcher, eventName });

  // 4. États locaux
  const [showAll, setShowAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // ═══════════════════════════════════════════════════════════
  // SÉCURISATION — Toujours un tableau
  // ═══════════════════════════════════════════════════════════
  const notifications = useMemo(
    () => toArray<Notification>(rawNotifications),
    [rawNotifications]
  );

  // ─── Filtrage ───
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // ─── Limitation ───
  const displayNotifications = useMemo(
    () =>
      showAll
        ? filteredNotifications
        : filteredNotifications.slice(0, collapsedLimit),
    [filteredNotifications, showAll, collapsedLimit]
  );

  // ─── Groupement par date ───
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    displayNotifications.forEach((n) => {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [displayNotifications]);

  // ─── Compteurs ───
  const counts = useMemo(() => {
    const byType: Record<string, number> = {};
    notifications.forEach((n) => {
      const key = n.type || 'info';
      byType[key] = (byType[key] || 0) + 1;
    });
    return {
      all: notifications.length,
      unread: unreadCount,
      info: byType.info || 0,
      success: byType.success || 0,
      warning: byType.warning || 0,
      error: byType.error || 0,
    };
  }, [notifications, unreadCount]);

  // ═══════════════════════════════════════════════════════════
  // LOADING (early return — après tous les hooks)
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Bell className="h-3.5 w-3.5" />
            </span>
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
        {/* ═══════════════ HEADER ═══════════════ */}
        <CardHeader className="border-b border-border/50 bg-muted/30 py-3">
          <div className="flex flex-row items-center justify-between gap-2">
            {/* Titre + statut */}
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <CardTitle className="text-sm font-semibold">
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 px-1.5 text-[10px] font-bold tabular-nums"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
              {/* Statut socket */}
              <div
                title={isConnected ? 'Temps réel actif' : 'Hors ligne'}
                className="ml-1 flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-1.5 py-0.5"
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isConnected
                      ? 'bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                      : 'bg-gray-400'
                  )}
                  aria-label={isConnected ? 'Connecté' : 'Déconnecté'}
                />
                <span
                  className={cn(
                    'text-[9px] font-semibold uppercase tracking-wider',
                    isConnected
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {isConnected ? 'Live' : 'Off'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 gap-1 px-2 text-xs"
                  aria-label="Tout marquer comme lu"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">Tout lire</span>
                </Button>
              )}
              {filteredNotifications.length > collapsedLimit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="h-7 gap-1 px-2 text-xs"
                  aria-expanded={showAll}
                >
                  {showAll
                    ? 'Moins'
                    : `Voir tout (${filteredNotifications.length})`}
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 transition-transform duration-300',
                      showAll && 'rotate-90'
                    )}
                  />
                </Button>
              )}
            </div>
          </div>

          {/* ═══════════════ FILTRES ═══════════════ */}
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <FilterChip
              label="Tout"
              count={counts.all}
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            {unreadCount > 0 && (
              <FilterChip
                label="Non lues"
                count={unreadCount}
                active={activeFilter === 'unread'}
                onClick={() => setActiveFilter('unread')}
                variant="primary"
              />
            )}
            <FilterChip
              label="Succès"
              count={counts.success}
              active={activeFilter === 'success'}
              onClick={() => setActiveFilter('success')}
              variant="success"
            />
            <FilterChip
              label="Infos"
              count={counts.info}
              active={activeFilter === 'info'}
              onClick={() => setActiveFilter('info')}
              variant="info"
            />
            <FilterChip
              label="Alertes"
              count={counts.warning + counts.error}
              active={activeFilter === 'warning' || activeFilter === 'error'}
              onClick={() => setActiveFilter('warning')}
              variant="warning"
            />
          </div>
        </CardHeader>

        {/* ═══════════════ BODY ═══════════════ */}
        <CardContent className="p-0">
          <ScrollArea className={cn(showAll ? 'h-[400px]' : 'h-[280px]')}>
            {displayNotifications.length === 0 ? (
              <EmptyNotifications filter={activeFilter} />
            ) : (
              <div className="pb-2">
                {GROUP_ORDER.map((groupName) => {
                  const groupItems = groupedNotifications[groupName];
                  if (!groupItems || groupItems.length === 0) return null;

                  return (
                    <div key={groupName}>
                      {/* Séparateur de groupe */}
                      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/95 px-4 py-2 backdrop-blur-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {groupName}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-[10px] font-medium text-muted-foreground/70">
                          {groupItems.length}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-border/30">
                        <AnimatePresence initial={false}>
                          {groupItems.map((notification, index) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              index={index}
                              onMarkAsRead={() => markAsRead(notification.id)}
                              onRemove={() => remove(notification.id)}
                              onNavigate={(link) => router.push(link)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* ═══════════════ FOOTER ═══════════════ */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2">
            <span className="text-[10px] text-muted-foreground">
              {notifications.length} notification
              {notifications.length > 1 ? 's' : ''} au total
            </span>
            {unreadCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

// ─── Chip de filtre ───
function FilterChip({
  label,
  count,
  active,
  onClick,
  variant = 'default',
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}) {
  const variants = {
    default: {
      active: 'bg-foreground text-background border-foreground shadow-sm',
      inactive: 'hover:bg-muted/60 text-muted-foreground',
    },
    primary: {
      active: 'bg-primary text-primary-foreground border-primary shadow-sm',
      inactive: 'hover:bg-primary/10 text-primary',
    },
    success: {
      active: 'bg-emerald-500 text-white border-emerald-500 shadow-sm',
      inactive:
        'hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      active: 'bg-amber-500 text-white border-amber-500 shadow-sm',
      inactive: 'hover:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    info: {
      active: 'bg-blue-500 text-white border-blue-500 shadow-sm',
      inactive: 'hover:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
        count === 0 && 'cursor-not-allowed opacity-40',
        active ? variants[variant].active : variants[variant].inactive
      )}
      aria-pressed={active}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={cn(
            'rounded-full px-1 text-[9px] font-bold tabular-nums',
            active ? 'bg-white/20' : 'bg-muted-foreground/20'
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

// ─── Item de notification ───
function NotificationItem({
  notification,
  index,
  onMarkAsRead,
  onRemove,
  onNavigate,
}: {
  notification: Notification;
  index: number;
  onMarkAsRead: () => void;
  onRemove: () => void;
  onNavigate: (link: string) => void;
}) {
  const type = (notification.type || 'info') as NotificationType;
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;
  const isUnread = !notification.read;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors',
        isUnread ? 'bg-secondary/5 hover:bg-secondary/10' : 'hover:bg-muted/40'
      )}
      onClick={() => {
        if (isUnread) onMarkAsRead();
        if (notification.link) onNavigate(notification.link);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isUnread) onMarkAsRead();
          if (notification.link) onNavigate(notification.link);
        }
      }}
    >
      {/* Barre d'accent */}
      {isUnread && (
        <span
          className={cn(
            'absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full',
            config.accentBar
          )}
          aria-hidden="true"
        />
      )}

      {/* Icône */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-background transition-transform duration-300 group-hover:scale-105',
            config.iconBg
          )}
        >
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        {isUnread && (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full ring-2 ring-background',
              config.dot
            )}
            aria-label="Non lue"
          />
        )}
      </div>

      {/* Contenu */}
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'truncate text-sm leading-snug',
              isUnread
                ? 'font-semibold text-foreground'
                : 'font-medium text-foreground/90'
            )}
          >
            {notification.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'shrink-0 rounded-md p-1 transition-all',
              'opacity-0 group-hover:opacity-100',
              'hover:bg-red-500/10 hover:text-red-500',
              'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label="Supprimer la notification"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
          </button>
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {notification.message}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground/70">
            {formatTimeAgo(notification.createdAt)}
          </span>
          {notification.link && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Ouvrir
              <ChevronRight className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── État vide ───
function EmptyNotifications({ filter }: { filter: FilterType }) {
  const messages: Record<FilterType, { title: string; subtitle: string }> = {
    all: { title: 'Aucune notification', subtitle: 'Vous êtes à jour !' },
    unread: {
      title: 'Aucune notification non lue',
      subtitle: 'Tout est déjà traité',
    },
    info: { title: 'Aucune information', subtitle: 'Rien à signaler' },
    success: {
      title: 'Aucun succès',
      subtitle: 'Les bonnes nouvelles arrivent bientôt',
    },
    warning: { title: 'Aucun avertissement', subtitle: 'Tout va bien' },
    error: { title: 'Aucune erreur', subtitle: 'Aucun problème détecté' },
  };

  const msg = messages[filter] || messages.all;
  const isPositive = filter === 'all' || filter === 'unread';

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-4"
      >
        {isPositive ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5">
            <CheckCheck className="h-8 w-8 text-emerald-500" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted ring-4 ring-muted/50">
            <BellOff className="h-8 w-8 text-muted-foreground/60" />
          </div>
        )}
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-400 opacity-70" />
      </motion.div>

      <p className="text-sm font-semibold text-foreground">{msg.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{msg.subtitle}</p>
    </div>
  );
}