'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { PaymentSuccess } from '../components/PaymentSuccess';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const paymentId = searchParams.get('id');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setError('Aucune référence de paiement trouvée.');
        setLoading(false);
        return;
      }

      try {
        // On vérifie le statut du paiement
        const response = await payments.getById(paymentId);
        const data = response?.data?.data || response?.data;
        setPaymentData(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Erreur vérification paiement:', error);
        setError('Impossible de vérifier le statut du paiement.');
        setLoading(false);
        toast.error('Erreur lors de la vérification');
      }
    };

    if (status === 'success') {
      verifyPayment();
    } else {
      setError('Le paiement n\'a pas été validé.');
      setLoading(false);
    }
  }, [paymentId, status]);

  if (loading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (error || !paymentData) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-xl text-center">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8">
            <h2 className="text-2xl font-bold text-destructive">Paiement non confirmé</h2>
            <p className="mt-2 text-muted-foreground">{error || 'Une erreur est survenue.'}</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <PaymentSuccess payment={paymentData} />
      </div>
    </PageTransition>
  );
}