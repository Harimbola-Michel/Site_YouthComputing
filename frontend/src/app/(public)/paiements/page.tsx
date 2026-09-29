'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition } from '@/components/shared/PageTransition';
import { PaymentHistory } from './components/PaymentHistory';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentsHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const response = await payments.getMyPayments();
      const list = response?.data?.data ?? response?.data ?? [];
      setPaymentsData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('Erreur chargement paiements:', error);
      let message = 'Impossible de charger vos paiements.';

      // Détection d'erreur spécifique (ex: 500, 401, etc.)
      if (error.response?.status === 401) {
        message = 'Veuillez vous connecter pour voir vos paiements.';
        router.push('/connexion');
      } else if (error.response?.status === 500) {
        message =
          'Une erreur interne du serveur s’est produite. Nos équipes ont été notifiées. Veuillez réessayer plus tard.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      setError(message);
      toast.error(message);
      setPaymentsData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchPayments();
    }
  }, [authLoading, fetchPayments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayments();
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
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour consulter vos paiements.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight">
              Mes paiements
            </h1>
            <p className="text-muted-foreground">
              Consultez l’historique de vos paiements effectués.
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
            Rafraîchir
          </Button>
        </div>

        {/* Affichage de l’erreur (si présente) */}
        {error && (
          <Card className="mb-6 border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="mt-3 font-ubuntu text-lg font-semibold text-destructive">
                Oups, une erreur est survenue
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        <PaymentHistory payments={paymentsData} loading={loading} error={error} onRetry={handleRefresh} />
      </div>
    </PageTransition>
  );
}