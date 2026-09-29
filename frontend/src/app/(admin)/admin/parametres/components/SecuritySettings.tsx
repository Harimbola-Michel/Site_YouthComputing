'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Clock, Key, Database, Save, RefreshCw } from 'lucide-react';
import { useSettings } from './SettingsProvider';
import toast from 'react-hot-toast';

const securitySchema = z.object({
  sessionTimeout: z.coerce.number().min(5).max(1440),
  maxLoginAttempts: z.coerce.number().min(1).max(20),
  passwordMinLength: z.coerce.number().min(6).max(32),
  twoFactorAuth: z.boolean().default(false),
  sslRequired: z.boolean().default(true),
  sessionIpCheck: z.boolean().default(true),
});

type SecurityFormData = z.infer<typeof securitySchema>;

export function SecuritySettings() {
  const { settings, isLoading, updateGroup, resetSettings } = useSettings();
  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      twoFactorAuth: false,
      sslRequired: true,
      sessionIpCheck: true,
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = form;

  useEffect(() => {
    if (settings?.security) {
      reset(settings.security);
    }
  }, [settings, reset]);

  const onSubmit = async (data: SecurityFormData) => {
    try {
      await updateGroup('security', data);
    } catch (error) {
      // déjà géré
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser les paramètres de sécurité ?')) {
      resetSettings();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Sécurité</CardTitle>
              <CardDescription>Configurez les paramètres de sécurité</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Durée de session (minutes)
              </Label>
              <Input id="sessionTimeout" type="number" {...register('sessionTimeout')} />
              {errors.sessionTimeout && <p className="text-sm text-destructive">{errors.sessionTimeout.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                Tentatives max
              </Label>
              <Input id="maxLoginAttempts" type="number" {...register('maxLoginAttempts')} />
              {errors.maxLoginAttempts && <p className="text-sm text-destructive">{errors.maxLoginAttempts.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordMinLength" className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              Longueur minimale du mot de passe
            </Label>
            <Input id="passwordMinLength" type="number" {...register('passwordMinLength')} />
            {errors.passwordMinLength && <p className="text-sm text-destructive">{errors.passwordMinLength.message}</p>}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch id="twoFactorAuth" {...register('twoFactorAuth')} />
              <Label htmlFor="twoFactorAuth" className="cursor-pointer">Authentification à deux facteurs</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sslRequired" {...register('sslRequired')} />
              <Label htmlFor="sslRequired" className="cursor-pointer">SSL requis</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sessionIpCheck" {...register('sessionIpCheck')} />
              <Label htmlFor="sessionIpCheck" className="cursor-pointer">Vérification IP</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Sauvegarde</CardTitle>
              <CardDescription>Configurez les sauvegardes automatiques</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <Switch id="autoBackup" {...register('autoBackup')} />
            <Label htmlFor="autoBackup" className="cursor-pointer">Sauvegarde automatique</Label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="backupFrequency" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Fréquence (heures)
              </Label>
              <Input id="backupFrequency" type="number" {...register('backupFrequency')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupRetention" className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                Conservation (jours)
              </Label>
              <Input id="backupRetention" type="number" {...register('backupRetention')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="backupStorage" className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Emplacement
            </Label>
            <Input id="backupStorage" {...register('backupStorage')} placeholder="/backups/" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réinitialiser
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>
    </form>
  );
}