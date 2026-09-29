// app/(admin)/admin/y2c/membres/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/shared/PageTransition';
import { MembersTable, Y2CMember } from './components/MembersTable';
import { MemberFormModal } from './components/MemberFormModal';
import { GenerateBadgeButton } from './components/GenerateBadgeButton';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function Y2CMembersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<Y2CMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Y2CMember | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/y2c/members');
      const membersData = response.data?.data?.data ?? [];
      setMembers(membersData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      if (error.response?.status === 403) {
        toast.error('Accès interdit – vous devez être administrateur.');
        return;
      }
      console.error('❌ Erreur chargement membres :', error);
      toast.error('Impossible de charger les membres');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      loadMembers();
    }
  }, [authLoading, loadMembers]);

  const handleAdd = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: Y2CMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    loadMembers();
    toast.success(editingMember ? 'Membre modifié ✅' : 'Membre ajouté ✅');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMembers();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-2xl font-bold tracking-tight">
              Membres Y2C
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestion des membres de la communauté Y2C
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GenerateBadgeButton onSuccess={loadMembers} />
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
            <Button size="sm" onClick={handleAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        <MembersTable
          data={members}
          loading={loading}
          onMemberUpdated={loadMembers}
          onEdit={handleEdit}
        />
      </div>

      <MemberFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={editingMember || undefined}
        onSuccess={handleFormSuccess}
      />
    </PageTransition>
  );
}