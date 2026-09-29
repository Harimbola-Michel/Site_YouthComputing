'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PartnersTable } from './components/PartnersTable';
import { PartnerFormModal } from './components/PartnerFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { partners } from '@/lib/api';
import { Partner } from '@/types/partner.types';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

export default function PartnersPage() {
  const [data, setData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const fetchPartners = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      const response = await partners.getAll({ search: searchTerm || undefined });
      // ✅ Extraction robuste
      const list = response?.data?.data ?? response?.data ?? [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error('❌ Erreur chargement partenaires:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter');
      } else {
        toast.error('Impossible de charger les partenaires');
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const debouncedSearch = useCallback(
    debounce((value: string) => fetchPartners(value), 400),
    [fetchPartners]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPartners(search);
    setRefreshing(false);
    toast.success('Liste actualisée ✅');
  };

  const handleDelete = async (id: string) => {
    try {
      await partners.delete(id);
      toast.success('Partenaire supprimé 🗑️');
      fetchPartners(search);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await partners.toggleActive(id);
      toast.success('Statut modifié ✅');
      fetchPartners(search);
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    fetchPartners(search);
    toast.success(editingPartner ? 'Partenaire mis à jour ✅' : 'Partenaire ajouté 🎉');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight">
              Partenaires
            </h1>
            <p className="text-muted-foreground">
              Gérez les partenaires de Youth Computing
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un partenaire
          </Button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un partenaire..."
              value={search}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tableau */}
        <PartnersTable
          data={data}
          loading={loading}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
        />

        {/* Modal */}
        <PartnerFormModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          partner={editingPartner}
          onSuccess={handleSuccess}
        />
      </div>
    </PageTransition>
  );
}
