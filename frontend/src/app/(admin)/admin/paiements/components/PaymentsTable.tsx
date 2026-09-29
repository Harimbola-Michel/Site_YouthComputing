'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Mail,
  Copy,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { PaymentStatusBadge } from './PaymentStatusBadge';

export interface Payment {
  id: string;
  registrationId?: string;
  y2cMemberId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  metadata?: any;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentsTableProps {
  data: Payment[];
  loading?: boolean;
  onVerify: (payment: Payment) => void;
  onRefresh?: () => void;
}

export function PaymentsTable({
  data,
  loading = false,
  onVerify,
  onRefresh,
}: PaymentsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (payment: Payment) => {
    setDeleteTarget(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await payments.delete(deleteTarget.id);
      toast.success('Paiement supprimé');
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Copier la référence
  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success('Référence copiée !');
  };

  // ✅ Envoyer le reçu par email
  const handleSendReceipt = async (payment: Payment) => {
    try {
      // Appel API pour envoyer le reçu – à adapter selon votre backend
      await payments.sendReceipt(payment.id);
      toast.success(`Reçu envoyé par email pour la référence ${payment.paymentReference} ✅`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’envoi du reçu';
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      id: 'paymentReference', // ✅ aligné avec searchKey
      accessorKey: 'paymentReference',
      header: 'Référence',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.original.paymentReference}</span>
          <button
            onClick={() => copyReference(row.original.paymentReference)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copier la référence"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {row.original.amount.toLocaleString()} {row.original.currency}
        </span>
      ),
    },
    {
      id: 'paymentMethod',
      accessorKey: 'paymentMethod',
      header: 'Méthode',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.paymentMethod}</span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
    {
      id: 'paidAt',
      accessorKey: 'paidAt',
      header: 'Payé le',
      cell: ({ row }) =>
        row.original.paidAt ? formatDate(row.original.paidAt) : '—',
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Créé le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onVerify(payment)}>
                <Eye className="h-4 w-4 mr-2" /> Vérifier
              </DropdownMenuItem>
              {/* ✅ Envoi du reçu par email */}
              <DropdownMenuItem onClick={() => handleSendReceipt(payment)}>
                <Mail className="h-4 w-4 mr-2" /> Envoyer le reçu
              </DropdownMenuItem>
              {payment.status === 'PENDING' && (
                <>
                  <DropdownMenuItem
                    onClick={async () => {
                      await payments.confirm(payment.id);
                      toast.success('Paiement confirmé');
                      onRefresh?.();
                    }}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirmer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await payments.fail(payment.id, { reason: 'Manuel' });
                      toast.success('Paiement échoué');
                      onRefresh?.();
                    }}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Échouer
                  </DropdownMenuItem>
                </>
              )}
              {payment.status === 'PAID' && (
                <DropdownMenuItem
                  onClick={async () => {
                    await payments.refund(payment.id);
                    toast.success('Paiement remboursé');
                    onRefresh?.();
                  }}
                  className="text-amber-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Rembourser
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(payment)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="paymentReference" // ✅ correspond à l'id de la colonne
        searchPlaceholder="Rechercher par référence..."
        loading={loading}
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le paiement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le paiement{' '}
              <strong>{deleteTarget?.paymentReference}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}