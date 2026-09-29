'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { Partner } from '@/types/partner.types';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Globe,
  CheckCircle,
  XCircle,
  Building2,
} from 'lucide-react';

interface PartnersTableProps {
  data: Partner[];
  loading?: boolean;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onEdit: (partner: Partner) => void;
}

export function PartnersTable({
  data,
  loading,
  onDelete,
  onToggleActive,
  onEdit,
}: PartnersTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (partner: Partner) => {
    setDeleteTarget(partner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const columns: ColumnDef<Partner>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Partenaire',
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="h-10 w-10 border">
              <AvatarImage
                src={partner.logo}
                alt={partner.name}
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-secondary/10 text-secondary">
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{partner.name}</p>
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  {partner.website.replace(/^https?:\/\//, '').slice(0, 30)}
                </a>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm text-muted-foreground max-w-xs">
          {row.original.description || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant="secondary"
            className={isActive
              ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20'
              : 'bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20'
            }
          >
            {isActive ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ajouté le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const partner = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(partner)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(partner.id)} className="gap-2">
                {partner.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 text-amber-500" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              {partner.website && (
                <DropdownMenuItem asChild className="gap-2">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                    Voir le site
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(partner)}
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

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKey="name"
        searchPlaceholder="Rechercher un partenaire..."
        className="border rounded-lg"
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le partenaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}