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
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  impact?: string;
  technologies: string[];
  images: string[];
  year: number;
  category: string;
  isFeatured: boolean;
  status: ProjectStatus;
  client?: string;
  projectUrl?: string;
  githubUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsTableProps {
  data: Project[];
  loading?: boolean;
  onEdit: (project: Project) => void;
  onDelete?: (project: Project) => Promise<void>;
  onRefresh?: () => void;
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  PLANNING: {
    label: 'Planification',
    className: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  },
  ON_HOLD: {
    label: 'En pause',
    className: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  },
  CANCELLED: {
    label: 'Annulé',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
};

export function ProjectsTable({ data, loading = false, onEdit, onDelete, onRefresh }: ProjectsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (project: Project) => {
    setDeleteTarget(project);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Projet supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      id: 'year',
      accessorKey: 'year',
      header: 'Année',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.year}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || statusConfig.PLANNING;
        return (
          <Badge variant="secondary" className={cn('font-medium capitalize', config.className)}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'isFeatured',
      accessorKey: 'isFeatured',
      header: 'Vedette',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            'font-medium',
            row.original.isFeatured
              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
              : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
          )}
        >
          {row.original.isFeatured ? '★ Oui' : 'Non'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Date de création',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const project = row.original;
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
                <Link href={`/admin/projets-admin/${project.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(project)} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(project)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
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
        searchPlaceholder="Rechercher un projet..."
        loading={loading}
        addButtonLabel="Ajouter un projet"
        onAdd={() => {}} // géré par le parent
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le projet</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet{' '}
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