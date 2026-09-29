// src/components/layout/AdminHeader.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Search,
  ChevronDown,
  HelpCircle,
  UserCircle,
  Shield,
  CheckCheck,
  Trash2,
  Inbox,
  BellOff,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { cn, formatDate } from '@/lib/utils';
import { AdminSearchOverlay } from './AdminSearchOverlay';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { showNotificationToast } from '@/lib/notification-utils';
import { buildImageUrl } from '@/lib/imageUtils';

// ============================================================
// CONFIG
// ============================================================
const ROLE_STYLES: Record<string, { color: string; label: string }> = {
  SUPER_ADMIN: {
    color:
      'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400',
    label: 'Super Admin',
  },
  ADMIN: {
    color:
      'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400',
    label: 'Administrateur',
  },
  EDITOR: {
    color:
      'bg-amber-500/20 text-amber-600 dark:bg-amber-500/30 dark:text-amber-400',
    label: 'Éditeur',
  },
  CONTRIBUTOR: {
    color:
      'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400',
    label: 'Contributeur',
  },
  MEMBER: {
    color:
      'bg-gray-500/20 text-gray-600 dark:bg-gray-500/30 dark:text-gray-400',
    label: 'Membre',
  },
};

const NOTIF_TYPES: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    dot: string;
  }
> = {
  info: {
    icon: Info,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  success: {
    icon: CheckCircle2,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

// ============================================================
// HELPER — Garantit un tableau
// ============================================================
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const obj = value as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.notifications)) return obj.notifications;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}

// ============================================================
// COMPOSANT
// ============================================================
export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    setUnreadCount,
    clearNotifications,
  } = useNotificationStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [showScrolled, setShowScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  // ✅ Toujours un tableau
  const safeNotifications = useMemo(
    () => asArray<any>(notifications),
    [notifications]
  );

  const role = user?.role || 'MEMBER';
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.MEMBER;

  const initials = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }, [user?.firstName, user?.lastName]);

  const fullName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Utilisateur';
  }, [user?.firstName, user?.lastName]);

  // ─── Chargement notifications ───
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setNotifError(null);

      const [listRes, countRes] = await Promise.all([
        api.get('/notifications/my-notifications?limit=50'),
        api.get('/notifications/unread-count').catch(() => ({ data: {} })),
      ]);

      const payload = listRes.data?.data ?? listRes.data;
      const notifs = asArray<any>(payload);

      clearNotifications();
      notifs.forEach((n: any) => addNotification(n));

      const unreadFromApi =
        countRes.data?.data?.count ??
        (payload as any)?.unreadCount;
      const unread =
        typeof unreadFromApi === 'number'
          ? unreadFromApi
          : notifs.filter((n: any) => !n.isRead).length;

      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error);
      setNotifError(
        error?.response?.data?.message || 'Erreur de chargement'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, addNotification, setUnreadCount, clearNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Socket.IO (deps stables) ───
  const notificationsRef = useRef(safeNotifications);
  useEffect(() => {
    notificationsRef.current = safeNotifications;
  }, [safeNotifications]);

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    socket.emit('room:join', { room: `user:${user.id}` });

    const handleNew = (data: any) => {
      if (!data?.id) return;
      const exists = notificationsRef.current.some((n) => n.id === data.id);
      if (exists) return;

      addNotification(data);
      showNotificationToast({
        title: data.title || 'Nouvelle notification',
        message: data.message,
        link: data.link,
        icon: '🔔',
      });
    };

    const handleCount = (data: { count: number }) => {
      if (typeof data?.count === 'number') setUnreadCount(data.count);
    };

    socket.on('new-notification', handleNew);
    socket.on('notification:receive', handleNew);
    socket.on('unread-count-update', handleCount);
    socket.on('notification:count', handleCount);

    return () => {
      socket.off('new-notification', handleNew);
      socket.off('notification:receive', handleNew);
      socket.off('unread-count-update', handleCount);
      socket.off('notification:count', handleCount);
    };
    // ✅ Pas de `notifications` dans les deps (utilise ref)
  }, [socket, isConnected, user?.id, addNotification, setUnreadCount]);

  // ─── Scroll ───
  useEffect(() => {
    const handleScroll = () => setShowScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Raccourci clavier ⌘K ───
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ─── Actions ───
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await api.put(`/notifications/${id}/read`);
        markAsRead(id);
      } catch (error) {
        console.error('Erreur marquage notification:', error);
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      markAllAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du marquage');
    }
  }, [markAllAsRead]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/connexion');
    toast.success('Déconnexion réussie');
  }, [logout, router]);

  if (!user) return null;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          showScrolled
            ? 'border-b bg-background/95 backdrop-blur-xl shadow-sm'
            : 'border-b bg-background/80 backdrop-blur-md'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* ═══════ LOGO + RECHERCHE ═══════ */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="group flex items-center gap-2.5"
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                <Image
                  src="/images/Youth Computing.png"
                  alt="Youth Computing"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden text-lg font-semibold text-foreground sm:inline-block">
                Youth <span className="text-secondary">Computing</span>
              </span>
              <Badge
                variant="outline"
                className="ml-1 hidden h-5 text-[10px] uppercase md:inline-flex"
              >
                Admin
              </Badge>
            </Link>

            <Button
              variant="ghost"
              className="hidden h-9 w-48 justify-start gap-2 rounded-full border border-border/50 bg-muted/50 text-sm text-muted-foreground hover:bg-muted/70 md:flex lg:w-64"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Rechercher...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* ═══════ ACTIONS DROITE ═══════ */}
          <div className="flex items-center gap-1.5">
            {/* Statut Live */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'hidden items-center gap-1.5 rounded-full border px-2 py-1 sm:flex',
                      isConnected
                        ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/40'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
                    )}
                  >
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-500" />
                    )}
                    <span className="relative flex h-2 w-2">
                      {isConnected && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      )}
                      <span
                        className={cn(
                          'relative inline-flex h-2 w-2 rounded-full',
                          isConnected ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        isConnected
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {isConnected ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {isConnected
                      ? 'Connecté en temps réel'
                      : 'Reconnexion en cours...'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ThemeToggle variant="ghost" size="icon" className="hidden sm:flex" />

            {/* ═══════ NOTIFICATIONS ═══════ */}
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                  aria-label={`Notifications ${
                    unreadCount > 0 ? `(${unreadCount} non lues)` : ''
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-lg"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-80 overflow-hidden rounded-2xl border-border/60 p-0 shadow-2xl sm:w-96"
                align="end"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-[10px] font-bold"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCheck className="h-3 w-3" />
                      Tout lire
                    </Button>
                  )}
                </div>

                {/* Body */}
                <ScrollArea className="max-h-[400px]">
                  {isLoading ? (
                    <div className="space-y-3 p-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifError ? (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                        <XCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Erreur de chargement
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notifError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => fetchNotifications()}
                      >
                        Réessayer
                      </Button>
                    </div>
                  ) : safeNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5">
                        <CheckCheck className="h-7 w-7 text-emerald-500" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Aucune notification
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vous êtes à jour !
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      <AnimatePresence initial={false}>
                        {safeNotifications.slice(0, 20).map((notif, i) => {
                          const type = notif.type || 'info';
                          const typeConfig =
                            NOTIF_TYPES[type] || NOTIF_TYPES.info;
                          const Icon = typeConfig.icon;

                          return (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className={cn(
                                'group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors',
                                !notif.isRead
                                  ? 'bg-secondary/5 hover:bg-secondary/10'
                                  : 'hover:bg-muted/40'
                              )}
                              onClick={() => {
                                if (!notif.isRead) handleMarkAsRead(notif.id);
                                if (notif.link) {
                                  router.push(notif.link);
                                  setIsNotificationOpen(false);
                                }
                              }}
                            >
                              {/* Barre d'accent */}
                              {!notif.isRead && (
                                <span
                                  className={cn(
                                    'absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full',
                                    typeConfig.dot
                                  )}
                                />
                              )}

                              {/* Icône */}
                              <div
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-background',
                                  typeConfig.color
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              {/* Contenu */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    'truncate text-sm leading-tight',
                                    !notif.isRead
                                      ? 'font-semibold text-foreground'
                                      : 'font-medium text-foreground/90'
                                  )}
                                >
                                  {notif.title}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                  {notif.message}
                                </p>
                                <p className="mt-1 text-[10px] font-medium text-muted-foreground/70">
                                  {formatDate(notif.createdAt)}
                                </p>
                              </div>

                              {/* Dot non lu */}
                              {!notif.isRead && (
                                <span
                                  className={cn(
                                    'mt-1 h-2 w-2 shrink-0 rounded-full ring-2 ring-background',
                                    typeConfig.dot
                                  )}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                {safeNotifications.length > 0 && (
                  <div className="border-t border-border/50 bg-muted/20 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center gap-2 text-xs"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        router.push('/admin/notifications');
                      }}
                    >
                      <Inbox className="h-3 w-3" />
                      Voir toutes les notifications
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* ═══════ PROFIL ═══════ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 gap-2 rounded-full px-2 transition-all hover:bg-muted"
                >
                  <Avatar className="h-8 w-8 shadow-md ring-2 ring-background">
                    <AvatarImage
                      src={user.avatar ? buildImageUrl(user.avatar, false) : undefined}
                      alt={fullName}
                    />
                    <AvatarFallback className="bg-secondary/10 text-xs font-medium text-secondary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block">
                    {user.firstName}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          user.avatar ? buildImageUrl(user.avatar, false) : undefined
                        }
                        alt={fullName}
                      />
                      <AvatarFallback className="bg-secondary/10 text-lg text-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge
                        className={cn('w-fit text-[10px] uppercase', roleStyle.color)}
                      >
                        {roleStyle.label}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="ml-auto text-[10px]" variant="secondary">
                        {unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/admin/parametres')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/security')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Sécurité
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/aide')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Aide
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AdminSearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}