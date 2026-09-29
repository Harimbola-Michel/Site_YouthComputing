// src/hooks/useY2CStats.ts
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Y2CStats {
  members: number;
  events: number;
  certifications: number;
  projects: number;
}

const defaultStats: Y2CStats = {
  members: 0,
  events: 0,
  certifications: 0,
  projects: 0,
};

export function useY2CStats() {
  const [stats, setStats] = useState<Y2CStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Endpoints réels (adaptez selon votre API)
        // Si certains endpoints n'existent pas, on les ignore avec fallback
        const [membersRes, eventsRes] = await Promise.all([
          api.get('/y2c/members/stats').catch(() => ({ data: { data: { total: 0 } } })),
          api.get('/y2c/events/stats').catch(() => ({ data: { data: { total: 0 } } })),
        ]);

        // Extraction robuste
        const extractTotal = (res: any) => {
          return res?.data?.data?.total ?? res?.data?.total ?? 0;
        };

        // Pour certifications et projets, on utilise des valeurs par défaut (ou vous pouvez créer les endpoints)
        setStats({
          members: extractTotal(membersRes),
          events: extractTotal(eventsRes),
          certifications: 0, // à remplacer par un vrai endpoint si disponible
          projects: 0,       // idem
        });
      } catch (err) {
        console.error('Erreur chargement stats Y2C:', err);
        setError('Impossible de charger les statistiques');
        // Pas de toast pour éviter de spammer
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}