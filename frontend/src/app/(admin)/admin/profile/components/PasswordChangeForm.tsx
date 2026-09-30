'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mêmes règles que le backend (changePasswordValidator)
const strongPassword = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial');

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: '8 caractères minimum', test: (v) => v.length >= 8 },
  { label: 'Une majuscule', test: (v) => /[A-Z]/.test(v) },
  { label: 'Une minuscule', test: (v) => /[a-z]/.test(v) },
  { label: 'Un chiffre', test: (v) => /[0-9]/.test(v) },
  { label: 'Un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function PasswordChangeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword') || '';

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      setSuccess(false);
      await users.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      toast.success('Mot de passe modifié avec succès ✅');
      reset();
    } catch (error: any) {
      // Erreurs de validation renvoyées par le serveur (422)
      const fieldErrors = error?.formattedErrors as Record<string, string[]> | undefined;
      let handled = false;

      if (fieldErrors) {
        (Object.keys(fieldErrors) as string[]).forEach((field) => {
          if (
            (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') &&
            fieldErrors[field]?.[0]
          ) {
            setError(field, { type: 'server', message: fieldErrors[field][0] });
            handled = true;
          }
        });
      }

      if (!handled) {
        const first = fieldErrors && Object.values(fieldErrors)[0]?.[0];
        toast.error(
          first || error?.response?.data?.message || 'Erreur : vérifiez votre mot de passe actuel'
        );
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-5 w-5 text-secondary" />
          Changer mon mot de passe
        </CardTitle>
      </CardHeader>
      <Separator />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Votre mot de passe a été modifié avec succès.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              className={errors.currentPassword ? 'border-destructive' : ''}
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              className={errors.newPassword ? 'border-destructive' : ''}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
            {newPassword.length > 0 && (
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {RULES.map((rule) => (
                  <li key={rule.label}>
                    {rule.test(newPassword) ? '✅' : '❌'} {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <Separator />
        <CardFooter className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="gap-2 min-w-[160px]">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'En cours...' : 'Changer le mot de passe'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default PasswordChangeForm;