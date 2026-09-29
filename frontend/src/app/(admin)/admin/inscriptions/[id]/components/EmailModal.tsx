'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from '@/components/ui/input';
import { Loader2, Send, Mail, User, CreditCard } from 'lucide-react';
import { registrations } from '@/lib/api';
import toast from 'react-hot-toast';

const emailSchema = z.object({
  to: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Le sujet est requis'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: any;
  onSuccess?: () => void;
}

export function EmailModal({ open, onOpenChange, registration, onSuccess }: EmailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Générer un template d'email professionnel
  const generateTemplate = () => {
    const statusLabels: Record<string, string> = {
      PENDING: 'en attente de validation',
      CONFIRMED: 'confirmée',
      CANCELLED: 'annulée',
      COMPLETED: 'terminée',
      WAITING_LIST: "en liste d'attente",
    };
    const paymentLabels: Record<string, string> = {
      PENDING: 'en attente de paiement',
      PAID: 'payé',
      FAILED: 'échoué',
      REFUNDED: 'remboursé',
      PARTIAL: 'partiel',
    };

    const statusLabel = statusLabels[registration.status] || registration.status;
    const paymentLabel = paymentLabels[registration.paymentStatus] || registration.paymentStatus;
    const formationTitle = registration.Formation?.title || registration.formation?.title || 'la formation';
    const amount = registration.paymentAmount
      ? `${registration.paymentAmount.toLocaleString()} Ar`
      : 'gratuit';

    return `
Bonjour ${registration.firstName} ${registration.lastName},

Nous vous remercions pour votre inscription à la formation "${formationTitle}".

📌 Récapitulatif de votre inscription :
- Statut : ${statusLabel}
- Paiement : ${paymentLabel}
- Montant : ${amount}
- Référence : ${registration.paymentReference || 'Non renseignée'}

${
  registration.status === 'CONFIRMED'
    ? '✅ Votre inscription est confirmée. Nous vous attendons avec plaisir !'
    : registration.status === 'PENDING'
    ? '⏳ Votre inscription est en cours de traitement. Vous serez informé dès qu\'elle sera validée.'
    : registration.status === 'CANCELLED'
    ? '❌ Votre inscription a été annulée. N\'hésitez pas à nous contacter pour plus d\'informations.'
    : ''
}

${
  registration.paymentStatus === 'PAID'
    ? '💰 Nous avons bien reçu votre paiement. Merci !'
    : registration.paymentStatus === 'PENDING'
    ? '💳 Un paiement est en attente. Veuillez finaliser votre paiement pour valider votre inscription.'
    : ''
}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
L'équipe Youth Computing
📧 contact@youthcomputing.org
📞 +261 34 12 345 67
    `;
  };

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: registration?.email || '',
      subject: `[Youth Computing] Votre inscription à la formation`,
      message: generateTemplate(),
    },
  });

  // Mettre à jour le template si les données de registration changent
  useState(() => {
    if (registration) {
      form.setValue('to', registration.email);
      form.setValue('subject', `[Youth Computing] Votre inscription à la formation`);
      form.setValue('message', generateTemplate());
    }
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      await registrations.sendEmail(registration.id, {
        to: data.to,
        subject: data.subject,
        message: data.message,
      });
      toast.success('Email envoyé avec succès 📧');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
            <Send className="h-5 w-5 text-secondary" />
            Envoyer un email
          </DialogTitle>
          <DialogDescription>
            Envoyez un email à <strong>{registration?.firstName} {registration?.lastName}</strong> concernant le statut de son inscription.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Destinataire *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Message *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={12}
                      className="font-mono text-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Utilisez les informations de l'inscription pour personnaliser le message.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
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
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}