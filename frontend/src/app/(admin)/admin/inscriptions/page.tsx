'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { RegistrationsTable } from './components/RegistrationsTable';
import { ExportButton } from './components/ExportButton';
import { registrations } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminRegistrationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrations.getAll();
      setData(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirm = async (id: string) => {
    await registrations.confirm(id);
    await fetchRegistrations();
  };

  const handleCancel = async (id: string) => {
    await registrations.cancel(id);
    await fetchRegistrations();
  };

  const handleDelete = async (id: string) => {
    await registrations.delete(id);
    await fetchRegistrations();
  };

  const handleView = (id: string) => {
    // Rediriger vers la page de détail ou ouvrir un modal
    window.location.href = `/admin/inscriptions/${id}`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold text-foreground">
              Gestion des inscriptions
            </h1>
            <p className="text-muted-foreground">Consultez et gérez toutes les inscriptions</p>
          </div>
          <ExportButton />
        </div>
        <RegistrationsTable
          data={data}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
    </PageTransition>
  );
}