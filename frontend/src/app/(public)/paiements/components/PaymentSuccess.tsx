'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Receipt, Copy, Home, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentSuccessProps {
  payment: {
    id: string;
    paymentReference: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
  };
}

export function PaymentSuccess({ payment }: PaymentSuccessProps) {
  const router = useRouter();

  const copyReference = () => {
    navigator.clipboard.writeText(payment.paymentReference);
    toast.success('Référence copiée !');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden">
        <CardHeader className="text-center border-b border-green-200/30 dark:border-green-800/30 pb-4">
          <CardTitle className="font-ubuntu text-2xl text-green-700 dark:text-green-400">
            Paiement confirmé ! ✅
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              Votre paiement a été enregistré avec succès.
            </p>
          </div>

          <div className="rounded-lg bg-background/50 p-4 space-y-2 text-sm border border-green-200/50 dark:border-green-800/30">
            <div className="flex justify-between items-center group">
              <span className="text-muted-foreground">Référence</span>
              <span className="font-mono font-medium flex items-center gap-2">
                {payment.paymentReference}
                <button
                  onClick={copyReference}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copier la référence"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">
                {payment.amount.toLocaleString()} {payment.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Méthode</span>
              <span className="font-medium">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(payment.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {payment.status === 'PAID' ? 'Payé' : 'En traitement'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => router.push('/paiements')}
            >
              <CreditCard className="h-4 w-4" />
              Voir mes paiements
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}