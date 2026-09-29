'use client';

import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  data: any[];
  fields?: string[];
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error } = useToast();

  const exportData = useCallback(
    async (options: ExportOptions) => {
      setIsExporting(true);

      try {
        const { format, data, filename = 'export', fields } = options;

        // Filtrer les données selon les champs spécifiés
        let exportData = data;
        if (fields && fields.length > 0) {
          exportData = data.map((item) => {
            const newItem: Record<string, any> = {};
            fields.forEach((field) => {
              newItem[field] = item[field];
            });
            return newItem;
          });
        }

        let blob: Blob;
        let extension: string;

        switch (format) {
          case 'csv':
            blob = await generateCSV(exportData);
            extension = 'csv';
            break;
          case 'json':
            blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: 'application/json',
            });
            extension = 'json';
            break;
          default:
            throw new Error(`Format ${format} non supporté pour l'export`);
        }

        // Télécharger le fichier
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        success(`Export ${format.toUpperCase()} effectué avec succès`);
      } catch (err) {
        error(err instanceof Error ? err.message : 'Erreur lors de l\'export');
      } finally {
        setIsExporting(false);
      }
    },
    [success, error]
  );

  return {
    exportData,
    isExporting,
  };
}

// Helper pour générer un CSV
const generateCSV = async (data: any[]): Promise<Blob> => {
  if (data.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    })
  );

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
};