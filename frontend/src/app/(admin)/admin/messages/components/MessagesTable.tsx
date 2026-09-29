'use client';

import { useState, useMemo } from 'react';
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
import { MoreHorizontal, Mail, Reply, Trash2, CheckCheck, Eye, EyeOff, MailOpen } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Message } from '@/types/message.types';

interface MessagesTableProps {
  data: Message[];
  loading?: boolean;
  onReply: (message: Message) => void;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function MessagesTable({
  data,
  loading = false,
  onReply,
  onMarkRead,
  onDelete,
  onRefresh,
}: MessagesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Filtrage des données
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    if (statusFilter === 'unread') return data.filter((m) => !m.isRead);
    return data.filter((m) => m.isRead);
  }, [data, statusFilter]);

  const handleDeleteClick = (message: Message) => {
    setDeleteTarget(message);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Message supprimé');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkRead = async (message: Message) => {
    if (message.isRead) return;
    try {
      await onMarkRead(message.id);
      toast.success('Marqué comme lu');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const columns: ColumnDef<Message>[] = [
    {
      id: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.isRead ? (
            <CheckCheck className="h-4 w-4 text-green-500" />
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          )}
          <span className="text-xs text-muted-foreground">
            {row.original.isRead ? 'Lu' : 'Non lu'}
          </span>
        </div>
      ),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Expéditeur',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: 'subject',
      accessorKey: 'subject',
      header: 'Sujet',
      cell: ({ row }) => (
        <span className={cn(row.original.isRead ? 'text-muted-foreground' : 'font-medium')}>
          {row.original.subject}
        </span>
      ),
    },
    {
      id: 'message_preview',
      header: 'Aperçu',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
          {row.original.message}
        </span>
      ),
    },
    {
      id: 'replied',
      header: 'Répondu',
      cell: ({ row }) => (
        <Badge variant={row.original.repliedAt ? 'default' : 'secondary'}>
          {row.original.repliedAt ? 'Oui' : 'Non'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Reçu le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const message = row.original;
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
              {!message.isRead && (
                <DropdownMenuItem onClick={() => handleMarkRead(message)}>
                  <Eye className="h-4 w-4 mr-2" /> Marquer comme lu
                </DropdownMenuItem>
              )}
              {message.isRead && (
                <DropdownMenuItem onClick={() => onMarkRead(message.id)}>
                  <EyeOff className="h-4 w-4 mr-2" /> Marquer comme non lu
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" /> Répondre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.email)}>
                <Mail className="h-4 w-4 mr-2" /> Copier l'email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(message)}
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

  if (!loading && filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MailOpen className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 font-ubuntu text-lg font-semibold">
          {statusFilter === 'all' ? 'Aucun message' : 'Aucun message dans ce filtre'}
        </h3>
        <p className="text-muted-foreground">
          {statusFilter === 'all'
            ? 'Aucun message reçu pour le moment.'
            : 'Essayez de modifier le filtre.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as typeof statusFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unread">Non lus</SelectItem>
              <SelectItem value="read">Lus</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredData.length} message{filteredData.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Rechercher par nom ou email..."
        loading={loading}
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le message</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le message de{' '}
              <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
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