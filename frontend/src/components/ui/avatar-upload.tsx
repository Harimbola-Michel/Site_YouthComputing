// src/components/ui/avatar-upload.tsx
'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  name?: string;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  isUploading = false,
  name = 'Utilisateur',
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPEG, PNG, GIF ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onUpload(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const removeAvatar = () => {
    setPreview(null);
    // Optionnel : appeler une API pour supprimer l'avatar
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={preview} alt={name} />
              <AvatarFallback className="text-2xl">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeAvatar(); }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-12 w-12 text-muted-foreground/50" />
            <span className="font-medium">Glissez-déposez une image ici</span>
            <span className="text-sm">ou cliquez pour parcourir</span>
            <span className="text-xs text-muted-foreground/70">JPEG, PNG, GIF, WEBP – Max 5 Mo</span>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Téléchargement en cours...
        </div>
      )}
    </div>
  );
}