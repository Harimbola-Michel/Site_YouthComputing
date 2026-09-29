'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { buildImageUrl } from '@/lib/imageUtils'; // ✅ Import

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  name: string;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  isUploading = false,
  name,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L’image ne doit pas dépasser 5 Mo');
      e.target.value = '';
      return;
    }

    setPreview(URL.createObjectURL(file));
    await onUpload(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Construction de l'URL de l'avatar existant
  const avatarSrc = currentAvatar ? buildImageUrl(currentAvatar, true) : null;
  // ✅ Afficher la prévisualisation si disponible, sinon l'avatar existant
  const displaySrc = preview || avatarSrc;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/40">
          <AvatarImage src={displaySrc || undefined} alt={name} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary">
            {name
              .split(' ')
              .map((n) => n.charAt(0).toUpperCase())
              .join('')
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="h-4 w-4 text-primary-foreground" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Téléchargement en cours...
        </div>
      )}
      {displaySrc && !isUploading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="gap-1 text-xs text-destructive hover:text-destructive/80"
        >
          <X className="h-3 w-3" />
          Supprimer l'avatar
        </Button>
      )}
    </div>
  );
}