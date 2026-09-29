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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, getInitials } from '@/lib/utils';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  Eye,
  Mail,
  Calendar,
  Search,
  Users,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { TeamMember } from '@/types/team.types';

// ─── Helper robuste pour récupérer les infos utilisateur ──
function getUserInfo(member: TeamMember) {
  // Supporte les deux structures : `user` ou `User` (PascalCase)
  const user = member.user || member.User || null;
  if (!user) return { fullName: 'Utilisateur inconnu', email: 'Email non renseigné', avatar: undefined, firstName: '', lastName: '' };

  // Supporte `fullName` ou `firstName` + `lastName`
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
  const email = user.email || 'Email non renseigné';
  const avatar = user.avatar;
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';

  return { fullName, email, avatar, firstName, lastName };
}

interface TeamMembersTableProps {
  data: TeamMember[];
  loading?: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => Promise<void>;
  onToggleActive: (member: TeamMember) => Promise<void>;
  onView?: (member: TeamMember) => void;
}

export function TeamMembersTable({
  data,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
}: TeamMembersTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // ─── Filtrage ──────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const info = getUserInfo(member);
      const matchSearch =
        info.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && member.isActive) ||
        (statusFilter === 'inactive' && !member.isActive);
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const handleDeleteClick = (member: TeamMember) => {
    setDeleteTarget(member);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      toast.success('Membre supprimé avec succès');
    } catch {
      // Géré par le parent
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter((m) => m.isActive).length;
  const inactiveCount = data.filter((m) => !m.isActive).length;

  // ─── Colonnes ──────────────────────────────────────────────────
  const columns: ColumnDef<TeamMember>[] = [
    {
      id: 'member',
      header: 'Membre',
      cell: ({ row }) => {
        const member = row.original;
        const info = getUserInfo(member);
        const initials = getInitials(info.firstName, info.lastName) || '?';

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-secondary/20">
              <AvatarImage src={info.avatar ? buildImageUrl(info.avatar, false) : undefined} />
              <AvatarFallback
                className={cn(
                  'font-medium',
                  info.fullName !== 'Utilisateur inconnu'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className={cn(
                        'font-medium truncate max-w-[120px] sm:max-w-[200px]',
                        info.fullName === 'Utilisateur inconnu' && 'text-muted-foreground italic'
                      )}
                    >
                      {info.fullName}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {info.fullName !== 'Utilisateur inconnu'
                        ? `${info.fullName} (${info.email})`
                        : 'Cet utilisateur a été supprimé ou n’existe plus'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {info.email}
                </span>
                {info.fullName === 'Utilisateur inconnu' && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-dashed">
                    inconnu
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize font-normal px-3 py-1">
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Département',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.department || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant="secondary"
            className={cn(
              'capitalize font-medium gap-1.5 px-3 py-1',
              isActive
                ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
            )}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Ajouté le',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const member = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/team/${member.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" />
                  Voir le détail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(member)} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(member)} className="flex items-center gap-2 cursor-pointer">
                <Power className="h-4 w-4" />
                {member.isActive ? 'Désactiver' : 'Activer'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(member)}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer définitivement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ─── État de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // ─── Aucune donnée ────────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-semibold">Aucun membre</h3>
        <p className="text-sm text-muted-foreground">
          Aucun membre dans l’équipe. Commencez par en ajouter un !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Statistiques ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
            Total : {totalCount}
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            Actifs : {activeCount}
          </Badge>
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
            Inactifs : {inactiveCount}
          </Badge>
        </div>
      </div>

      {/* ─── Filtres ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="active" className="gap-1">
              Actifs
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] bg-green-500/20 text-green-600">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inactive" className="gap-1">
              Inactifs
              {inactiveCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] bg-gray-500/20 text-gray-600">
                  {inactiveCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ─── Tableau ────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="member"
        searchPlaceholder="Rechercher un membre..."
        loading={false}
        emptyMessage="Aucun membre correspondant à vos critères."
      />

      {/* ─── Dialogue de suppression ──────────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong className="text-foreground">
                {deleteTarget ? getUserInfo(deleteTarget).fullName : 'ce membre'}
              </strong>
              ? Cette action est irréversible et supprimera toutes les données associées.
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
    </div>
  );
}