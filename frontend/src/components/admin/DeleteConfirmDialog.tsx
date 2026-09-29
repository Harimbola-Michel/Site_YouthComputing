'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  confirmText = 'Supprimer',
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const [confirmation, setConfirmation] = useState('');

  const handleConfirm = async () => {
    if (confirmation.toLowerCase() !== 'supprimer') return;
    await onConfirm();
    setConfirmation('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="font-ubuntu">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description}
            <br />
            <span className="font-semibold text-foreground">"{itemName}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Cette action est irréversible.</p>
            <p className="mt-1 text-muted-foreground">
              Toutes les données associées seront supprimées définitivement.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Tapez <span className="font-bold text-destructive">supprimer</span> pour confirmer
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="supprimer"
              className="font-mono"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmation('');
            }}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmation.toLowerCase() !== 'supprimer' || isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Suppression...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}