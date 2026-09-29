'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      await auth.forgotPassword(data.email);
      setIsSent(true);
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-2xl bg-background/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-4 pt-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/5 to-secondary/15 p-1 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-background/50">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Mail className="h-10 w-10 text-secondary" />
              </motion.div>
            </div>
          </div>
          <CardTitle className="font-ubuntu text-2xl font-bold text-foreground">
            Mot de passe oublié
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            {isSent
              ? "Un email de réinitialisation vous a été envoyé"
              : "Saisissez votre email pour recevoir un lien de réinitialisation"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <AnimatePresence mode="wait">
            {isSent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 text-center"
              >
                <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-6 border border-green-200 dark:border-green-800/30">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Email envoyé avec succès !
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vérifiez votre boîte mail. Vous devriez recevoir un lien sous quelques minutes.
                  </p>
                </div>
                <Button asChild className="w-full gap-2">
                  <Link href="/connexion">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground/80 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-secondary" />
                    Adresse email
                  </Label>
                  <div
                    className={`relative transition-all duration-300 rounded-xl border-2 ${
                      errors.email
                        ? 'border-destructive shadow-destructive/20'
                        : isFocused
                        ? 'border-secondary shadow-secondary/20 shadow-lg'
                        : 'border-input/50'
                    }`}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      {...register('email')}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      disabled={isLoading}
                    />
                    {emailValue && !errors.email && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-destructive font-medium pl-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="relative w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 overflow-hidden group"
                    disabled={isLoading}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <span>Envoyer le lien</span>
                          <svg
                            className="h-5 w-5 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                <div className="text-center">
                  <Link
                    href="/connexion"
                    className="text-sm text-muted-foreground/60 hover:text-secondary transition-colors hover:underline underline-offset-2"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}