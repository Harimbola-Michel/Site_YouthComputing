'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportToExcel } from '@/components/admin/ExportToExcel';
import { useRegistrationsData } from '@/hooks/useRegistrationsData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';

interface ExportButtonProps {
  onExport?: () => void;
  className?: string;
}

export function ExportButton({ onExport, className }: ExportButtonProps) {
  const { data, loading, error } = useRegistrationsData();
  const [isExporting, setIsExporting] = useState(false);

  const columns = [
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'status', label: 'Statut' },
    { key: 'paymentStatus', label: 'Paiement' },
    { key: 'createdAt', label: "Date d'inscription" },
  ];

  const handleExport = () => {
    if (loading || error || !data || data.length === 0) {
      if (error) {
        toast.error('Impossible de récupérer les données pour l\'export');
      } else if (!data || data.length === 0) {
        toast.error('Aucune donnée à exporter');
      }
      return;
    }

    setIsExporting(true);
    // Le composant ExportToExcel effectue l'export
    // On peut appeler onExport après
    setTimeout(() => {
      setIsExporting(false);
      onExport?.();
      toast.success('Export effectué avec succès');
    }, 500);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${className}`}
            onClick={handleExport}
            disabled={loading || isExporting || !data || data.length === 0}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isExporting ? 'Export en cours...' : 'Exporter'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exporter toutes les inscriptions au format Excel</p>
        </TooltipContent>
      </Tooltip>
      {/* On place ExportToExcel en mode "caché" pour qu'il ne déclenche qu'au clic */}
      {data && data.length > 0 && (
        <div className="hidden">
          <ExportToExcel
            data={data}
            filename={`inscriptions_${new Date().toISOString().slice(0, 10)}`}
            columns={columns}
          />
        </div>
      )}
    </TooltipProvider>
  );
}