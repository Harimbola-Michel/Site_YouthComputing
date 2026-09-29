'use client';

import { ReactNode } from 'react';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';
import { RoleGuard } from '@/components/admin/RoleGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR']}>
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </RoleGuard>
  );
}