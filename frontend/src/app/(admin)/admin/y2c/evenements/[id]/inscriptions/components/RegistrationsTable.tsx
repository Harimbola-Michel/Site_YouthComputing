'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, cn } from '@/lib/utils';
import { y2c } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  attended: boolean;
  createdAt: string;
  Y2CEvent?: {
    id: string;
    title: string;
    startDate: string;
    location: string;
  };
}

interface RegistrationsTableProps {
  data: Registration[];
  loading?: boolean;
  onRefresh?: () => void;
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  ATTENDED: 'Présent',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  CANCELLED: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  ATTENDED: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

export function RegistrationsTable({ data, loading = false, onRefresh }: RegistrationsTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await y2c.updateRegistrationStatus(id, { status });
      toast.success('Statut mis à jour');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const columns: ColumnDef<Registration>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Participant',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Téléphone',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span>,
    },
    {
      id: 'event',
      accessorKey: 'Y2CEvent.title',
      header: 'Événement',
      cell: ({ row }) => {
        const event = row.original.Y2CEvent;
        return (
          <div>
            <p className="font-medium text-sm">{event?.title || '—'}</p>
            <p className="text-xs text-muted-foreground">
              {event?.startDate ? formatDate(event.startDate) : ''}
              {event?.location ? ` • ${event.location}` : ''}
            </p>
          </div>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={cn('font-medium', STATUS_COLORS[status] || STATUS_COLORS.PENDING)}>
            {STATUS_LABELS[status] || status}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Inscrit le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        const isUpdating = updating === item.id;
        return (
          <Select
            value={item.status}
            onValueChange={(val) => handleStatusChange(item.id, val)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="Statut">
                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_LABELS[item.status] || item.status}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Rechercher un inscrit..."
      loading={loading}
      onRefresh={onRefresh}
    />
  );
}