import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await auth.login(email, password);
          const { user, accessToken, refreshToken } = response.data.data;
          
          set({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Connexion réussie !');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Erreur de connexion');
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await auth.register(data);
          const { user, accessToken, refreshToken } = response.data.data;
          
          set({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Inscription réussie !');
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Erreur d'inscription");
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await auth.logout();
        } catch (error) {
          // Ignorer les erreurs de déconnexion
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
          toast.success('Déconnexion réussie');
          window.location.href = '/';
        }
      },

      refreshUser: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await auth.me();
          set({
            user: response.data.data,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens, isAuthenticated: true });
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);