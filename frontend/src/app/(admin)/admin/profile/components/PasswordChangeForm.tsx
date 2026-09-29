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

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mot de passe actuel requis (minimum 6 caractères)'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit faire au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordChangeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      setSuccess(false);
      await users.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success('Mot de passe modifié avec succès ✅');
      reset();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur : vérifiez votre mot de passe actuel';
      toast.error(msg);
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
            {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
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
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
            {newPassword && newPassword.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Force : {newPassword.length < 8 ? '❌ Trop court (min 8)' : '✅ Ok'}
              </p>
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
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
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