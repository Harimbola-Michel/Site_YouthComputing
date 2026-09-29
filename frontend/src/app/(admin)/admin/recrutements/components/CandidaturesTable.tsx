'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MoreHorizontal, Eye, FileText, Loader2, User } from 'lucide-react';
import { recruitments } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CandidatureStatusBadge } from './CandidatureStatusBadge';

interface Candidature {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
}

interface CandidaturesTableProps {
  recruitmentId: string;
  onRefresh?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'REVIEWED', label: 'Examinée' },
  { value: 'SHORTLISTED', label: 'Présélectionnée' },
  { value: 'INTERVIEWED', label: 'Entretien effectué' },
  { value: 'ACCEPTED', label: 'Acceptée' },
  { value: 'REJECTED', label: 'Rejetée' },
];

const STATUS_LABELS: Record<string, string> = STATUS_OPTIONS.reduce(
  (acc, { value, label }) => ({ ...acc, [value]: label }),
  {}
);

export function CandidaturesTable({ recruitmentId, onRefresh }: CandidaturesTableProps) {
  const [data, setData] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [coverLetterModal, setCoverLetterModal] = useState<{ open: boolean; content: string; name: string }>({
    open: false,
    content: '',
    name: '',
  });

  const fetchCandidatures = useCallback(async () => {
    if (!recruitmentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await recruitments.getCandidatures(recruitmentId);
      // Extraction robuste
      let list = response?.data?.data || response?.data || [];
      if (!Array.isArray(list)) {
        console.warn('La réponse API n\'est pas un tableau:', response);
        list = [];
      }
      setData(list);
    } catch (error) {
      console.error('Erreur chargement candidatures:', error);
      toast.error('Impossible de charger les candidatures');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [recruitmentId]);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await recruitments.updateCandidatureStatus(id, { status });
      toast.success('Statut mis à jour');
      await fetchCandidatures();
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(null);
    }
  };

  const handleViewCoverLetter = (content: string, name: string) => {
    setCoverLetterModal({ open: true, content, name });
  };

  const columns: ColumnDef<Candidature>[] = [
    {
      id: 'fullName',
      accessorKey: 'fullName',
      header: 'Candidat',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.fullName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {row.original.email}
          </p>
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
      id: 'status',
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <CandidatureStatusBadge status={row.original.status} />,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Reçue le',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const candidature = row.original;
        const isUpdating = updating === candidature.id;
        return (
          <div className="flex items-center gap-2">
            <Select
              value={candidature.status}
              onValueChange={(val) => handleStatusChange(candidature.id, val)}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Statut">
                  {STATUS_LABELS[candidature.status] || candidature.status}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href={candidature.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" /> Voir CV
                  </a>
                </DropdownMenuItem>
                {candidature.coverLetter && (
                  <DropdownMenuItem
                    onClick={() => handleViewCoverLetter(candidature.coverLetter!, candidature.fullName)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" /> Lettre de motivation
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement des candidatures...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted/30 p-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-3 font-medium text-muted-foreground">Aucune candidature</p>
        <p className="text-sm text-muted-foreground/60">
          Les candidatures pour cette offre apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="fullName"
        searchPlaceholder="Rechercher un candidat..."
        loading={loading}
        onRefresh={fetchCandidatures}
      />

      {/* Modal pour la lettre de motivation */}
      <Dialog
        open={coverLetterModal.open}
        onOpenChange={(open) => setCoverLetterModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lettre de motivation</DialogTitle>
            <DialogDescription>
              De <strong>{coverLetterModal.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/20 p-4 text-sm">
            {coverLetterModal.content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}