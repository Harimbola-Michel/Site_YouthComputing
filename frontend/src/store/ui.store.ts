import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isMobile: boolean;
  isLoading: boolean;
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setLoading: (loading: boolean) => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      isMobile: false,
      isLoading: false,
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      toggleSidebar: () => {
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setIsMobile: (isMobile: boolean) => {
        set({ isMobile });
        if (isMobile) {
          set({ sidebarOpen: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      openModal: (type: string, data?: any) => {
        set({
          modal: {
            isOpen: true,
            type,
            data: data || null,
          },
        });
      },

      closeModal: () => {
        set({
          modal: {
            isOpen: false,
            type: null,
            data: null,
          },
        });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);