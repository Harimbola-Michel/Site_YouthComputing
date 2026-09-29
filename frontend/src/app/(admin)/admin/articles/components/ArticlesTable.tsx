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
import { MoreHorizontal, Eye, Pencil, Trash2, MessageSquare, ExternalLink, MessageCircle, ImageOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { buildImageUrl } from '@/lib/imageUtils'; // ✅ Import

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  publishedAt?: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

interface ArticlesTableProps {
  data: Article[];
  loading?: boolean;
  onEdit: (article: Article) => void;
  onDelete?: (article: Article) => Promise<void>;
}

const statusConfig: Record<ArticleStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-gray-500/10 text-gray-600' },
  PUBLISHED: { label: 'Publié', className: 'bg-green-500/10 text-green-600' },
  ARCHIVED: { label: 'Archivé', className: 'bg-red-500/10 text-red-600' },
  SCHEDULED: { label: 'Programmé', className: 'bg-blue-500/10 text-blue-600' },
};

export function ArticlesTable({ data, loading = false, onEdit, onDelete }: ArticlesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleDeleteClick = (article: Article) => {
    setDeleteTarget(article);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Article supprimé avec succès');
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const columns: ColumnDef<Article>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const article = row.original;
        const src = article.featuredImage ? buildImageUrl(article.featuredImage, true) : null;
        const hasError = imageErrors[article.id] || !src;

        return (
          <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
            {hasError ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
                <ImageOff className="h-5 w-5 text-gray-300" />
              </div>
            ) : (
              <img
                src={src}
                alt={article.title}
                className="h-full w-full object-cover"
                onError={() => handleImageError(article.id)}
                loading="lazy"
              />
            )}
          </div>
        );
      },
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.title}</span>
          {row.original.isFeatured && (
            <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600">
              ⭐ À la une
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Catégorie',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.category}
        </Badge>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status as ArticleStatus;
        const config = statusConfig[status] || statusConfig.DRAFT;
        return (
          <Badge variant="secondary" className={cn('font-medium capitalize', config.className)}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'views',
      accessorKey: 'views',
      header: 'Vues',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono">{row.original.views}</span>
      ),
    },
    {
      id: 'comments',
      header: 'Commentaires',
      cell: ({ row }) => {
        const count = row.original.commentCount ?? 0;
        const articleId = row.original.id;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group gap-1.5 px-2 text-muted-foreground hover:text-foreground transition-colors"
                  asChild
                >
                  <Link href={`/admin/comments?articleId=${articleId}`}>
                    <MessageCircle className="h-4 w-4 group-hover:text-secondary transition-colors" />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        count > 0 ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>
                  {count === 0
                    ? 'Aucun commentaire'
                    : `${count} commentaire${count > 1 ? 's' : ''}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: 'publishedAt',
      accessorKey: 'publishedAt',
      header: 'Date de publication',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.publishedAt || row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Créé le',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const article = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/articles/${article.slug}`} target="_blank" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Voir en public
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/articles/${article.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/comments?articleId=${article.id}`} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Commentaires
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(article)} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(article)}
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
        searchPlaceholder="Rechercher un article par titre..."
        loading={loading}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l’article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l’article{' '}
              <strong className="text-foreground">{deleteTarget?.title}</strong> ?<br />
              Cette action est <strong>irréversible</strong> et supprimera également
              tous les commentaires associés.
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