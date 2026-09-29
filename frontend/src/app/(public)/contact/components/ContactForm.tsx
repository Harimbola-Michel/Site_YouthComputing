'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contact } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Schéma de validation ──────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  subject: z.string().min(3, 'Le sujet est requis (minimum 3 caractères)'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Composant ──────────────────────────────────────────────
export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await contact.send(data);
      setIsSuccess(true);
      reset();
      toast.success('Message envoyé avec succès !');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’envoi du message';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── État de succès ──────────────────────────────────────
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 border-green-500/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-6 font-ubuntu text-2xl font-semibold text-green-700 dark:text-green-400">
              Message envoyé !
            </h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setIsSuccess(false);
                reset();
              }}
            >
              Envoyer un autre message
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-2 border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="font-ubuntu text-xl flex items-center gap-2">
          <Send className="h-5 w-5 text-secondary" />
          Envoyez-nous un message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nom et Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
                placeholder="Votre nom"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
                placeholder="vous@exemple.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-1">
              Sujet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              {...register('subject')}
              className={errors.subject ? 'border-destructive' : ''}
              disabled={isLoading}
              placeholder="Objet de votre message"
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-1">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              {...register('message')}
              rows={6}
              className={errors.message ? 'border-destructive' : ''}
              disabled={isLoading}
              placeholder="Décrivez votre demande en détail..."
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Message d'erreur global */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton d'envoi */}
          <Button
            type="submit"
            className="w-full gap-2 shadow-md hover:shadow-lg transition-shadow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer le message
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Champs obligatoires. Nous vous répondrons dans les 48h.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}