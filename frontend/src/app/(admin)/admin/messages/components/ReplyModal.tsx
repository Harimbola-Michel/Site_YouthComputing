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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Message } from '@/types/message.types';

const replySchema = z.object({
  replyContent: z.string().min(3, 'Le message de réponse est requis'),
});

type ReplyFormData = z.infer<typeof replySchema>;

interface ReplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  onReply: (id: string, content: string) => Promise<void>;
  onSuccess?: () => void;
}

export function ReplyModal({
  open,
  onOpenChange,
  message,
  onReply,
  onSuccess,
}: ReplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      replyContent: '',
    },
  });

  const onSubmit = async (data: ReplyFormData) => {
    if (!message) return;
    setIsSubmitting(true);
    try {
      await onReply(message.id, data.replyContent);
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Répondre au message</DialogTitle>
          <DialogDescription>
            Répondez au message de <strong>{message.name}</strong> ({message.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">Message original</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {message.message}
            </p>
            <p className="text-xs text-muted-foreground">
              Reçu le {formatDate(message.createdAt)}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="replyContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre réponse *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Écrivez votre réponse ici..."
                        rows={6}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Envoyer
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}