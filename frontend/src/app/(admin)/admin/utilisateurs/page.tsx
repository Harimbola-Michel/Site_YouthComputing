// src/app/(admin)/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { UsersTable } from './components/UsersTable';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await users.getAll();
      setData(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-ubuntu text-3xl font-bold text-foreground">
            Utilisateurs
          </h1>
          <p className="text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
        </div>
        <UsersTable 
          data={data} 
          loading={loading} 
          onUserUpdated={fetchUsers} 
        />
      </div>
    </PageTransition>
  );
}