'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatDate } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export type Y2CEventType =
  | 'TRAINING'
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'MEETUP'
  | 'TEAM_SETUP'
  | 'THREE_S'
  | 'TEAM_REALIZE'
  | 'COFFREDAY'
  | 'HACKATHON'
  | 'OTHER';

export interface Y2CEvent {
  id: string;
  title: string;
  description: string;
  eventType: Y2CEventType;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  isPaid: boolean;
  price?: number;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // ✅ Statistiques de paiement
  paidRegistrations?: number;
  totalCollected?: number;
}

interface EventsTableProps {
  data: Y2CEvent[];
  loading?: boolean;
  onEdit: (event: Y2CEvent) => void;
  onDelete: (event: Y2CEvent) => Promise<void>;
  onRefresh?: () => void;
}

const eventTypeConfig: Record<
  Y2CEventType,
  { label: string; className: string }
> = {
  TRAINING: {
    label: 'Formation',
    className: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  CONFERENCE: {
    label: 'Conférence',
    className: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  },
  WORKSHOP: {
    label: 'Atelier',
    className: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  },
  MEETUP: {
    label: 'Meetup',
    className: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  },
  TEAM_SETUP: {
    label: 'Team Set Up',
    className: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  THREE_S: {
    label: '3S',
    className: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  },
  TEAM_REALIZE: {
    label: 'Team Realize',
    className: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  },
  COFFREDAY: {
    label: 'Coffreday',
    className: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  },
  HACKATHON: {
    label: 'Hackathon',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
  OTHER: {
    label: 'Autre',
    className: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  },
};

export function EventsTable({
  data,
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
}: EventsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Y2CEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (event: Y2CEvent) => {
    setDeleteTarget(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      // L'erreur est gérée dans le parent
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Y2CEvent>[] = [
    // ─── Colonne Image ────────────────────────────────────────
    {
      id: 'image',
      accessorKey: 'imageUrl',
      header: 'Image',
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        const title = row.original.title;
        const hasImage = imageUrl && imageUrl.trim() !== '';

        return (
          <div className="relative h-12 w-16 overflow-hidden rounded-md border bg-muted">
            {hasImage ? (
              <Image
                src={buildImageUrl(imageUrl, false)}
                alt={title}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="64px"
                unoptimized
                onError={(e) => {
                  // En cas d'erreur, on masque l'image et on affiche le placeholder
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : null}
            <div className={`fallback-icon flex h-full w-full items-center justify-center ${hasImage ? 'hidden' : ''}`}>
              <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
        );
      },
    },
    // ─── Titre ────────────────────────────────────────────────
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.location}</p>
        </div>
      ),
    },
    // ─── Type ─────────────────────────────────────────────────
    {
      id: 'eventType',
      accessorKey: 'eventType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.eventType;
        const config = eventTypeConfig[type] || eventTypeConfig.OTHER;
        return (
          <Badge variant="secondary" className={cn('font-medium', config.className)}>
            {config.label}
          </Badge>
        );
      },
    },
    // ─── Date ──────────────────────────────────────────────────
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: 'Date',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{formatDate(row.original.startDate)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    // ─── Statut (publié/brouillon) ──────────────────────────
    {
      id: 'isPublished',
      accessorKey: 'isPublished',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={cn(
            'font-medium',
            row.original.isPublished
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
          )}
        >
          {row.original.isPublished ? 'Publié' : 'Brouillon'}
        </Badge>
      ),
    },
    // ─── Places ───────────────────────────────────────────────
    {
      id: 'maxParticipants',
      accessorKey: 'maxParticipants',
      header: 'Places',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.maxParticipants || '∞'}
        </span>
      ),
    },
    // ─── Inscriptions payées ─────────────────────────────────
    {
      id: 'paidRegistrations',
      accessorKey: 'paidRegistrations',
      header: () => (
        <div className="flex items-center gap-1">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Payé</span>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original.paidRegistrations ?? 0;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium tabular-nums">{count}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nombre d'inscriptions payées</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    // ─── Total collecté ──────────────────────────────────────
    {
      id: 'totalCollected',
      accessorKey: 'totalCollected',
      header: () => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Total collecté</span>
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.original.totalCollected ?? 0;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-semibold text-secondary tabular-nums">
                  {amount.toLocaleString()} Ar
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Montant total collecté (inscriptions payées)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    // ─── Actions ─────────────────────────────────────────────
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const event = row.original;
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/y2c/evenements/${event.id}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(event)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/y2c/evenements/${event.id}/inscriptions`}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Inscriptions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(event)}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
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

  return (
    <TooltipProvider>
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Rechercher un événement..."
        loading={loading}
        addButtonLabel="Ajouter un événement"
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’événement{' '}
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
    </TooltipProvider>
  );
}