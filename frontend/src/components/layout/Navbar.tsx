// src/components/layout/Navbar.tsx
'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, Settings, LogOut, LayoutDashboard, ChevronDown,
  UserCircle, Shield, HelpCircle, CreditCard, CheckCheck, Inbox,
  Info, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  guestNavigation,
  publicNavigation,
  getAdminNavByRole,
} from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { usePublicSettings } from '@/hooks/usePublicSettings';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { showNotificationToast } from '@/lib/notification-utils';

/* ============================================================
 *  CONFIG
 * ============================================================ */
const NOTIF_TYPES: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; dot: string }
> = {
  info:    { icon: Info,          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',       dot: 'bg-blue-500' },
  success: { icon: CheckCircle2,  color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  warning: { icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',     dot: 'bg-amber-500' },
  error:   { icon: XCircle,       color: 'bg-red-500/10 text-red-600 dark:text-red-400',           dot: 'bg-red-500' },
};

/* Valeurs par défaut (avant chargement des settings) */
const DEFAULT_NAVBAR = {
  logoUrl: '/images/Youth Computing.png',
  logoAlt: 'Youth Computing',
  brandPrimary: 'Youth',
  brandSecondary: 'Computing',
  navItems: [] as { label: string; href: string }[],
  showThemeToggle: true,
  showNotifications: true,
  showAuthButtons: true,
  ctaLabel: "S'inscrire",
  ctaHref: '/inscription',
};

/* ============================================================
 *  HELPERS
 * ============================================================ */
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

/* ============================================================
 *  COMPOSANT
 * ============================================================ */
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    notifications, unreadCount, markAsRead, markAllAsRead,
    addNotification, setUnreadCount, clearNotifications,
  } = useNotificationStore();

  const { socket, isConnected } = useSocket();
  const { settings: publicSettings } = usePublicSettings();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  /* ─── Navbar config fusionnée avec les défauts ─── */
  const navbar = useMemo(() => {
    const db = publicSettings?.navbar ?? {};
    return {
      logoUrl: db.logoUrl || DEFAULT_NAVBAR.logoUrl,
      logoAlt: db.logoAlt || DEFAULT_NAVBAR.logoAlt,
      brandPrimary: db.brandPrimary || DEFAULT_NAVBAR.brandPrimary,
      brandSecondary: db.brandSecondary || DEFAULT_NAVBAR.brandSecondary,
      navItems:
        Array.isArray(db.navItems) && db.navItems.length > 0
          ? db.navItems
          : DEFAULT_NAVBAR.navItems,
      showThemeToggle: db.showThemeToggle ?? DEFAULT_NAVBAR.showThemeToggle,
      showNotifications: db.showNotifications ?? DEFAULT_NAVBAR.showNotifications,
      showAuthButtons: db.showAuthButtons ?? DEFAULT_NAVBAR.showAuthButtons,
      ctaLabel: db.ctaLabel || DEFAULT_NAVBAR.ctaLabel,
      ctaHref: db.ctaHref || DEFAULT_NAVBAR.ctaHref,
    };
  }, [publicSettings?.navbar]);

  const safeNotifications = useMemo(
    () => asArray<any>(notifications),
    [notifications]
  );

  /* ─── Navigation : settings > config statique ─── */
  const navItems = useMemo(() => {
    if (navbar.navItems.length > 0) return navbar.navItems;

    const base = isAuthenticated
      ? Array.isArray(publicNavigation) ? publicNavigation : []
      : Array.isArray(guestNavigation) ? guestNavigation : [];

    const items = [...base];
    if (!items.some((i) => i.href === '/recrutements'))
      items.push({ href: '/recrutements', label: 'Recrutement' });
    if (!items.some((i) => i.href === '/partenaires'))
      items.push({ href: '/partenaires', label: 'Partenaires' });
    return items;
  }, [navbar.navItems, isAuthenticated]);

  const adminItems = useMemo(() => {
    if (isAuthenticated && user) return getAdminNavByRole(user.role) || [];
    return [];
  }, [isAuthenticated, user]);

  /* ─── Chargement notifications ─── */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setNotifError(null);
      const response = await api.get('/notifications/my-notifications');
      const data = response.data?.data ?? response.data;
      const notifs = asArray<any>(data);

      clearNotifications();
      notifs.forEach((n: any) => addNotification(n));
      setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
    } catch (error: any) {
      console.error('Erreur chargement notifications:', error);
      setNotifError(error?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification, setUnreadCount, clearNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ─── Socket ─── */
  const notificationsRef = useRef(safeNotifications);
  useEffect(() => {
    notificationsRef.current = safeNotifications;
  }, [safeNotifications]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNew = (data: any) => {
      if (!data?.id) return;
      if (notificationsRef.current.some((n) => n.id === data.id)) return;
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

    socket.on('notification:receive', handleNew);
    socket.on('notification:count', handleCount);
    return () => {
      socket.off('notification:receive', handleNew);
      socket.off('notification:count', handleCount);
    };
  }, [socket, isConnected, addNotification, setUnreadCount]);

  /* ─── Scroll ─── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Actions ─── */
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await api.put(`/notifications/${id}/read`);
        markAsRead(id);
      } catch (e) {
        console.error(e);
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      markAllAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch {
      toast.error('Erreur lors du marquage');
    }
  }, [markAllAsRead]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      clearNotifications();
      router.push('/');
      router.refresh();
      toast.success('Déconnexion réussie 👋');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  }, [logout, router, clearNotifications]);

  /* ─── Utils ─── */
  const initials = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }, [user?.firstName, user?.lastName]);

  const fullName = useMemo(() => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`.trim();
    return 'Utilisateur';
  }, [user?.firstName, user?.lastName]);

  /* ═══════════════════════════════════════════════════════════
   *  RENDER
   * ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-out',
          isScrolled
            ? 'bg-background/80 shadow-lg backdrop-blur-xl dark:bg-background/70'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ═══════ LOGO dynamique ═══════ */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-1"
            >
              {navbar.logoUrl && (
                <Image
                  src={navbar.logoUrl}
                  alt={navbar.logoAlt}
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                />
              )}
            </motion.div>
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="hidden text-xl font-extrabold tracking-tight sm:block"
            >
              <span className="text-primary">{navbar.brandPrimary}</span>
              <span className="text-secondary">{navbar.brandSecondary}</span>
            </motion.span>
          </Link>

          {/* ═══════ NAV DESKTOP ═══════ */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-secondary/10 hover:text-secondary',
                    isActive ? 'bg-secondary/10 text-secondary' : 'text-foreground/80'
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-1/2 -translate-x-1/2 rounded-full bg-secondary"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Menu Admin */}
            {adminItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-1 rounded-full px-4 py-2 text-sm font-medium"
                  >
                    Admin <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl border border-border/50 bg-background/95 p-2 shadow-xl backdrop-blur-md">
                  {adminItems.map((item) => {
                    if (item.children) {
                      return (
                        <DropdownMenuGroup key={item.label}>
                          <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            {item.label}
                          </DropdownMenuLabel>
                          {item.children.map((child) => (
                            <DropdownMenuItem
                              key={child.href}
                              onClick={() => router.push(child.href)}
                              className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                            >
                              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                              {child.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="my-1" />
                        </DropdownMenuGroup>
                      );
                    }
                    return (
                      <DropdownMenuItem
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-secondary/10"
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* ═══════ ACTIONS DROITE ═══════ */}
          <div className="flex items-center gap-2 sm:gap-3">
            {navbar.showThemeToggle && (
              <ThemeToggle variant="ghost" size="icon" className="rounded-full" />
            )}

            {/* Notifications */}
            {isAuthenticated && navbar.showNotifications && (
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
                  <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'ml-1 h-2 w-2 rounded-full',
                          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        )}
                        title={isConnected ? 'Temps réel' : 'Hors ligne'}
                      />
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
                        <p className="text-sm font-medium">Erreur de chargement</p>
                        <p className="mt-1 text-xs text-muted-foreground">{notifError}</p>
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
                            const typeConfig = NOTIF_TYPES[type] || NOTIF_TYPES.info;
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
                                {!notif.isRead && (
                                  <span
                                    className={cn(
                                      'absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full',
                                      typeConfig.dot
                                    )}
                                  />
                                )}
                                <div
                                  className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-background',
                                    typeConfig.color
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
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
                                    {new Date(notif.createdAt).toLocaleString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
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
            )}

            {/* Profil */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 gap-2 rounded-full px-2 hover:bg-secondary/10"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage
                        src={user.avatar ? buildImageUrl(user.avatar, false) : undefined}
                        alt={fullName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-bold text-secondary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium lg:inline-block">
                      {user.firstName}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-2xl border border-border/50 bg-background/95 p-2 shadow-2xl backdrop-blur-md"
                >
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 w-fit text-[10px] uppercase"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                      <DropdownMenuItem
                        onClick={() => router.push('/admin/dashboard')}
                        className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/paiements')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Mes paiements
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/notifications')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
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
                    <DropdownMenuItem
                      onClick={() => router.push('/admin/parametres')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/security')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Sécurité
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/aide')}
                      className="cursor-pointer rounded-lg px-3 py-2 hover:bg-secondary/10"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Aide
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg px-3 py-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : navbar.showAuthButtons ? (
              <div className="hidden items-center gap-3 md:flex">
                <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 text-white shadow-md transition-all hover:shadow-lg"
                >
                  <Link href={navbar.ctaHref}>{navbar.ctaLabel}</Link>
                </Button>
              </div>
            ) : null}

            {/* Bouton mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        adminItems={adminItems}
      />
    </>
  );
}