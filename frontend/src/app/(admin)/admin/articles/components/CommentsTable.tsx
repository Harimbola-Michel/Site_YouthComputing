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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatDate } from '@/lib/utils';
import { MoreHorizontal, Check, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  isApproved: boolean;
  createdAt: string;
  articleId: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
  parentId?: string;
  replies?: Comment[];
}

interface CommentsTableProps {
  data: Comment[];
  loading?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onViewArticle?: (articleId: string) => void;
}

export function CommentsTable({
  data,
  loading = false,
  onApprove,
  onDelete,
  onViewArticle,
}: CommentsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const handleDeleteClick = (comment: Comment) => {
    setDeleteTarget(comment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Commentaire supprimé');
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!onApprove) return;
    setIsApproving(id);
    try {
      await onApprove(id);
      toast.success('Commentaire approuvé');
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de l'approbation");
    } finally {
      setIsApproving(null);
    }
  };

  const columns: ColumnDef<Comment>[] = [
    {
      id: 'author',
      accessorKey: 'authorName',
      header: 'Auteur',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.authorName}</div>
          <div className="text-xs text-muted-foreground">{row.original.authorEmail}</div>
        </div>
      ),
    },
    {
      id: 'content',
      accessorKey: 'content',
      header: 'Contenu',
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-xs truncate text-sm">{row.original.content}</div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <p>{row.original.content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: 'article',
      accessorKey: 'article.title',
      header: 'Article',
      cell: ({ row }) => {
        const article = row.original.article;
        if (!article) return <span className="text-muted-foreground text-sm">ID: {row.original.articleId?.slice(0, 8)}...</span>;
        return (
          <Button
            variant="link"
            className="h-auto p-0 text-sm font-normal"
            onClick={() => onViewArticle?.(article.id)}
          >
            {article.title}
          </Button>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'isApproved',
      header: 'Statut',
      cell: ({ row }) => {
        const isApproved = row.original.isApproved;
        return (
          <Badge
            variant={isApproved ? 'default' : 'secondary'}
            className={cn(
              'capitalize',
              isApproved
                ? 'bg-green-500/10 text-green-600'
                : 'bg-yellow-500/10 text-yellow-600'
            )}
          >
            {isApproved ? 'Approuvé' : 'En attente'}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const comment = row.original;
        const isApprovingThis = isApproving === comment.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!comment.isApproved && onApprove && (
                <DropdownMenuItem
                  onClick={() => handleApprove(comment.id)}
                  disabled={isApprovingThis}
                  className="flex items-center gap-2 text-green-600"
                >
                  <Check className="h-4 w-4" />
                  {isApprovingThis ? 'Approbation...' : 'Approuver'}
                </DropdownMenuItem>
              )}
              {onViewArticle && comment.article && (
                <DropdownMenuItem
                  onClick={() => onViewArticle(comment.articleId)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir l'article
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(comment)}
                    className="flex items-center gap-2 text-destructive"
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
        searchKey="author"
        searchPlaceholder="Rechercher par auteur, email..."
        loading={loading}
        emptyMessage="Aucun commentaire trouvé"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le commentaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le commentaire de{' '}
              <strong className="text-foreground">{deleteTarget?.authorName}</strong> ?<br />
              Cette action est <strong>irréversible</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}