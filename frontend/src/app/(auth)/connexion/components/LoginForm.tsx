// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

// Schéma de validation avancé
const loginSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .min(1, 'L’email est requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Doit contenir au moins un caractère spécial'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const status = err.response?.status;
      let message = err.response?.data?.message || 'Email ou mot de passe incorrect';
      if (status === 429) {
        message = 'Trop de tentatives. Veuillez patienter quelques secondes.';
      } else if (status === 401) {
        message = 'Email ou mot de passe incorrect.';
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (field: 'email' | 'password') => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const isEmailValid = emailValue && !errors.email && touchedFields.email;
  const isPasswordValid = passwordValue && !errors.password && touchedFields.password;

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit(onSubmit)}
      className="relative space-y-6"
      noValidate
    >
      {/* Erreur globale */}
      <div aria-live="polite" aria-atomic="true" className="relative">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="relative overflow-hidden rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm"
              role="alert"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent animate-pulse" />
              <div className="relative flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive/70" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-1.5"
      >
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <Mail className="h-4 w-4 text-secondary" />
          Adresse email
        </Label>
        <motion.div
          animate={errors.email && touchedFields.email ? { x: [-10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className={`relative transition-all duration-300 rounded-xl border-2 ${
              errors.email && touchedFields.email
                ? 'border-destructive shadow-destructive/20'
                : focusedField === 'email'
                ? 'border-secondary shadow-secondary/20 shadow-lg scale-[1.01]'
                : 'border-input/50'
            }`}
          >
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              {...register('email')}
              onFocus={() => handleFocus('email')}
              onBlur={() => {
                handleBlur();
                trigger('email');
              }}
              className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isSubmitting}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {isEmailValid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
        </motion.div>
        <AnimatePresence>
          {errors.email && touchedFields.email && (
            <motion.p
              id="email-error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm text-destructive font-medium pl-1"
            >
              {errors.email.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-1.5"
      >
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
          <Lock className="h-4 w-4 text-secondary" />
          Mot de passe
        </Label>
        <motion.div
          animate={errors.password && touchedFields.password ? { x: [-10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div
            className={`relative transition-all duration-300 rounded-xl border-2 ${
              errors.password && touchedFields.password
                ? 'border-destructive shadow-destructive/20'
                : focusedField === 'password'
                ? 'border-secondary shadow-secondary/20 shadow-lg scale-[1.01]'
                : 'border-input/50'
            }`}
          >
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              onFocus={() => handleFocus('password')}
              onBlur={() => {
                handleBlur();
                trigger('password');
              }}
              className="h-14 pl-5 pr-14 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isSubmitting}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
              tabIndex={0}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {isPasswordValid && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
        </motion.div>
        <AnimatePresence>
          {errors.password && touchedFields.password && (
            <motion.p
              id="password-error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm text-destructive font-medium pl-1"
            >
              {errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center space-x-3">
          <Checkbox
            id="remember"
            {...register('remember')}
            disabled={isSubmitting}
            className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer select-none text-muted-foreground/80 hover:text-foreground transition-colors">
            Se souvenir de moi
          </Label>
        </div>
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm font-medium text-secondary/80 hover:text-secondary transition-colors hover:underline underline-offset-2"
        >
          Mot de passe oublié ?
        </Link>
      </motion.div>

      {/* Bouton */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          type="submit"
          size="lg"
          className="relative w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isSubmitting || !isValid}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Barres de progression */}
      <div className="flex justify-center gap-1 py-1">
        <motion.div
          className={`h-1 w-12 rounded-full transition-all duration-500 ${
            emailValue ? 'bg-secondary' : 'bg-muted-foreground/20'
          }`}
          animate={{ scaleX: emailValue ? 1 : 0.5 }}
        />
        <motion.div
          className={`h-1 w-12 rounded-full transition-all duration-500 ${
            passwordValue ? 'bg-secondary' : 'bg-muted-foreground/20'
          }`}
          animate={{ scaleX: passwordValue ? 1 : 0.5 }}
        />
      </div>
    </motion.form>
  );
}