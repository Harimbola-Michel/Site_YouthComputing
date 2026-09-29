'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  FileSpreadsheet,
  FileText,
  File,
  Download,
  Users,
  GraduationCap,
  CreditCard,
  Briefcase,
  Calendar,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ExportOptionsProps {
  onExport: (type: string, format: string) => void;
  loading: boolean;
}

const exportTypes = [
  { id: 'registrations', label: 'Inscriptions', icon: <Calendar className="h-5 w-5" />, description: 'Liste des inscriptions aux formations', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
  { id: 'members', label: 'Membres Y2C', icon: <Users className="h-5 w-5" />, description: 'Membres de la communauté Y2C', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' },
  { id: 'payments', label: 'Paiements', icon: <CreditCard className="h-5 w-5" />, description: 'Historique des paiements', color: 'bg-amber-500/10 border-amber-500/20 text-amber-600' },
  { id: 'formations', label: 'Formations', icon: <GraduationCap className="h-5 w-5" />, description: 'Catalogue des formations', color: 'bg-purple-500/10 border-purple-500/20 text-purple-600' },
  { id: 'projects', label: 'Projets', icon: <Briefcase className="h-5 w-5" />, description: 'Projets communautaires', color: 'bg-rose-500/10 border-rose-500/20 text-rose-600' },
  { id: 'articles', label: 'Articles', icon: <FileText className="h-5 w-5" />, description: 'Articles du blog', color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600' },
];

const formats = [
  { id: 'csv', label: 'CSV', icon: <FileText className="h-4 w-4" />, description: 'Tableur (séparateur ;)', color: 'bg-green-500/10 border-green-500/30 text-green-600' },
  { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'Fichier Excel (.xlsx)', color: 'bg-blue-500/10 border-blue-500/30 text-blue-600' },
  { id: 'pdf', label: 'PDF', icon: <File className="h-4 w-4" />, description: 'Document PDF imprimable', color: 'bg-red-500/10 border-red-500/30 text-red-600' },
];

export function ExportOptions({ onExport, loading }: ExportOptionsProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleExport = () => {
    if (!selectedType || !selectedFormat) {
      toast.error('Veuillez sélectionner un type et un format');
      return;
    }
    onExport(selectedType, selectedFormat);
  };

  const isDisabled = loading || !selectedType || !selectedFormat;

  const selectedTypeData = exportTypes.find(t => t.id === selectedType);
  const selectedFormatData = formats.find(f => f.id === selectedFormat);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background/95 to-secondary/5 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary/10 p-2 text-secondary">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-ubuntu text-2xl font-bold">Exporter des données</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les données à exporter et le format souhaité
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* ─── Étape 1 : Type ────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold shadow-md">
              1
            </span>
            <h3 className="font-medium text-foreground">Choisissez les données à exporter</h3>
            {selectedType && (
              <Badge variant="secondary" className="ml-auto bg-secondary/10 text-secondary">
                {selectedTypeData?.label}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {exportTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'border-secondary bg-secondary/5 shadow-md ring-2 ring-secondary/20'
                      : 'border-border/50 bg-card/50 hover:border-secondary/30 hover:bg-secondary/5',
                    type.color
                  )}
                  aria-pressed={isSelected}
                >
                  <div className={cn(
                    'rounded-full p-2.5 transition-colors',
                    isSelected ? 'bg-secondary text-white' : 'bg-muted/30 text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary'
                  )}>
                    {type.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 rounded-full bg-secondary p-0.5 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedType && (
            <p className="mt-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2 px-3">
              <span className="font-medium">{selectedTypeData?.label}</span> : {selectedTypeData?.description}
            </p>
          )}
        </div>

        <Separator />

        {/* ─── Étape 2 : Format ────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold shadow-md">
              2
            </span>
            <h3 className="font-medium text-foreground">Choisissez le format</h3>
            {selectedFormat && (
              <Badge variant="secondary" className="ml-auto bg-secondary/10 text-secondary">
                {selectedFormatData?.label}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {formats.map((format) => {
              const isSelected = selectedFormat === format.id;
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border-2 px-5 py-3 transition-all duration-200 hover:shadow-sm',
                    isSelected
                      ? 'border-secondary bg-secondary/5 shadow-md ring-2 ring-secondary/20'
                      : 'border-border/50 bg-card/50 hover:border-secondary/30 hover:bg-secondary/5',
                    format.color
                  )}
                  aria-pressed={isSelected}
                >
                  <div className={cn(
                    'rounded-full p-1.5 transition-colors',
                    isSelected ? 'bg-secondary text-white' : 'text-muted-foreground group-hover:text-secondary'
                  )}>
                    {format.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{format.label}</span>
                    <span className="text-xs text-muted-foreground">{format.description}</span>
                  </div>
                  {isSelected && (
                    <div className="ml-auto rounded-full bg-secondary p-0.5 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ─── Bouton d'export ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="text-sm text-muted-foreground">
            {selectedType && selectedFormat ? (
              <span className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Export des <strong className="text-foreground">{selectedTypeData?.label}</strong> en{' '}
                <strong className="text-foreground uppercase">{selectedFormat}</strong> prêt
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                Sélectionnez un <strong>type</strong> et un <strong>format</strong> pour commencer
              </span>
            )}
          </div>

          <Button
            onClick={handleExport}
            disabled={isDisabled}
            className={cn(
              'gap-2 min-w-[180px] transition-all duration-300 font-medium',
              !isDisabled && 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-[1.02] active:scale-95'
            )}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}