// src/components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Key,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Le prénom est requis (minimum 2 caractères)'),
    lastName: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
    email: z.string().email('Adresse email invalide'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre')
      .regex(/[@$!%*?&]/, 'Doit contenir un caractère spécial'),
    confirmPassword: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth(); // ← le contexte gère l'appel API et le stockage
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const email = watch('email');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Le contexte s'occupe de l'appel API, du stockage des tokens et de la mise à jour de l'utilisateur
      await registerUser(data);
      toast.success('Inscription réussie ! Bienvenue chez Youth Computing 🎉', {
        duration: 5000,
      });
      router.push('/connexion');
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur lors de l'inscription";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field: keyof typeof isFocused) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof isFocused) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const allFieldsFilled = !!firstName && !!lastName && !!email && !!password && !!confirmPassword;

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Message d'erreur animé */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent animate-pulse" />
            <div className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-destructive/70" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prénom et Nom */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Prénom */}
        <div className="space-y-1.5">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium text-foreground/80 flex items-center gap-2"
          >
            <User className="h-4 w-4 text-secondary" />
            Prénom
          </Label>
          <div
            className={`relative transition-all duration-300 rounded-xl border-2 ${
              errors.firstName
                ? 'border-destructive shadow-destructive/20'
                : isFocused.firstName
                ? 'border-secondary shadow-secondary/20 shadow-lg'
                : 'border-input/50'
            }`}
          >
            <Input
              id="firstName"
              type="text"
              placeholder="Jean"
              {...register('firstName')}
              onFocus={() => handleFocus('firstName')}
              onBlur={() => handleBlur('firstName')}
              className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
            {firstName && !errors.firstName && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {errors.firstName && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-destructive font-medium pl-1"
            >
              {errors.firstName.message}
            </motion.p>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <Label
            htmlFor="lastName"
            className="text-sm font-medium text-foreground/80 flex items-center gap-2"
          >
            <User className="h-4 w-4 text-secondary" />
            Nom
          </Label>
          <div
            className={`relative transition-all duration-300 rounded-xl border-2 ${
              errors.lastName
                ? 'border-destructive shadow-destructive/20'
                : isFocused.lastName
                ? 'border-secondary shadow-secondary/20 shadow-lg'
                : 'border-input/50'
            }`}
          >
            <Input
              id="lastName"
              type="text"
              placeholder="Rakoto"
              {...register('lastName')}
              onFocus={() => handleFocus('lastName')}
              onBlur={() => handleBlur('lastName')}
              className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
            {lastName && !errors.lastName && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          {errors.lastName && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-destructive font-medium pl-1"
            >
              {errors.lastName.message}
            </motion.p>
          )}
        </div>
      </div>

      {/* Email */}
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
              : isFocused.email
              ? 'border-secondary shadow-secondary/20 shadow-lg'
              : 'border-input/50'
          }`}
        >
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            {...register('email')}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
          {email && !errors.email && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
              <CheckCircle className="h-5 w-5" />
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

      {/* Téléphone (optionnel) */}
      <div className="space-y-1.5">
        <Label
          htmlFor="phone"
          className="text-sm font-medium text-foreground/80 flex items-center gap-2"
        >
          <Phone className="h-4 w-4 text-secondary" />
          Téléphone <span className="text-xs text-muted-foreground/50">(optionnel)</span>
        </Label>
        <div
          className={`relative transition-all duration-300 rounded-xl border-2 ${
            isFocused.phone ? 'border-secondary shadow-secondary/20 shadow-lg' : 'border-input/50'
          }`}
        >
          <Input
            id="phone"
            type="tel"
            placeholder="+261 34 12 34 567"
            {...register('phone')}
            onFocus={() => handleFocus('phone')}
            onBlur={() => handleBlur('phone')}
            className="h-14 pl-5 pr-12 text-base bg-transparent border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground/80 flex items-center gap-2"
        >
          <Lock className="h-4 w-4 text-secondary" />
          Mot de passe
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
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
        {/* Indicateur de force du mot de passe */}
        {password && password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 bg-muted/30 rounded-lg p-3"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}>
                {password.length >= 8 ? '✅' : '⬜'}
              </span>
              <span className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                8 caractères
              </span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                {/[A-Z]/.test(password) ? '✅' : '⬜'}
              </span>
              <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                Majuscule
              </span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={/[a-z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                {/[a-z]/.test(password) ? '✅' : '⬜'}
              </span>
              <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                Minuscule
              </span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={/[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                {/[0-9]/.test(password) ? '✅' : '⬜'}
              </span>
              <span className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                Chiffre
              </span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={/[@$!%*?&]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                {/[@$!%*?&]/.test(password) ? '✅' : '⬜'}
              </span>
              <span className={/[@$!%*?&]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                Caractère spécial
              </span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Confirmation mot de passe */}
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

      {/* Bouton d'inscription */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="pt-2"
      >
        <Button
          type="submit"
          size="lg"
          className="relative w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 overflow-hidden group"
          disabled={isLoading || !allFieldsFilled}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              <>
                <span>Créer mon compte</span>
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

      {/* Indicateur de progression */}
      <div className="flex justify-center gap-1 py-1">
        {['firstName', 'lastName', 'email', 'password', 'confirm'].map((field, index) => {
          const isFilled = watch(field as any);
          const isError = errors[field as keyof typeof errors];
          return (
            <div
              key={field}
              className={`h-1 w-8 rounded-full transition-all duration-500 ${
                isFilled && !isError
                  ? 'bg-secondary'
                  : isFilled && isError
                  ? 'bg-destructive'
                  : 'bg-muted-foreground/20'
              }`}
            />
          );
        })}
      </div>

      {/* Lien vers connexion */}
      <div className="text-center pt-1">
        <p className="text-sm text-muted-foreground/80">
          Déjà un compte ?{' '}
          <Link
            href="/connexion"
            className="font-semibold text-secondary hover:text-secondary/80 transition-colors hover:underline underline-offset-2"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </motion.form>
  );
}