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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle } from 'lucide-react';
import { partners } from '@/lib/api';
import toast from 'react-hot-toast';

const requestSchema = z.object({
  companyName: z.string().min(2, 'Le nom de l’entreprise est requis (minimum 2 caractères)'),
  contactName: z.string().min(2, 'Le nom du contact est requis (minimum 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface PartnerRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PartnerRequestModal({ open, onOpenChange }: PartnerRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      await partners.requestPartnership(data);
      setIsSuccess(true);
      reset();
      toast.success('Demande de partenariat envoyée ✅');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’envoi';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 font-ubuntu text-xl font-semibold text-green-700 dark:text-green-400">
              Demande envoyée !
            </h3>
            <p className="mt-2 text-muted-foreground">
              Nous avons bien reçu votre demande. Nous vous répondrons dans les plus brefs délais.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-ubuntu text-xl">Devenir partenaire</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour rejoindre notre réseau de partenaires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Entreprise *</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                className={errors.companyName ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact *</Label>
              <Input
                id="contactName"
                {...register('contactName')}
                className={errors.contactName ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.contactName && <p className="text-sm text-destructive">{errors.contactName.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web (optionnel)</Label>
            <Input
              id="website"
              {...register('website')}
              disabled={isSubmitting}
              placeholder="https://monentreprise.com"
            />
            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register('message')}
              rows={4}
              className={errors.message ? 'border-destructive' : ''}
              disabled={isSubmitting}
              placeholder="Décrivez votre projet et les raisons de votre demande..."
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer la demande'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}