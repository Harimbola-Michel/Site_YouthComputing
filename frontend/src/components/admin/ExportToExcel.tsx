'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Loader2, Download, Check } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ExportToExcelProps {
  data: any[];
  filename?: string;
  columns?: { key: string; label: string }[];
  onExport?: (format: 'csv' | 'xlsx' | 'json', data: any[]) => Promise<Blob>;
  className?: string;
}

export function ExportToExcel({
  data,
  filename = 'export',
  columns,
  onExport,
  className,
}: ExportToExcelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json'>('xlsx');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns?.map((c) => c.key) || []
  );
  const [customFilename, setCustomFilename] = useState(filename);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      let exportData = data;
      // Filtrer les colonnes si nécessaire
      if (selectedColumns.length > 0 && columns) {
        exportData = data.map((row) => {
          const newRow: any = {};
          selectedColumns.forEach((key) => {
            newRow[key] = row[key];
          });
          return newRow;
        });
      }

      const blob = onExport
        ? await onExport(selectedFormat, exportData)
        : await defaultExport(selectedFormat, exportData);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customFilename}.${selectedFormat === 'xlsx' ? 'xlsx' : selectedFormat === 'json' ? 'json' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportation réussie !');
      setIsOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'exportation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultExport = async (
    format: 'csv' | 'xlsx' | 'json',
    data: any[]
  ): Promise<Blob> => {
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
    }

    if (format === 'csv') {
      if (data.length === 0) return new Blob([''], { type: 'text/csv' });
      const headers = Object.keys(data[0]);
      const rows = data.map((row) =>
        headers.map((h) => String(row[h] ?? '')).join(',')
      );
      const content = [headers.join(','), ...rows].join('\n');
      return new Blob([content], { type: 'text/csv' });
    }

    // xlsx - utiliser une librairie comme xlsx
    // Pour l'exemple, on exporte en CSV
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = data.map((row) =>
      headers.map((h) => String(row[h] ?? '')).join(',')
    );
    const content = [headers.join(','), ...rows].join('\n');
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('gap-2', className)}>
            <FileSpreadsheet className="h-4 w-4" />
            Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel>Exporter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('csv');
              setIsOpen(true);
            }}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('xlsx');
              setIsOpen(true);
            }}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedFormat('json');
              setIsOpen(true);
            }}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-ubuntu">Exporter en {selectedFormat.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Personnalisez votre exportation avant de télécharger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Nom du fichier */}
            <div className="space-y-2">
              <Label htmlFor="filename">Nom du fichier</Label>
              <Input
                id="filename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="fichier"
              />
            </div>

            {/* Colonnes */}
            {columns && columns.length > 0 && (
              <div className="space-y-2">
                <Label>Colonnes à inclure</Label>
                <div className="flex flex-wrap gap-2">
                  {columns.map((col) => (
                    <div key={col.key} className="flex items-center gap-1">
                      <Checkbox
                        id={`col-${col.key}`}
                        checked={selectedColumns.includes(col.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColumns([...selectedColumns, col.key]);
                          } else {
                            setSelectedColumns(
                              selectedColumns.filter((k) => k !== col.key)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`col-${col.key}`} className="text-xs">
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg bg-secondary/10 p-3 text-xs text-muted-foreground">
              <p>{data.length} ligne(s) seront exportées.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleExport} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportation...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exporter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}