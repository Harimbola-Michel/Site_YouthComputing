'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Calendar,
} from 'lucide-react';
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
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { buildImageUrl } from '@/lib/imageUtils';
// ✅ Imports pour l'avatar
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  sessions?: any[];
}

interface FormationTableProps {
  data: Formation[];
  loading?: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (formation: Formation) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
}

const levelLabels: Record<string, string> = {
  DÉBUTANT: 'Débutant',
  INTERMÉDIAIRE: 'Intermédiaire',
  AVANCÉ: 'Avancé',
  EXPERT: 'Expert',
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

const levelColors: Record<string, string> = {
  DÉBUTANT: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  INTERMÉDIAIRE: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  AVANCÉ: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  EXPERT: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  BEGINNER: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  INTERMEDIATE: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  ADVANCED: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
};

export function FormationTable({
  data,
  loading = false,
  onDelete,
  onEdit,
  onFilterChange,
  onRefresh,
}: FormationTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Formation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleDeleteClick = (formation: Formation) => {
    setDeleteTarget(formation);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Formation supprimée');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (formation: Formation) => {
    setPublishingId(formation.id);
    try {
      await formations.togglePublish(formation.id);
      toast.success(formation.isPublished ? 'Formation dépubliée' : 'Formation publiée');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setPublishingId(null);
    }
  };

  // ─── Colonnes ──────────────────────────────────────────────
  const columns: ColumnDef<Formation>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const formation = row.original;
        const imageUrl = formation.imageUrl;
        const src = imageUrl ? buildImageUrl(imageUrl, false) : null;
        const initials = formation.title?.charAt(0).toUpperCase() || '?';
        const [imageError, setImageError] = useState(false);

        return (
          <Avatar className="h-12 w-16 rounded-md border border-border/50">
            {src && !imageError ? (
              <AvatarImage
                src={src}
                alt={formation.title}
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : null}
            <AvatarFallback className="rounded-md bg-muted/20 text-muted-foreground text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <div className="min-w-0">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p className="font-medium truncate cursor-default">{row.original.title}</p>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="max-w-xs">{row.original.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground truncate">{row.original.category}</p>
        </div>
      ),
    },
    {
      id: 'level',
      accessorKey: 'level',
      header: 'Niveau',
      cell: ({ row }) => {
        const level = row.original.level;
        const label = levelLabels[level] || level?.toLowerCase() || '—';
        const color = levelColors[level] || 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
        return (
          <Badge variant="secondary" className={cn('font-medium capitalize', color)}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: 'Prix',
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {row.original.price > 0
            ? `${row.original.price.toLocaleString()} Ar`
            : 'Gratuit'}
        </span>
      ),
    },
    {
      id: 'isPublished',
      accessorKey: 'isPublished',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            'font-medium gap-1.5',
            row.original.isPublished
              ? 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
          )}
        >
          {row.original.isPublished ? (
            <>
              <Globe className="h-3 w-3" />
              Publiée
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              Brouillon
            </>
          )}
        </Badge>
      ),
    },
    {
      id: 'sessions',
      header: 'Sessions',
      cell: ({ row }) => (
        <Link
          href={`/admin/formations/${row.original.id}`}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Voir</span>
        </Link>
      ),
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
        const formation = row.original;
        const isPublishing = publishingId === formation.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/formations/${formation.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(formation)} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTogglePublish(formation)}
                disabled={isPublishing}
                className="flex items-center gap-2"
              >
                {formation.isPublished ? (
                  <>
                    <Lock className="h-4 w-4" /> Dépublier
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" /> Publier
                  </>
                )}
                {isPublishing && '...'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(formation)}
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
        searchPlaceholder="Rechercher une formation..."
        loading={loading}
        addButtonLabel="Ajouter une formation"
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la formation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la formation{' '}
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