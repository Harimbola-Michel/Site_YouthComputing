'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate, cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  Ban,
  CheckCircle,
  UserCog,
  Lock,
  Unlock,
  User as UserIcon,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/admin/DataTable';
import { UserForm } from './UserForm';
import { RoleSelector, getRoleConfig } from './RoleSelector';
import { User, Role } from '@/types/user.types';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
// ✅ Imports pour l'avatar
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: {
    label: 'Actif',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  INACTIVE: {
    label: 'Inactif',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  SUSPENDED: {
    label: 'Suspendu',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <Lock className="h-3.5 w-3.5" />,
  },
  PENDING_VERIFICATION: {
    label: 'En attente',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

interface UsersTableProps {
  data: User[];
  loading?: boolean;
  onUserUpdated?: () => void;
}

export function UsersTable({ data, loading = false, onUserUpdated }: UsersTableProps) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN;
  const isAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<Role>(Role.VIEWER);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      onUserUpdated?.();
      toast.success('✅ Tableau actualisé');
    } catch {
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsRefreshing(false);
    }
  };

  const refetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    onUserUpdated?.();
  };

  const handleValidateUser = async (user: User) => {
    setActionLoading(user.id);
    try {
      await api.patch(`/users/${user.id}/validate`);
      toast.success(`✅ ${user.firstName} ${user.lastName} validé`);
      refetchUsers();
    } catch (error: any) {
      const msg = error?.response?.status === 403
        ? 'Vous n\'avez pas les droits pour valider cet utilisateur.'
        : 'Erreur lors de la validation';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setIsValidateDialogOpen(false);
    }
  };

  const handleToggleBlock = async (user: User) => {
    setActionLoading(user.id);
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      toast.success(newStatus === 'ACTIVE' ? '🔓 Utilisateur débloqué' : '🔒 Utilisateur bloqué');
      refetchUsers();
    } catch (error: any) {
      const msg = error?.response?.status === 403
        ? 'Vous n\'avez pas les droits pour bloquer/débloquer cet utilisateur.'
        : 'Erreur lors du changement de statut';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setIsBlockDialogOpen(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setActionLoading(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      toast.success(`🗑️ ${user.firstName} ${user.lastName} supprimé`);
      refetchUsers();
    } catch (error: any) {
      const msg = error?.response?.status === 403
        ? 'Vous n\'avez pas les droits pour supprimer cet utilisateur.'
        : 'Erreur lors de la suppression';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    setActionLoading(selectedUser.id);
    try {
      await api.patch(`/users/${selectedUser.id}/change-role`, { role: newRole });
      toast.success(`🔄 Rôle de ${selectedUser.firstName} mis à jour`);
      refetchUsers();
    } catch (error: any) {
      const msg = error?.response?.status === 403
        ? 'Vous n\'avez pas les droits pour changer le rôle (seul un SUPER_ADMIN peut le faire).'
        : 'Erreur lors du changement de rôle';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setIsRoleDialogOpen(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // ─── Colonnes ──────────────────────────────────────────────
  const columns: ColumnDef<User>[] = [
    {
      id: 'fullName',
      header: 'Nom complet',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => {
        const user = row.original;
        // ✅ Construction de l'URL de l'avatar
        const avatarUrl = user.avatar ? buildImageUrl(user.avatar, false) : null;
        const initials = user.firstName?.charAt(0).toUpperCase() + user.lastName?.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage
                src={avatarUrl || undefined}
                alt={`${user.firstName} ${user.lastName}`}
                onError={(e) => {
                  // En cas d'erreur de chargement, on cache l'image
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/5 text-secondary font-semibold text-sm">
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => {
        const role = row.original.role;
        const config = getRoleConfig(role);
        return (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <span>
                  <Badge className={cn('gap-1.5 font-medium text-[10px] uppercase', config.color)}>
                    {config.icon}
                    {config.label}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] || statusConfig.INACTIVE;
        return (
          <Badge variant="outline" className={cn('gap-1.5 font-medium text-[10px] uppercase', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'lastLogin',
      header: 'Dernière connexion',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin ? formatDate(row.original.lastLogin) : 'Jamais'}
        </span>
      ),
    },
    {
      accessorKey: 'emailVerified',
      header: 'Vérifié',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.emailVerified ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Ban className="h-4 w-4 text-red-400" />
          )}
          <span className="text-sm">{row.original.emailVerified ? 'Oui' : 'Non'}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        const isLoading = actionLoading === user.id;
        const isSuspended = user.status === 'SUSPENDED';
        const isPending = user.status === 'PENDING_VERIFICATION';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading} className="h-8 w-8">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  {user.firstName} {user.lastName}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleEditUser(user)} className="gap-2">
                <Edit className="h-4 w-4 text-blue-500" />
                Modifier
              </DropdownMenuItem>

              {isAdmin && isPending && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setIsValidateDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Valider
                </DropdownMenuItem>
              )}

              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setIsBlockDialogOpen(true);
                  }}
                  className={cn('gap-2', isSuspended ? 'text-green-600' : 'text-red-600')}
                >
                  {isSuspended ? (
                    <>
                      <Unlock className="h-4 w-4" />
                      Débloquer
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Bloquer
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setNewRole(user.role);
                    setIsRoleDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <UserCog className="h-4 w-4 text-amber-500" />
                  Changer le rôle
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              )}
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
        searchKey="email"
        searchPlaceholder="Rechercher un utilisateur..."
        loading={loading || isRefreshing}
        addButtonLabel="Ajouter un utilisateur"
        onAdd={() => {
          setSelectedUser(null);
          setIsEditDialogOpen(true);
        }}
        onRefresh={handleRefresh}
      />

      {/* ─── Dialog : Validation ───────────────────────────── */}
      <AlertDialog open={isValidateDialogOpen} onOpenChange={setIsValidateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && handleValidateUser(selectedUser)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Dialog : Blocage ──────────────────────────────── */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === 'SUSPENDED' ? 'Débloquer' : 'Bloquer'} l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === 'SUSPENDED'
                ? `Voulez-vous réactiver le compte de ${selectedUser?.firstName} ${selectedUser?.lastName} ?`
                : `Voulez-vous bloquer le compte de ${selectedUser?.firstName} ${selectedUser?.lastName} ?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleToggleBlock(selectedUser)}
              className={selectedUser?.status === 'SUSPENDED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {selectedUser?.status === 'SUSPENDED' ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
              {selectedUser?.status === 'SUSPENDED' ? 'Débloquer' : 'Bloquer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Dialog : Changement de rôle ────────────────────── */}
      {isSuperAdmin && (
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le rôle</DialogTitle>
              <DialogDescription>
                Sélectionnez le nouveau rôle pour <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="role-select">Rôle</Label>
              <RoleSelector
                id="role-select"
                value={newRole}
                onChange={(role) => setNewRole(role)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleChangeRole} disabled={actionLoading === selectedUser?.id}>
                {actionLoading === selectedUser?.id ? 'Changement...' : 'Appliquer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Dialog : Suppression ───────────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Formulaire d'édition ───────────────────────────── */}
      <UserForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser || undefined}
        onSuccess={refetchUsers}
      />
    </TooltipProvider>
  );
}