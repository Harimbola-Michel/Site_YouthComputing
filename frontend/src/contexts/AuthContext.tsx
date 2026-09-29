// src/contexts/AuthContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthTokens } from '@/types';
import { getTokens, setTokens as setTokensStorage, clearTokens } from '@/lib/auth-tokens';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);
  const isRefreshing = useRef(false);

  // ---- Fonctions ----
  const setTokens = useCallback((newTokens: AuthTokens) => {
    setTokensState(newTokens);
    setTokensStorage(newTokens);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokensState(null);
    clearTokens();
  }, []);

  const refreshUser = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      const response = await auth.getProfile();
      const userData = response.data?.data || response.data;
      if (userData) {
        setUser(userData);
        return userData;
      }
      throw new Error('No user data');
    } catch (error) {
      console.error('Refresh user error:', error);
      clearAuth();
      throw error;
    } finally {
      isRefreshing.current = false;
    }
  }, [clearAuth]);

  // ---- Effet d'initialisation ----
  useEffect(() => {
    setIsClient(true);
    const storedTokens = getTokens();
    if (storedTokens?.accessToken) {
      setTokensState(storedTokens);
      refreshUser()
        .catch(() => clearAuth())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Fonction de redirection selon le rôle ----
  const redirectUser = useCallback((userRole: string) => {
    const roleRoutes: Record<string, string> = {
      SUPER_ADMIN: '/admin/dashboard',
      ADMIN: '/admin/dashboard',
      EDITOR: '/admin/dashboard',
      CONTRIBUTOR: '/dashboard',
      VIEWER: '/',
    };
    const route = roleRoutes[userRole] || '/';
    router.push(route);
  }, [router]);

  // ---- Actions ----
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const data = response.data?.data || response.data;
      const { user: userData, accessToken, refreshToken } = data;
      if (!userData || !accessToken) throw new Error('Invalid login response');

      setTokens({ accessToken, refreshToken });
      setUser(userData);
      toast.success('Connexion réussie 🎉', { duration: 4000 });

      redirectUser(userData.role);
    } catch (error: any) {
      const status = error.response?.status;
      let message = error.response?.data?.message || 'Échec de la connexion';
      if (status === 429) {
        message = 'Trop de tentatives. Veuillez patienter.';
      } else if (status === 401) {
        message = 'Email ou mot de passe incorrect.';
      }
      toast.error(message, { duration: 4000 });
      throw error;
    }
  }, [setTokens, redirectUser]);

  const register = useCallback(async (data: any) => {
    try {
      const response = await auth.register(data);
      const result = response.data?.data || response.data;
      const { user: userData, accessToken, refreshToken } = result;
      if (!userData || !accessToken) throw new Error('Invalid registration response');

      setTokens({ accessToken, refreshToken });
      setUser(userData);
      toast.success('Inscription réussie 🎉', { duration: 4000 });
      redirectUser(userData.role);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Échec de l\'inscription';
      toast.error(message, { duration: 4000 });
      throw error;
    }
  }, [setTokens, redirectUser]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/');
      toast.success('Déconnexion réussie');
    }
  }, [clearAuth, router]);

  const updateUser = useCallback((updatedUser: User) => setUser(updatedUser), []);

  // ---- Permissions ----
  const isAdmin = useMemo(() => user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN', [user]);
  const isSuperAdmin = useMemo(() => user?.role === 'SUPER_ADMIN', [user]);
  const isEditor = useMemo(
    () => user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EDITOR',
    [user]
  );
  const isAuthenticated = !!user;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // Vérifier les permissions explicites si disponibles
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }
      // Sinon, basé sur les rôles
      if (permission.startsWith('admin:')) return isAdmin;
      if (permission.startsWith('editor:')) return isEditor;
      return false;
    },
    [user, isAdmin, isEditor]
  );

  const value = useMemo(
    () => ({
      user,
      tokens,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isEditor,
      hasPermission,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      setTokens,
      clearAuth,
    }),
    [
      user,
      tokens,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isEditor,
      hasPermission,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      setTokens,
      clearAuth,
    ]
  );

  if (!isClient) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthProvider;