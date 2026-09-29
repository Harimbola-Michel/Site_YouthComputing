'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Key, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/api';
import toast from 'react-hot-toast';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre')
      .regex(/[@$!%*?&]/, 'Doit contenir un caractère spécial'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState<{ password: boolean; confirm: boolean }>({
    password: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      await auth.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès');
      setTimeout(() => router.push('/connexion'), 3000);
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field: 'password' | 'confirm') => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'password' | 'confirm') => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
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
                <Key className="h-10 w-10 text-secondary" />
              </motion.div>
            </div>
          </div>
          <CardTitle className="font-ubuntu text-2xl font-bold text-foreground">
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            {isSuccess
              ? 'Votre mot de passe a été réinitialisé avec succès'
              : 'Définissez un nouveau mot de passe'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 text-center"
              >
                <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-6 border border-green-200 dark:border-green-800/30">
                  <div className="flex justify-center mb-3">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✅ Mot de passe modifié avec succès
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous allez être redirigé vers la page de connexion.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/connexion">Se connecter</Link>
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
                {/* Champ Nouveau mot de passe */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground/80 flex items-center gap-2"
                  >
                    <Key className="h-4 w-4 text-secondary" />
                    Nouveau mot de passe
                  </Label>
                  <div
                    className={`relative transition-all duration-300 rounded-xl border-2 ${
                      errors.password
                        ? 'border-destructive shadow-destructive/20'
                        : isFocused.password
                        ? 'border-secondary shadow-secondary/20 shadow-lg'
                        : 'border-input/50'
                    }`}
                  >
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                      className="h-14 pl-5 pr-14 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-destructive font-medium pl-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                  {password && password.length > 0 && (
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        <span className={password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}>
                          {password.length >= 8 ? '✅' : '⬜'} 8 caractères
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                          {/[A-Z]/.test(password) ? '✅' : '⬜'} Majuscule
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={/[a-z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                          {/[a-z]/.test(password) ? '✅' : '⬜'} Minuscule
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={/[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                          {/[0-9]/.test(password) ? '✅' : '⬜'} Chiffre
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={/[@$!%*?&]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                          {/[@$!%*?&]/.test(password) ? '✅' : '⬜'} Caractère spécial
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Champ Confirmation */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground/80 flex items-center gap-2"
                  >
                    <Key className="h-4 w-4 text-secondary" />
                    Confirmer le mot de passe
                  </Label>
                  <div
                    className={`relative transition-all duration-300 rounded-xl border-2 ${
                      errors.confirmPassword
                        ? 'border-destructive shadow-destructive/20'
                        : isFocused.confirm
                        ? 'border-secondary shadow-secondary/20 shadow-lg'
                        : 'border-input/50'
                    }`}
                  >
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      onFocus={() => handleFocus('confirm')}
                      onBlur={() => handleBlur('confirm')}
                      className="h-14 pl-5 pr-14 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-destructive font-medium pl-1"
                    >
                      {errors.confirmPassword.message}
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
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        <>
                          <span>Réinitialiser le mot de passe</span>
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
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}