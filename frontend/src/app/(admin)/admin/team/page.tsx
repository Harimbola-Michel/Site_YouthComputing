'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { TeamMembersTable } from './components/TeamMembersTable';
import { TeamMemberFormModal } from './components/TeamMemberFormModal';
import { team } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminTeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await team.getAll({ search: searchTerm });
      const data = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
      toast.error('Impossible de charger les membres');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ─── Export ──────────────────────────────────────────────────────
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await team.export(format, { search: searchTerm });
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `equipe-youth-computing.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Export ${format.toUpperCase()} effectué avec succès ✅`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('La fonction d’export n’est pas encore disponible sur le serveur.');
      } else {
        toast.error('Erreur lors de l’export');
      }
      console.error('Erreur export:', error);
    }
  };

  // ─── Handlers ──────────────────────────────────────────────────
  const handleAdd = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    fetchMembers();
    toast.success(editingMember ? 'Membre modifié ✅' : 'Membre ajouté 🎉');
  };

  const handleDelete = async (member) => {
    try {
      await team.delete(member.id);
      toast.success('Membre supprimé avec succès');
      fetchMembers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await team.toggleActive(member.id);
      toast.success(`Membre ${member.isActive ? 'désactivé' : 'activé'}`);
      fetchMembers();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMembers();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Équipe
            </h1>
            <p className="text-muted-foreground">
              Gérez les membres de l’équipe Youth Computing.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-48 rounded-lg border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </Button>

            {/* ✅ Menu d’export avec dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleAdd} className="gap-2 shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-4 w-4" />
              Nouveau membre
            </Button>
          </div>
        </div>

        <TeamMembersTable
          data={members}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />

        <TeamMemberFormModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          member={editingMember}
          onSuccess={handleSuccess}
        />
      </div>
    </PageTransition>
  );
}