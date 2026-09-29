// src/components/admin/NotificationsPanel.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotificationStore } from '@/store/notification.store';
import { dashboard } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSocket } from '@/contexts/SocketContext';
import { showNotificationToast } from '@/lib/notification-utils';

export function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setNotifications,
    addNotification,
    isLoading,
    setLoading,
  } = useNotificationStore();

  const { socket, isConnected } = useSocket();

  // ─── Chargement initial ──────────────────────────────────
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await dashboard.getNotifications();
        const data = response?.data?.data || response?.data || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
        toast.error('Impossible de charger les notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [setNotifications, setLoading]);

  // ─── Écoute des notifications en temps réel ──────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data: any) => {
      addNotification(data);
      // Toast professionnel
      showNotificationToast({
        title: data.title || 'Nouvelle notification',
        message: data.message,
        link: data.link,
        icon: '🔔',
      });
    };

    const handleUnreadCount = (data: { count: number }) => {
      // Le store gère déjà le compteur via addNotification
    };

    socket.on('notification:receive', handleNewNotification);
    socket.on('notification:count', handleUnreadCount);

    return () => {
      socket.off('notification:receive', handleNewNotification);
      socket.off('notification:count', handleUnreadCount);
    };
  }, [socket, isConnected, addNotification]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleMarkAsRead = async (id: string) => {
    try {
      await dashboard.markNotificationAsRead(id);
      markAsRead(id);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dashboard.markAllNotificationsAsRead();
      markAllAsRead();
      toast.success('Toutes les notifications ont été lues');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-ubuntu text-lg">
          <Bell className="h-4 w-4 text-secondary" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <Badge variant="outline" className="ml-1 h-5 text-[10px] text-muted-foreground">
              Hors ligne
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={handleMarkAllAsRead}>
            <Check className="h-3 w-3" />
            Tout lire
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-1">
              <AnimatePresence>
                {notifications.slice(0, 20).map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'group flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer',
                      !notif.isRead ? 'bg-secondary/5 hover:bg-secondary/10' : 'hover:bg-muted/50'
                    )}
                    onClick={() => {
                      if (!notif.isRead) handleMarkAsRead(notif.id);
                      if (notif.link) window.location.href = notif.link;
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                        {!notif.isRead && <span className="h-2 w-2 rounded-full bg-destructive" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {typeof notif.message === 'string' ? notif.message : 'Nouvelle notification'}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(notif.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}