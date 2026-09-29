'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface PaymentVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onSuccess: () => void;
}

export function PaymentVerification({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: PaymentVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'confirm' | 'fail' | 'refund') => {
    setIsLoading(true);
    try {
      if (action === 'confirm') {
        await payments.confirm(payment.id);
        toast.success('Paiement confirmé');
      } else if (action === 'fail') {
        await payments.fail(payment.id, { reason: 'Manuel' });
        toast.success('Paiement échoué');
      } else if (action === 'refund') {
        await payments.refund(payment.id);
        toast.success('Paiement remboursé');
      }
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’action';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vérification du paiement</DialogTitle>
          <DialogDescription>
            Détails du paiement <strong>{payment?.paymentReference}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-mono font-medium">{payment?.paymentReference}</p>
                </div>
                <PaymentStatusBadge status={payment?.status} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium">{payment?.amount} {payment?.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode</p>
                  <p className="font-medium">{payment?.paymentMethod}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium">{formatDate(payment?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payé le</p>
                  <p className="font-medium">{payment?.paidAt ? formatDate(payment.paidAt) : '—'}</p>
                </div>
              </div>
              {payment?.metadata && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Métadonnées</p>
                    <pre className="mt-1 rounded bg-muted/30 p-2 text-xs overflow-auto max-h-32">
                      {JSON.stringify(payment.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions selon le statut */}
          {payment?.status === 'PENDING' && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleAction('confirm')}
                disabled={isLoading}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Confirmer
              </Button>
              <Button
                onClick={() => handleAction('fail')}
                disabled={isLoading}
                variant="destructive"
                className="gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Échouer
              </Button>
            </div>
          )}

          {payment?.status === 'PAID' && (
            <Button
              onClick={() => handleAction('refund')}
              disabled={isLoading}
              variant="outline"
              className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Rembourser
            </Button>
          )}

          {payment?.status === 'FAILED' && (
            <p className="text-sm text-muted-foreground">
              Ce paiement a échoué. Aucune action supplémentaire n'est possible.
            </p>
          )}

          {payment?.status === 'REFUNDED' && (
            <p className="text-sm text-muted-foreground">
              Ce paiement a été remboursé.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}