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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Eye, Trash2, FileText, Loader2, Mail } from 'lucide-react';
import { candidatures } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CandidatureStatusBadge } from './CandidatureStatusBadge';

export interface Candidature {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  status: string;
  notes?: string;
  recruitmentId: string;
  recruitment?: { title: string };
  createdAt: string;
  updatedAt: string;
}

interface CandidaturesTableProps {
  data: Candidature[];
  loading?: boolean;
  onViewDetails: (candidature: Candidature) => void;
  onRefresh?: () => void;
}

const STATUS_OPTIONS = [
  'PENDING',
  'REVIEWED',
  'SHORTLISTED',
  'INTERVIEWED',
  'ACCEPTED',
  'REJECTED',
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  REVIEWED: 'Révisé',
  SHORTLISTED: 'Présélectionné',
  INTERVIEWED: 'Entrevu',
  ACCEPTED: 'Accepté',
  REJECTED: 'Rejeté',
};

export function CandidaturesTable({
  data,
  loading = false,
  onViewDetails,
  onRefresh,
}: CandidaturesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Candidature | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleDeleteClick = (item: Candidature) => {
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await candidatures.delete(deleteTarget.id);
      toast.success('Candidature supprimée');
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await candidatures.update(id, { status });
      toast.success('Statut mis à jour');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const handleSendReport = async (candidature: Candidature) => {
    try {
      await candidatures.sendEvaluationReport(candidature.id);
      toast.success(`Rapport d’évaluation envoyé à ${candidature.fullName} ✅`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’envoi du rapport';
      toast.error(msg);
    }
  };

  const columns: ColumnDef<Candidature>[] = [
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: 'Candidat',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Téléphone',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span>,
    },
    {
      id: 'recruitment',
      accessorKey: 'recruitment.title',
      header: 'Offre',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.recruitment?.title || '—'}</span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <CandidatureStatusBadge status={row.original.status} />,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Reçue le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        const isUpdating = updating === item.id;
        return (
          <div className="flex items-center gap-2">
            <Select
              value={item.status}
              onValueChange={(val) => handleStatusChange(item.id, val)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Statut">
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_LABELS[item.status] || item.status}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewDetails(item)}>
                  <Eye className="h-4 w-4 mr-2" /> Détails
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const cvUrl = item.cvUrl.startsWith('http')
                      ? item.cvUrl
                      : `${window.location.origin}${item.cvUrl}`;
                    window.open(cvUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" /> Voir CV
                </DropdownMenuItem>
                {/* ✅ Envoyer le rapport d'évaluation */}
                <DropdownMenuItem
                  onClick={() => handleSendReport(item)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Envoyer le rapport d’évaluation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(item)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="fullName"
        searchPlaceholder="Rechercher un candidat..."
        loading={loading}
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la candidature</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la candidature de{' '}
              <strong>{deleteTarget?.fullName}</strong> ? Cette action est irréversible.
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