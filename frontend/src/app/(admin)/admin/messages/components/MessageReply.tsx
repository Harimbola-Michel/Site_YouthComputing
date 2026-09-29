'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { contact } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ✅ Schéma aligné sur le backend (champ 'content')
const replySchema = z.object({
  content: z.string().min(3, 'La réponse doit contenir au moins 3 caractères'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface MessageReplyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: any;
  onSuccess: () => void;
}

export function MessageReply({ open, onOpenChange, message, onSuccess }: MessageReplyProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
  });

  const onSubmit = async (data: ReplyFormData) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await contact.reply(message.id, data);
      reset();
      onSuccess();
    } catch (error: any) {
      // Traitement des erreurs de validation (422)
      const responseData = error?.response?.data;
      const status = error?.response?.status;

      if (status === 422 && responseData?.errors) {
        // Afficher les erreurs de validation dans le formulaire
        if (Array.isArray(responseData.errors)) {
          responseData.errors.forEach((err: any) => {
            if (err.field === 'content') {
              setError('content', { type: 'manual', message: err.message });
            } else {
              toast.error(`${err.field}: ${err.message}`);
            }
          });
        } else if (typeof responseData.errors === 'object') {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            if (field === 'content' && Array.isArray(messages)) {
              setError('content', { type: 'manual', message: messages[0] });
            } else if (Array.isArray(messages)) {
              toast.error(`${field}: ${messages[0]}`);
            }
          });
        } else {
          setApiError(responseData?.message || 'Données invalides');
        }
      } else {
        const msg = responseData?.message || 'Erreur lors de l\'envoi de la réponse';
        setApiError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setApiError(null);
    }
    onOpenChange(open);
  };

  // Gestion du raccourci clavier (Ctrl+Enter / Cmd+Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Répondre à</span>
            <span className="text-secondary">{message?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Vous répondez au message reçu de <strong>{message?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message original */}
          <div className="rounded-lg bg-muted/30 p-3 text-sm border border-border/50">
            <p className="font-medium text-muted-foreground">Message original :</p>
            <p className="text-foreground whitespace-pre-wrap mt-1">
              {message?.message}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Erreur API globale */}
            {apiError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-2">
                Votre réponse <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground font-normal">
                  (Ctrl+Enter pour envoyer)
                </span>
              </Label>
              <Textarea
                id="content"
                rows={6}
                {...register('content')}
                onKeyDown={handleKeyDown}
                className={cn(
                  'resize-none transition-colors',
                  errors.content ? 'border-destructive focus-visible:ring-destructive' : ''
                )}
                placeholder="Rédigez votre réponse ici..."
                disabled={isSubmitting}
              />
              {errors.content && (
                <p className="text-sm text-destructive font-medium">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[120px] bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <span>Envoyer</span>
                    <span className="text-xs opacity-70">(Ctrl+Enter)</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}