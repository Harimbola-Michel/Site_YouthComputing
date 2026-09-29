'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X } from 'lucide-react';
import Lottie from 'lottie-react';
import notificationAnimation from '../../../public/animations/notification.json';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/store/notification.store';
import { useSocket } from '@/contexts/SocketContext';
import { showNotificationToast } from '@/lib/notification-utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function LiveNotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } =
    useNotificationStore();
  const { socket, isConnected } = useSocket();

  // ─── Écoute des notifications Socket ──────────────────────
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data: Notification) => {
      addNotification(data);
      // Animation de la cloche
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
      // Toast professionnel
      showNotificationToast({
        title: data.title || 'Nouvelle notification',
        message: data.message,
        link: data.link,
        icon: '🔔',
      });
    };

    socket.on('notification:receive', handleNewNotification);
    socket.on('new-notification', handleNewNotification);
    socket.on('notification:count', (data: { unread?: number; count?: number }) => {
      const count = data.unread ?? data.count;
      if (typeof count === 'number') {
        useNotificationStore.getState().setUnreadCount(count);
      }
    });

    return () => {
      socket.off('notification:receive', handleNewNotification);
      socket.off('new-notification', handleNewNotification);
      socket.off('notification:count');
    };
  }, [socket, isConnected, addNotification]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          {isPlaying ? (
            <div className="h-6 w-6">
              <Lottie animationData={notificationAnimation} loop={false} />
            </div>
          ) : isConnected ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center px-1 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <span className="font-ubuntu font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-3 w-3" />
                Tout marquer
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/50',
                    !notif.isRead && 'bg-secondary/5'
                  )}
                  onClick={() => {
                    if (!notif.isRead) handleMarkAsRead(notif.id);
                    if (notif.link) {
                      window.location.href = notif.link;
                    }
                  }}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof notif.message === 'string' ? notif.message : 'Nouvelle notification'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Rediriger vers la page des notifications
                window.location.href = '/admin/notifications';
              }}
            >
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}