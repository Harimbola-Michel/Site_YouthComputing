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
import { cn, formatDate } from '@/lib/utils';
import { MoreHorizontal, Eye, Pencil, Trash2, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export interface Recruitment {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  department: string;
  position: string;
  isActive: boolean;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  candidatures?: any[];
  _count?: {
    candidatures?: number;
  };
  candidatureCount?: number;
}

interface RecruitmentsTableProps {
  data: Recruitment[];
  loading?: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (item: Recruitment) => void;
  onRefresh?: () => void;
}

export function RecruitmentsTable({
  data,
  loading = false,
  onDelete,
  onEdit,
  onRefresh,
}: RecruitmentsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Recruitment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (item: Recruitment) => {
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Offre supprimée');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Recruitment>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.position}</p>
        </div>
      ),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Département',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.department}</span>,
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            'font-medium',
            row.original.isActive
              ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400'
          )}
        >
          {row.original.isActive ? 'Active' : 'Fermée'}
        </Badge>
      ),
    },
    {
      id: 'candidatures',
      header: 'Candidatures',
      cell: ({ row }) => {
        const item = row.original;
        let count = 0;
        if (item.candidatures && Array.isArray(item.candidatures)) {
          count = item.candidatures.length;
        } else if (item._count && typeof item._count.candidatures === 'number') {
          count = item._count.candidatures;
        } else if (typeof item.candidatureCount === 'number') {
          count = item.candidatureCount;
        }
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      id: 'deadline',
      accessorKey: 'deadline',
      header: 'Date limite',
      cell: ({ row }) =>
        row.original.deadline ? formatDate(row.original.deadline) : '—',
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Créée le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/recrutements/${item.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(item)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Supprimer
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
        searchKey="title"
        searchPlaceholder="Rechercher une offre..."
        loading={loading}
        addButtonLabel="Ajouter une offre"
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’offre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’offre{' '}
              <strong>{deleteTarget?.title}</strong> ? Cette action est irréversible.
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