'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ExportOptions } from './components/ExportOptions';
import { ExportHistory } from './components/ExportHistory';
import { exports } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportHistoryItem } from '@/types/export.types';

export default function AdminExportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Chargement de l'historique ──────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setHistoryLoading(false);
      return;
    }
    try {
      setHistoryLoading(true);
      setError(null);
      const response = await exports.getHistory({ page: 1, limit: 50 });

      const data = response?.data?.data || response?.data || {};
      const items = data?.items || [];

      const formatted = items.map((item: any) => ({
        id: item.id,
        type: item.type?.toLowerCase() || 'unknown',
        format: item.format?.toLowerCase() || 'unknown',
        date: item.createdAt || item.completedAt || new Date().toISOString(),
        status: item.status === 'COMPLETED' ? 'completed' : 
                item.status === 'PROCESSING' ? 'pending' : 'failed',
        filename: item.fileName || `${item.type}.${item.format}`,
      }));

      setHistory(formatted);
      localStorage.setItem('exportHistory', JSON.stringify(formatted));
    } catch (err: any) {
      console.error('Erreur chargement historique:', err);
      setError(err?.message || 'Impossible de charger l’historique');

      const saved = localStorage.getItem('exportHistory');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          setHistory([]);
        }
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ─── Sauvegarde de l'historique ──────────────────────────
  const saveHistory = useCallback((newHistory: ExportHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('exportHistory', JSON.stringify(newHistory));
  }, []);

  // ─── Gestion des exports ──────────────────────────────────
  const handleExport = async (type: string, format: string) => {
    setLoading(true);
    try {
      const response = await exports.download(type, format, {});

      if (!response || !response.data) {
        throw new Error('Aucune donnée reçue');
      }

      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `${type}-${new Date().toISOString().slice(0,10)}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const newItem: ExportHistoryItem = {
        id: Date.now().toString(),
        type,
        format,
        date: new Date().toISOString(),
        status: 'completed',
        filename,
      };
      saveHistory([newItem, ...history]);

      toast.success(`Export ${type} en ${format.toUpperCase()} réussi ✅`);
    } catch (error: any) {
      console.error('Erreur export:', error);
      const msg = error?.response?.data?.message || error?.message || 'Erreur lors de l’export';
      toast.error(msg);

      const failedItem: ExportHistoryItem = {
        id: Date.now().toString(),
        type,
        format,
        date: new Date().toISOString(),
        status: 'failed',
      };
      saveHistory([failedItem, ...history]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Rafraîchir ───────────────────────────────────────────
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('✅ Historique actualisé');
  };

  // ─── Effacer l'historique ──────────────────────────────────
  const handleClearHistory = () => {
    if (confirm('Voulez-vous vraiment effacer tout l’historique des exports ?')) {
      saveHistory([]);
      toast.success('Historique effacé');
    }
  };

  // ─── Supprimer un élément ─────────────────────────────────
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // ─── États de chargement ──────────────────────────────────
  if (authLoading || historyLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Chargement des exports...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Veuillez vous connecter.</p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ──────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Exports
            </h1>
            <p className="text-muted-foreground">
              Exportez vos données aux formats CSV, Excel et PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Effacer
            </Button>
          </div>
        </div>

        {/* ─── Options d'export ────────────────────────────── */}
        <ExportOptions onExport={handleExport} loading={loading} />

        {/* ─── Historique ───────────────────────────────────── */}
        <ExportHistory
          history={history}
          onRefresh={handleRefresh}
          onDelete={handleDeleteHistoryItem}
          loading={isRefreshing}
        />
      </div>
    </PageTransition>
  );
}