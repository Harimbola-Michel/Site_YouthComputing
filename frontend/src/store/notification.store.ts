import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      setUnreadCount: (count) => set({ unreadCount: count }),

      addNotification: (notification) => {
        set((state) => {
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) return state;
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      setNotifications: (notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);