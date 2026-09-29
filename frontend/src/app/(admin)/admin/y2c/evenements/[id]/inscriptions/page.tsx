'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageTransition } from '@/components/shared/PageTransition';
import { RegistrationsTable } from './components/RegistrationsTable';
import { y2c } from '@/lib/api';
import { extractDataArray } from '@/lib/api-helpers';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

export default function EventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [eventTitle, setEventTitle] = useState('');

  const fetchRegistrations = useCallback(async () => {
    if (!isAuthenticated || !eventId) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      setLoading(true);
      const [eventRes, registrationsRes] = await Promise.all([
        y2c.getEvent(eventId),
        y2c.getEventRegistrations(eventId),
      ]);

      const event = eventRes?.data?.data || eventRes?.data;
      setEventTitle(event?.title || 'Événement');

      const list = extractDataArray(registrationsRes?.data?.data ?? registrationsRes?.data, []);
      setData(list);
    } catch (err: any) {
      console.error('❌ Erreur chargement:', err);
      const msg = err?.response?.data?.message || 'Impossible de charger les inscriptions';
      setError(msg);
      toast.error(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, eventId]);

  useEffect(() => {
    if (!authLoading) fetchRegistrations();
  }, [authLoading, fetchRegistrations]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchRegistrations();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Liste actualisée');
  };

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
          <p className="text-lg text-muted-foreground">Veuillez vous connecter.</p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 gap-2">
              <Link href={`/admin/y2c/evenements/${eventId}`}>
                <ArrowLeft className="h-4 w-4" /> Retour à l'événement
              </Link>
            </Button>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Inscriptions – {eventTitle || 'Chargement...'}
            </h1>
            <p className="text-muted-foreground">
              Consultez et gérez les inscriptions pour cet événement.
            </p>
          </div>
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
        </div>

        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRegistrations} className="ml-auto">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <RegistrationsTable
          data={data}
          loading={loading}
          onRefresh={fetchRegistrations}
        />
      </div>
    </PageTransition>
  );
}