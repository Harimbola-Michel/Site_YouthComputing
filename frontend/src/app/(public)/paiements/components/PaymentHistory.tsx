'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { PaymentStatusBadge } from '@/app/(admin)/admin/paiements/components/PaymentStatusBadge';
import {
  CreditCard,
  Calendar,
  Receipt,
  RefreshCw,
  AlertCircle,
  Wallet,
  Banknote,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  createdAt: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// ─── Composant ────────────────────────────────────────────
export function PaymentHistory({
  payments = [],
  loading = false,
  error = null,
  onRetry,
}: PaymentHistoryProps) {
  // Copier la référence de paiement
  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success('Référence copiée !');
  };

  // ─── Chargement ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Erreur ──────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-2 border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="mt-4 font-ubuntu text-lg font-semibold text-destructive">
            Erreur de chargement
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <Button variant="outline" className="mt-4 gap-2" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Aucun paiement ──────────────────────────────────────
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-ubuntu text-lg font-semibold">Aucun paiement</h3>
          <p className="text-muted-foreground">
            Vous n'avez effectué aucun paiement pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Liste ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <motion.div
          key={payment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="group hover:shadow-md transition-all duration-300 border border-border/50 hover:border-secondary/30">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium bg-muted/30 px-2 py-0.5 rounded flex items-center gap-1.5">
                    {payment.paymentReference}
                    <button
                      onClick={() => copyReference(payment.paymentReference)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Copier la référence"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    {payment.paymentMethod}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(payment.createdAt)}
                  </span>
                  {payment.paidAt && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Payé le {formatDate(payment.paidAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-lg tabular-nums">
                  {payment.amount.toLocaleString()} {payment.currency}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}