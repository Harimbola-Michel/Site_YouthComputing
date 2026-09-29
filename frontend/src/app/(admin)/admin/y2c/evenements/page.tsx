'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/shared/PageTransition';
import { EventsTable } from './components/EventsTable';
import { EventFormModal } from './components/EventFormModal';
import { y2c } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AdminY2CEventsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement des événements ──────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      const response = await y2c.getEvents();
      // ✅ Extraction robuste du tableau
      let eventsData = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];
      if (!Array.isArray(eventsData)) eventsData = [];
      setEvents(eventsData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      if (error.response?.status === 403) {
        toast.error('Accès interdit – vous devez être administrateur.');
        return;
      }
      console.error('❌ Erreur chargement événements :', error);
      const msg = error?.response?.data?.message || 'Impossible de charger les événements';
      setError(msg);
      toast.error(msg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
  }, [authLoading, fetchEvents]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    fetchEvents();
    toast.success(editingEvent ? 'Événement modifié ✅' : 'Événement créé 🎉');
  };

  const handleDelete = async (event) => {
    try {
      await y2c.deleteEvent(event.id);
      toast.success('Événement supprimé');
      await fetchEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Liste actualisée');
  };

  // ─── États de chargement / auth ──────────────────────────
  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Événements Y2C
            </h1>
            <p className="text-muted-foreground">
              Gérez les événements de la communauté Youth Computing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Actualisation...' : 'Rafraîchir'}
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvel événement
            </Button>
          </div>
        </div>

        {/* Affichage d’erreur */}
        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchEvents} className="ml-auto">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <EventsTable
          data={events}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={fetchEvents}
        />
      </div>

      <EventFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        event={editingEvent}
        onSuccess={handleSuccess}
      />
    </PageTransition>
  );
}