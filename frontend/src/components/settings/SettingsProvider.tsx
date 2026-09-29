// src/components/settings/SettingsProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { refreshPublicSettings, broadcastSettingsChange } from '@/hooks/usePublicSettings';

interface SettingsContextType {
  settings: any;
  isLoading: boolean;
  refetch: () => Promise<void>;
  updateGroup: (group: string, data: any) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (group: string, data: any) => {
    try {
      await api.put(`/settings/group/${group}`, data);
      toast.success(`Paramètres "${group}" mis à jour ✅`);

      // 🔑 1) Recharge les settings admin
      await fetchSettings();

      // 🔑 2) Invalide le cache public → Navbar/Footer se mettent à jour
      await refreshPublicSettings();

      // 🔑 3) Prévient les autres onglets ouverts
      broadcastSettingsChange();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  const resetSettings = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) return;
    try {
      await api.post('/settings/reset');
      toast.success('Paramètres réinitialisés');
      await fetchSettings();
      await refreshPublicSettings();
      broadcastSettingsChange();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, refetch: fetchSettings, updateGroup, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}