'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface GenerateBadgeButtonProps {
  onSuccess?: () => void;
}

export function GenerateBadgeButton({ onSuccess }: GenerateBadgeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Appel à l'API pour générer les badges (génération en masse)
      const response = await api.post('/y2c/members/generate-badges');
      const result = response?.data?.data || response?.data || {};

      // Afficher le nombre de badges générés
      const count = result.count || result.generated || 0;
      toast.success(`${count} badge${count > 1 ? 's' : ''} généré${count > 1 ? 's' : ''} avec succès`);
      
      // Si besoin, recharger les membres pour mettre à jour les badges
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la génération des badges';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? 'Génération...' : 'Générer les badges'}
    </Button>
  );
}