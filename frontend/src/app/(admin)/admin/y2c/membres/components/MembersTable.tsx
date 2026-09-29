// app/(admin)/admin/y2c/membres/components/MembersTable.tsx
'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Clock,
  RefreshCw,
  BadgeCheck,
  BadgeAlert,
  Phone,
  Copy,
  Receipt,
  CreditCard,
  // IdCard n'existe pas dans toutes les versions de lucide-react → on utilise UserIcon à la place
  Building,
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// ✅ Import nommé de DataTable (car exporté nommé)
import { DataTable } from '@/components/admin/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/user.types';
import { api } from '@/lib/api';
import { buildImageUrl } from '@/lib/imageUtils';

// ─── Types ────────────────────────────────────────────────────
export type Y2CMemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING';

export interface Y2CMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  institution?: string;
  membershipFeePaid?: number;
  badgeNumber?: string;
  status: Y2CMemberStatus;
  paymentReference?: string;
  paymentMethod?: string;
  amountPaid?: number;
  createdAt: string;
  updatedAt: string;
}

interface MemberWithAvatar extends Y2CMember {
  avatar?: string;
}

interface MembersTableProps {
  data: MemberWithAvatar[];
  loading?: boolean;
  onMemberUpdated?: () => void;
  onEdit: (member: MemberWithAvatar) => void;
  onDelete?: (member: MemberWithAvatar) => Promise<void>;
  onGenerateBadge?: (member: MemberWithAvatar) => Promise<void>;
}

// ─── Configuration des statuts ──────────────────────────────
const statusConfig: Record<
  Y2CMemberStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ACTIVE: {
    label: 'Actif',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  INACTIVE: {
    label: 'Inactif',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  EXPIRED: {
    label: 'Expiré',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  PENDING: {
    label: 'En attente',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

// ─── Composant principal ─────────────────────────────────────
export function MembersTable({
  data,
  loading = false,
  onMemberUpdated,
  onEdit,
  onDelete,
  onGenerateBadge,
}: MembersTableProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;

  const [deleteTarget, setDeleteTarget] = useState<MemberWithAvatar | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refetchMembers = () => {
    onMemberUpdated?.();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchMembers();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('✅ Liste actualisée');
  };

  // ─── Suppression ───────────────────────────────────────────
  const handleDelete = async (member: MemberWithAvatar) => {
    setDeleteTarget(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(deleteTarget);
      } else {
        await api.delete(`/y2c/members/${deleteTarget.id}`);
      }
      toast.success(`🗑️ ${deleteTarget.name} supprimé`);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      refetchMembers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Génération de badge ──────────────────────────────────
  const handleGenerateBadge = async (member: MemberWithAvatar) => {
    if (member.badgeNumber && member.badgeNumber.trim() !== '') {
      toast.info('Badge déjà généré');
      return;
    }
    setGeneratingId(member.id);
    try {
      if (onGenerateBadge) {
        await onGenerateBadge(member);
      } else {
        await api.post(`/y2c/members/${member.id}/generate-badge`);
      }
      toast.success(`✅ Badge généré pour ${member.name}`);
      refetchMembers();
    } catch (error) {
      toast.error('Erreur lors de la génération du badge');
    } finally {
      setGeneratingId(null);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('Numéro copié');
  };

  // ─── Définition des colonnes ──────────────────────────────
  const columns: ColumnDef<MemberWithAvatar>[] = [
    // 1. Membre (avatar + nom + email)
    {
      id: 'name',
      header: 'Membre',
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        const member = row.original;
        const initials = member.name
          .split(' ')
          .map((n) => n.charAt(0).toUpperCase())
          .join('');
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage src={member.avatar ? buildImageUrl(member.avatar, false) : undefined} alt={member.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/5 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.email}
              </p>
            </div>
          </div>
        );
      },
    },
    // 2. Téléphone (avec copie)
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Téléphone',
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (!phone) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm">{phone}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => copyPhone(phone)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    // 3. N° étudiant – on utilise UserIcon au lieu de IdCard (qui n'existe pas dans toutes les versions)
    {
      id: 'studentId',
      accessorKey: 'studentId',
      header: 'N° étudiant',
      cell: ({ row }) => {
        const id = row.original.studentId;
        return id ? (
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm">{id}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    // 4. Institution
    {
      id: 'institution',
      accessorKey: 'institution',
      header: 'Institution',
      cell: ({ row }) => {
        const inst = row.original.institution;
        return inst ? (
          <div className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{inst}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    // 5. Cotisation (membershipFeePaid)
    {
      id: 'membershipFeePaid',
      accessorKey: 'membershipFeePaid',
      header: 'Cotisation (Ar)',
      cell: ({ row }) => {
        const amount = row.original.membershipFeePaid;
        return amount !== undefined && amount > 0 ? (
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-sm">{amount.toLocaleString()} Ar</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">0 Ar</span>
        );
      },
    },
    // 6. Référence de paiement
    {
      id: 'paymentReference',
      accessorKey: 'paymentReference',
      header: 'Référence paiement',
      cell: ({ row }) => {
        const ref = row.original.paymentReference;
        if (!ref) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm">{ref}</span>
          </div>
        );
      },
    },
    // 7. Badge
    {
      id: 'badgeNumber',
      accessorKey: 'badgeNumber',
      header: 'Badge',
      cell: ({ row }) => {
        const member = row.original;
        const hasBadge = member.badgeNumber != null && member.badgeNumber.trim() !== '';
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1.5 font-medium text-[10px] uppercase px-2.5 py-1',
                    hasBadge
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  )}
                >
                  {hasBadge ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {member.badgeNumber}
                    </>
                  ) : (
                    <>
                      <BadgeAlert className="h-3.5 w-3.5" />
                      Non généré
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {hasBadge ? 'Badge actif' : 'Badge non encore généré'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    // 8. Statut
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Badge variant="outline" className={cn('gap-1.5 font-medium text-[10px] uppercase px-2.5 py-1', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    // 9. Date d'inscription
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Inscrit le',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    // 10. Actions (menu déroulant)
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const member = row.original;
        const isLoading = generatingId === member.id;
        const hasBadge = member.badgeNumber != null && member.badgeNumber.trim() !== '';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  {member.name}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onEdit(member)} className="gap-2">
                <Edit className="h-4 w-4 text-blue-500" />
                Modifier
              </DropdownMenuItem>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DropdownMenuItem
                        onClick={() => handleGenerateBadge(member)}
                        disabled={isLoading || hasBadge}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : hasBadge ? (
                          <BadgeCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <BadgeAlert className="h-4 w-4 text-amber-500" />
                        )}
                        {hasBadge ? 'Badge déjà généré' : 'Générer le badge'}
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>
                  {hasBadge && (
                    <TooltipContent side="left">
                      Ce membre possède déjà un badge
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDelete(member)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ─── Rendu ──────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Rechercher un membre..."
        loading={loading || isRefreshing}
        // addButtonLabel="Ajouter un membre"
        onAdd={() => {
          // Cette fonction sera appelée depuis le parent (via une prop)
          // On laisse le parent gérer l'ouverture du modal
        }}
        onRefresh={handleRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le membre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le membre{' '}
              <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}