'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { PaymentForm } from '../components/PaymentForm';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [amount, setAmount] = useState<number | null>(null);
  const [type, setType] = useState<'registration' | 'membership'>('registration');
  const [entityId, setEntityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const amountParam = searchParams.get('amount');
    const typeParam = searchParams.get('type');
    const idParam = searchParams.get('id');

    if (amountParam) {
      setAmount(parseFloat(amountParam));
    }
    if (typeParam === 'membership') {
      setType('membership');
    }
    if (idParam) {
      setEntityId(idParam);
    }
    setLoading(false);
  }, [searchParams]);

  if (authLoading || loading) {
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
        <div className="container mx-auto px-4 py-12 max-w-xl text-center">
          <h2 className="text-2xl font-bold">Veuillez vous connecter</h2>
          <p className="mt-2 text-muted-foreground">
            Vous devez être connecté pour effectuer un paiement.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/connexion?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
          >
            Se connecter
          </Button>
        </div>
      </PageTransition>
    );
  }

  if (!amount) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-xl text-center">
          <h2 className="text-2xl font-bold">Montant manquant</h2>
          <p className="mt-2 text-muted-foreground">
            Aucun montant n'a été spécifié pour ce paiement.
          </p>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="font-ubuntu text-3xl font-bold">
            Paiement
          </h1>
          <p className="text-muted-foreground">
            {type === 'registration'
              ? 'Inscription à une formation'
              : 'Adhésion à la communauté Y2C'}
          </p>
        </div>

        <PaymentForm
          amount={amount}
          type={type}
          entityId={entityId}
          onSuccess={() => router.push('/paiements/confirmation')}
        />
      </div>
    </PageTransition>
  );
}