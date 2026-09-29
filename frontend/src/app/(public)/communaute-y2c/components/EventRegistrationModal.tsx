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
import { Loader2, CheckCircle, Calendar, MapPin, Clock, Users, AlertCircle } from 'lucide-react';
import { y2c } from '@/lib/api'; // ✅ Utiliser l'API Y2C
import toast from 'react-hot-toast';
import { formatDate, formatTime, cn } from '@/lib/utils';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (minimum 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
    maxParticipants?: number;
  } | null;
  onSuccess?: () => void;
}

export function EventRegistrationModal({
  open,
  onOpenChange,
  event,
  onSuccess,
}: EventRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!event) return;
    setIsSubmitting(true);
    setApiErrors({});

    // Nettoyer le numéro de téléphone
    const cleanPhone = data.phone.replace(/[^+\d]/g, '');

    try {
      // ✅ Utiliser l'API Y2C pour l'inscription
      await y2c.registerForEvent(event.id, {
        fullName: data.fullName,
        email: data.email,
        phone: cleanPhone,
      });

      setIsSuccess(true);
      reset();
      toast.success('Inscription réussie ! 🎉');
      onSuccess?.();
    } catch (error: any) {
      const responseData = error?.response?.data;
      const status = error?.response?.status;

      if (status === 422 && responseData?.errors) {
        const fieldErrors: Record<string, string> = {};
        if (Array.isArray(responseData.errors)) {
          responseData.errors.forEach((err: any) => {
            const field = err.field || err.param;
            const message = err.message || err.msg;
            if (field && message) {
              fieldErrors[field] = message;
              setError(field as any, { type: 'manual', message });
            }
          });
        } else if (typeof responseData.errors === 'object') {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            fieldErrors[field] = msg;
            setError(field as any, { type: 'manual', message: msg });
          });
        }
        setApiErrors(fieldErrors);
        toast.error('Veuillez corriger les erreurs du formulaire');
      } else {
        const msg = responseData?.message || 'Erreur lors de l\'inscription';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setIsSuccess(false);
      setApiErrors({});
      onOpenChange(false);
    }
  };

  if (!event) return null;

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 font-ubuntu text-xl font-semibold text-green-700 dark:text-green-400">
              Inscription confirmée !
            </h3>
            <p className="mt-2 text-muted-foreground">
              Vous êtes inscrit à <strong>{event.title}</strong>.
              <br />
              Vous recevrez un email de confirmation.
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-ubuntu text-xl">
            Inscription à l’événement
          </DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm border border-border/50">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                {formatTime(event.startDate)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                {event.location}
              </span>
            </div>
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Places disponibles : {event.maxParticipants}</span>
              </div>
            )}
          </div>

          {Object.keys(apiErrors).length > 0 && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Erreurs de validation :</p>
                <ul className="list-disc list-inside">
                  {Object.entries(apiErrors).map(([field, msg]) => (
                    <li key={field}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-medium">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                className={cn(errors.fullName && 'border-destructive')}
                placeholder="Votre nom et prénom"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={cn(errors.email && 'border-destructive')}
                placeholder="vous@exemple.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                className={cn(errors.phone && 'border-destructive')}
                placeholder="+261 34 12 345 67"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}