'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  X,
  Mail,
  Calendar,
  CreditCard,
  Users,
  AlertCircle,
  MessageSquare,
  Star,
  Clock,
  Loader2,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: 'REGISTRATION' | 'PAYMENT' | 'EVENT' | 'SYSTEM' | 'PROMOTION' | 'REMINDER';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Configuration des types ──────────────────────────────────
const notificationConfig: Record<
  Notification['type'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  REGISTRATION: {
    icon: <Users className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    label: 'Inscription',
  },
  PAYMENT: {
    icon: <CreditCard className="h-4 w-4" />,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    label: 'Paiement',
  },
  EVENT: {
    icon: <Calendar className="h-4 w-4" />,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    label: 'Événement',
  },
  SYSTEM: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    label: 'Système',
  },
  PROMOTION: {
    icon: <Star className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'Promotion',
  },
  REMINDER: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    label: 'Rappel',
  },
};

// ─── Composant NotificationItem ───────────────────────────────
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isSelected,
  onSelect,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const config = notificationConfig[notification.type] || notificationConfig.SYSTEM;
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-md',
        !notification.isRead && 'border-secondary/30 bg-secondary/5',
        isSelected && 'ring-2 ring-secondary'
      )}
      onClick={handleClick}
    >
      {/* Checkbox de sélection */}
      <div
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border border-muted-foreground/30 transition-colors hover:border-secondary"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(notification.id);
        }}
      >
        {isSelected && <Check className="h-3.5 w-3.5 text-secondary" />}
      </div>

      {/* Icône */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border',
          config.color
        )}
      >
        {config.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.isRead && (
              <span className="inline-block h-2 w-2 rounded-full bg-secondary animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                title="Marquer comme lu"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              title="Supprimer"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Badge variant="secondary" className="text-xs">
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Composant Skeleton ──────────────────────────────────────
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
    setUnreadCount,
  } = useNotificationStore();
  const { socket, isConnected } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMarkAllDialogOpen, setIsMarkAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // ─── Chargement initial ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get('/notifications');
      const data = response.data?.data || response.data || [];
      const notifs = Array.isArray(data) ? data : [];
      notifs.forEach((notif: any) => addNotification(notif));
      const unread = notifs.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      toast.error('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, addNotification, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Socket.io ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data: any) => {
      addNotification(data);
      toast.success(data.title || 'Nouvelle notification', {
        duration: 5000,
        icon: '🔔',
      });
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    socket.on('notification:receive', handleNewNotification);
    socket.on('notification:count', handleUnreadCount);

    return () => {
      socket.off('notification:receive', handleNewNotification);
      socket.off('notification:count', handleUnreadCount);
    };
  }, [socket, isConnected, addNotification, setUnreadCount]);

  // ─── Redirection si non authentifié ──────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/connexion');
    }
  }, [authLoading, isAuthenticated, router]);

  // ─── Filtrage ──────────────────────────────────────────────
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const filteredUnreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  // ─── Actions ──────────────────────────────────────────────
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      markAllAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues');
      setIsMarkAllDialogOpen(false);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      toast.error('Erreur lors du marquage');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      // Supprimer du store
      clearNotifications();
      await fetchNotifications();
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => api.delete(`/notifications/${id}`))
      );
      clearNotifications();
      await fetchNotifications();
      setSelectedIds(new Set());
      setIsDeleteDialogOpen(false);
      toast.success(`${selectedIds.size} notification(s) supprimée(s)`);
    } catch (error) {
      console.error('Erreur suppression en masse:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  // ─── Rendu ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <span className="ml-3 text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* ─── En-tête ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1 className="font-ubuntu text-3xl font-bold md:text-4xl">
              <span className="text-secondary">Notifications</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos notifications sont lues ✅'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsMarkAllDialogOpen(true)}
                >
                  <CheckCheck className="h-4 w-4" />
                  Tout marquer lu
                </Button>
              )}
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer ({selectedIds.size})
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* ─── Filtres ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="all" className="gap-1.5">
                Toutes
                <Badge variant="secondary" className="ml-1 text-xs">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-1.5">
                Non lues
                {filteredUnreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filteredUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="gap-1.5">
                Lues
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 ml-auto"
              onClick={toggleSelectAll}
            >
              <Check className="h-4 w-4" />
              {selectedIds.size === filteredNotifications.length
                ? 'Désélectionner tout'
                : 'Sélectionner tout'}
            </Button>
          )}
        </motion.div>

        {/* ─── Liste des notifications ───────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center"
          >
            <Bell className="h-16 w-16 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-xl font-semibold">Aucune notification</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Vous n&apos;avez pas encore de notifications. Revenez plus tard pour voir les mises à jour.
            </p>
          </motion.div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-3 text-lg font-semibold">
              {filter === 'unread'
                ? 'Aucune notification non lue'
                : filter === 'read'
                ? 'Aucune notification lue'
                : 'Aucune notification'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === 'unread'
                ? 'Toutes vos notifications ont été lues ✅'
                : filter === 'read'
                ? 'Vous n\'avez pas encore de notifications lues'
                : 'Aucune notification ne correspond à ce filtre'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  isSelected={selectedIds.has(notification.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Dialogs ────────────────────────────────────────── */}

        {/* Dialog : Marquer toutes comme lues */}
        <AlertDialog open={isMarkAllDialogOpen} onOpenChange={setIsMarkAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Marquer toutes comme lues</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action marquera toutes vos notifications ({unreadCount}) comme lues.
                Cette opération est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMarkingAll}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="bg-secondary hover:bg-secondary/90"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Marquer toutes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog : Supprimer sélection */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer les notifications</AlertDialogTitle>
              <AlertDialogDescription>
                Vous êtes sur le point de supprimer {selectedIds.size} notification
                {selectedIds.size > 1 ? 's' : ''}. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}