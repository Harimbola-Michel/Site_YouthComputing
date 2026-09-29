'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FormationImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function FormationImageUpload({ value, onChange, className }: FormationImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mise à jour du preview quand la valeur change
  useState(() => {
    if (value) setPreview(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPEG, PNG, GIF, WEBP ou SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L’image ne doit pas dépasser 5 Mo');
      return;
    }

    // Aperçu local
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Extraction robuste de l'URL
      const url = response.data?.data?.url || response.data?.url;
      if (url) {
        onChange(url);
        toast.success('Image téléchargée avec succès ✅');
      } else {
        throw new Error('URL non reçue du serveur');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error?.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(message);
      // Réinitialiser le preview si l'upload échoue
      setPreview(value || null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Image de la formation</Label>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Zone d’aperçu */}
        <div
          className={cn(
            'relative flex h-32 w-40 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-colors',
            preview ? 'border-solid border-primary/30' : 'hover:border-primary/50'
          )}
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Aperçu"
                fill
                className="rounded-lg object-cover"
                unoptimized={preview.startsWith('data:')}
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">Aucune image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Boutons et infos */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Téléchargement...' : 'Choisir une image'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            Formats : JPEG, PNG, GIF, WEBP, SVG – Max 5 Mo
          </p>
        </div>
      </div>
      {/* Champ caché pour la valeur (affiché en lecture seule) */}
      {value && (
        <p className="text-xs text-muted-foreground truncate">
          URL : {value}
        </p>
      )}
    </div>
  );
}