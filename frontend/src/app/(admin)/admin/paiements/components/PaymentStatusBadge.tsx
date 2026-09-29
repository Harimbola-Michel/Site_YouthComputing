'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  PAID: { label: 'Payé', className: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  FAILED: { label: 'Échoué', className: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  REFUNDED: { label: 'Remboursé', className: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}