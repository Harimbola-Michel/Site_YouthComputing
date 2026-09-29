// src/components/formations/RegistrationForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// Si lottie-react n'est pas installé, vous pouvez commenter ou remplacer par une image statique
// import Lottie from 'lottie-react';
// import successAnimation from '@/public/animations/success.json';
// import loadingAnimation from '@/public/animations/loading.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { registrations } from '@/lib/api';
import toast from 'react-hot-toast';

// Schéma de validation
const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  motivation: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  formationId: string;
  sessionId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function RegistrationForm({
  formationId,
  sessionId,
  onSuccess,
  className,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      motivation: '',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ Appel API réel vers le backend
      const payload = {
        ...data,
        formationId,
        sessionId: sessionId || undefined,
      };
      const response = await registrations.create(payload);

      // Succès – afficher le message de confirmation
      setIsSuccess(true);
      reset();
      toast.success('Inscription réussie ! Un email de confirmation vous a été envoyé.');
      onSuccess?.();
    } catch (err: any) {
      // Gestion des erreurs
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de succès (sans Lottie pour éviter l'erreur de module)
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-8 dark:bg-green-950/20"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-ubuntu mt-4 text-xl font-semibold text-green-700 dark:text-green-400">
          Inscription confirmée !
        </h3>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Vous recevrez un email de confirmation sous 48h avec tous les détails pratiques.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setIsSuccess(false);
            reset();
          }}
        >
          S'inscrire à une autre formation
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className={cn('border-2 border-primary/10 shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="font-ubuntu text-xl">Inscription à la formation</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour vous inscrire.
          Tous les champs marqués d'un <span className="text-destructive">*</span> sont obligatoires.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Jean"
                className={errors.firstName ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Dupont"
                className={errors.lastName ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="jean.dupont@email.com"
              className={errors.email ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+261 34 00 000 00"
              className={errors.phone ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Motivation (optionnel)</Label>
            <Textarea
              id="motivation"
              {...register('motivation')}
              rows={3}
              placeholder="Dites-nous pourquoi vous souhaitez suivre cette formation..."
              disabled={isSubmitting}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-destructive"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            * Champs obligatoires
          </p>
          <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}