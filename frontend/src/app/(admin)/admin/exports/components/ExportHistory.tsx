'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, FileIcon, Download, Trash2, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportHistoryItem } from '@/types/export.types';
import toast from 'react-hot-toast';
import { exports } from '@/lib/api';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ExportHistoryProps {
  history: ExportHistoryItem[];
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const typeLabels: Record<string, string> = {
  registrations: 'Inscriptions',
  members: 'Membres Y2C',
  payments: 'Paiements',
  formations: 'Formations',
  projects: 'Projets',
  articles: 'Articles',
};

const formatLabels: Record<string, string> = {
  csv: 'CSV',
  excel: 'Excel',
  pdf: 'PDF',
};

const statusConfig = {
  completed: { label: 'Réussi', color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: CheckCircle },
  failed: { label: 'Échec', color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle },
  pending: { label: 'En cours', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
};

export function ExportHistory({ history, onRefresh, onDelete, loading = false }: ExportHistoryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (id: string, filename?: string) => {
    setDownloadingId(id);
    try {
      const response = await exports.downloadById(id);
      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers?.['content-disposition'];
      let downloadFilename = filename || `export-${id}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          downloadFilename = match[1].replace(/['"]/g, '');
        }
      }
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Fichier téléchargé ✅');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors du téléchargement');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet export ?')) return;
    setDeletingId(id);
    try {
      await exports.delete(id);
      toast.success('Export supprimé');
      onDelete?.(id);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  if (history.length === 0) {
    return (
      <Card className="border-2 border-dashed border-primary/10">
        <CardHeader>
          <CardTitle className="font-ubuntu text-xl flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-secondary" />
            Historique des exports
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/30 p-4 mb-4">
            <FileIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Aucun export effectué</p>
          <p className="text-sm text-muted-foreground">Les exports apparaîtront ici une fois lancés</p>
          {onRefresh && (
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
        <div className="flex items-center justify-between">
          <CardTitle className="font-ubuntu text-xl flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-secondary" />
            Historique des exports
            <Badge variant="secondary" className="ml-2">
              {history.length}
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Actualiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Format</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Fichier</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => {
                const StatusIcon = statusConfig[item.status]?.icon || XCircle;
                const status = statusConfig[item.status] || statusConfig.failed;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {typeLabels[item.type] || item.type}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-[10px] font-mono">
                        {formatLabels[item.format] || item.format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1 text-[10px] font-medium', status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.status === 'completed' && item.filename ? (
                        <span className="text-sm text-muted-foreground truncate max-w-[180px] block font-mono">
                          {item.filename}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-secondary transition-colors"
                            onClick={() => handleDownload(item.id, item.filename)}
                            disabled={downloadingId === item.id}
                            title="Télécharger"
                          >
                            {downloadingId === item.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Supprimer"
                        >
                          {deletingId === item.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}