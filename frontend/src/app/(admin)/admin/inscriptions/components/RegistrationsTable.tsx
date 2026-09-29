'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatDate, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Trash2,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  GraduationCap,
  Filter,
  Download,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// ─── Configuration des statuts ──────────────────────────────
const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; badgeColor: string }
> = {
  PENDING: {
    label: 'En attente',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400',
    badgeColor: 'bg-yellow-500',
  },
  CONFIRMED: {
    label: 'Confirmée',
    icon: <CheckCircle className="h-3 w-3" />,
    color: 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400',
    badgeColor: 'bg-green-500',
  },
  CANCELLED: {
    label: 'Annulée',
    icon: <XCircle className="h-3 w-3" />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
    badgeColor: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Terminée',
    icon: <Check className="h-3 w-3" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    badgeColor: 'bg-blue-500',
  },
  WAITING_LIST: {
    label: "Liste d'attente",
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
    badgeColor: 'bg-purple-500',
  },
};

const paymentConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  PENDING: {
    label: 'En attente',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  PAID: {
    label: 'Payé',
    icon: <CheckCircle className="h-3 w-3" />,
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  FAILED: {
    label: 'Échoué',
    icon: <XCircle className="h-3 w-3" />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  REFUNDED: {
    label: 'Remboursé',
    icon: <X className="h-3 w-3" />,
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  PARTIAL: {
    label: 'Partiel',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
};

// ─── Types ──────────────────────────────────────────────────
interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  paymentAmount?: number;
  createdAt: string;
  Formation?: { id: string; title: string };
  FormationSession?: { id: string; startDate: string; endDate: string; location: string };
}

interface RegistrationsTableProps {
  data: Registration[];
  loading?: boolean;
  onConfirm?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onView?: (id: string) => void;
  onExport?: () => void;
}

// ─── Composant principal ──────────────────────────────────
export function RegistrationsTable({
  data,
  loading = false,
  onConfirm,
  onCancel,
  onDelete,
  onView,
  onExport,
}: RegistrationsTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: string | null;
    action: 'confirm' | 'cancel' | 'delete';
  }>({ open: false, id: null, action: 'confirm' });

  // ─── Statistiques ────────────────────────────────────────
  const stats = useMemo(() => {
    const total = data.length;
    const pending = data.filter((r) => r.status === 'PENDING').length;
    const confirmed = data.filter((r) => r.status === 'CONFIRMED').length;
    const cancelled = data.filter((r) => r.status === 'CANCELLED').length;
    const paid = data.filter((r) => r.paymentStatus === 'PAID').length;
    const totalAmount = data.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);
    return { total, pending, confirmed, cancelled, paid, totalAmount };
  }, [data]);

  // ─── Données filtrées ─────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || r.paymentStatus === paymentFilter;
      const matchSearch =
        r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchPayment && matchSearch;
    });
  }, [data, statusFilter, paymentFilter, searchTerm]);

  const handleAction = async (id: string, action: 'confirm' | 'cancel' | 'delete') => {
    setActionLoading(id);
    try {
      if (action === 'confirm' && onConfirm) {
        await onConfirm(id);
        toast.success('Inscription confirmée ✅');
      } else if (action === 'cancel' && onCancel) {
        await onCancel(id);
        toast.success('Inscription annulée ❌');
      } else if (action === 'delete' && onDelete) {
        await onDelete(id);
        toast.success('Inscription supprimée 🗑️');
      }
      setConfirmDialog({ open: false, id: null, action: 'confirm' });
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de l\'action');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Colonnes ────────────────────────────────────────────
  const columns: ColumnDef<Registration>[] = [
    {
      id: 'fullName',
      header: 'Participant',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">
                {r.firstName} {r.lastName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{r.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{r.phone}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'formation',
      header: 'Formation',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <p className="font-medium flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-secondary" />
              {r.Formation?.title || 'N/A'}
            </p>
            {r.FormationSession && (
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(r.FormationSession.startDate)}
                  {r.FormationSession.endDate && ` → ${formatDate(r.FormationSession.endDate)}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {r.FormationSession.location}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Badge variant="secondary" className={cn('gap-1.5 font-medium', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'paymentStatus',
      header: 'Paiement',
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const config = paymentConfig[status] || paymentConfig.PENDING;
        return (
          <Badge variant="secondary" className={cn('gap-1.5 font-medium', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'paymentAmount',
      header: 'Montant',
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.paymentAmount && row.original.paymentAmount > 0
            ? `${row.original.paymentAmount.toLocaleString()} Ar`
            : '—'}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Inscription',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{formatDate(row.original.createdAt)}</p>
          <p className="text-xs text-muted-foreground">
            à {new Date(row.original.createdAt).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const r = row.original;
        const isLoading = actionLoading === r.id;
        const canConfirm = r.status !== 'CONFIRMED' && r.status !== 'CANCELLED' && r.status !== 'COMPLETED';
        const canCancel = r.status !== 'CANCELLED' && r.status !== 'COMPLETED';

        return (
          <div className="flex items-center gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onView(r.id)}
                title="Voir les détails"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canConfirm && onConfirm && (
                  <DropdownMenuItem
                    onClick={() => setConfirmDialog({ open: true, id: r.id, action: 'confirm' })}
                    className="gap-2 text-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                {canCancel && onCancel && (
                  <DropdownMenuItem
                    onClick={() => setConfirmDialog({ open: true, id: r.id, action: 'cancel' })}
                    className="gap-2 text-amber-600"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setConfirmDialog({ open: true, id: r.id, action: 'delete' })}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // ─── État de chargement ──────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // ─── Aucune donnée ───────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-semibold">Aucune inscription</h3>
        <p className="text-sm text-muted-foreground">
          Aucune inscription trouvée. Les inscriptions apparaîtront ici dès qu'elles seront créées.
        </p>
      </div>
    );
  }

  // ─── Rendu ───────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ─── En-tête avec statistiques ────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
              Total : {stats.total}
            </Badge>
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
              En attente : {stats.pending}
            </Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              Confirmées : {stats.confirmed}
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              Payées : {stats.paid}
            </Badge>
            {stats.totalAmount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <DollarSign className="h-3 w-3 mr-1" />
                {stats.totalAmount.toLocaleString()} Ar
              </Badge>
            )}
          </div>
        </div>
        {onExport && (
          <Button variant="outline" size="sm" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        )}
      </div>

      {/* ─── Filtres ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="PENDING" className="gap-1">
              En attente
              {stats.pending > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-600">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED" className="gap-1">
              Confirmées
              {stats.confirmed > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] bg-green-500/20 text-green-600">
                  {stats.confirmed}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="CANCELLED" className="gap-1">
              Annulées
              {stats.cancelled > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] bg-red-500/20 text-red-600">
                  {stats.cancelled}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Paiement
              {paymentFilter !== 'all' && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPaymentFilter('all')}>
              Tous
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('PAID')}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Payés
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('PENDING')}>
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              En attente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('FAILED')}>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Échoués
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('REFUNDED')}>
              <X className="h-4 w-4 mr-2 text-gray-500" />
              Remboursés
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ─── Tableau ────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="email"
        searchPlaceholder="Rechercher par email, nom ou prénom..."
      />

      {/* ─── Dialogue de confirmation ────────────────────── */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'confirm' && 'Confirmer l\'inscription'}
              {confirmDialog.action === 'cancel' && 'Annuler l\'inscription'}
              {confirmDialog.action === 'delete' && 'Supprimer l\'inscription'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'confirm' &&
                'Cette action confirmera l\'inscription. L\'utilisateur recevra une notification.'}
              {confirmDialog.action === 'cancel' &&
                'Cette action annulera l\'inscription. L\'utilisateur en sera informé.'}
              {confirmDialog.action === 'delete' &&
                'Cette action supprimera définitivement l\'inscription. Cette opération est irréversible.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDialog.id && handleAction(confirmDialog.id, confirmDialog.action)
              }
              disabled={!!actionLoading}
              className={
                confirmDialog.action === 'confirm'
                  ? 'bg-green-600 hover:bg-green-700'
                  : confirmDialog.action === 'cancel'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {actionLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Chargement...
                </>
              ) : confirmDialog.action === 'confirm' ? (
                'Confirmer'
              ) : confirmDialog.action === 'cancel' ? (
                'Annuler'
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}