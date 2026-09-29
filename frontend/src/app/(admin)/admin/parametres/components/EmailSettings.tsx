'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; 
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Send, Save, RefreshCw, Server, Users } from 'lucide-react';
import { useSettings } from './SettingsProvider';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const emailSchema = z.object({
  smtpHost: z.string().min(1, "L'hôte SMTP est requis"),
  smtpPort: z.coerce.number().min(1).max(65535),
  smtpUser: z.string().min(1, "L'utilisateur SMTP est requis"),
  smtpPassword: z.string().min(1, "Le mot de passe SMTP est requis"),
  smtpSecure: z.boolean().default(true),
  fromEmail: z.string().email('Email invalide'),
  fromName: z.string().min(1, 'Le nom de l\'expéditeur est requis'),
  replyTo: z.string().email('Email invalide').optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailSettings() {
  const { settings, isLoading, updateGroup, resetSettings } = useSettings();
  const [isTesting, setIsTesting] = useState(false);
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: '',
      fromName: '',
      replyTo: '',
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = form;

  useEffect(() => {
    if (settings?.email) {
      reset(settings.email);
    }
  }, [settings, reset]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      await updateGroup('email', data);
    } catch (error) {
      // déjà géré
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser les paramètres email ?')) {
      resetSettings();
    }
  };

  const handleTestEmail = async () => {
    const email = form.getValues('fromEmail') || 'test@example.com';
    if (!email) {
      toast.error('Veuillez configurer un email expéditeur');
      return;
    }
    setIsTesting(true);
    try {
      await api.post('/settings/test-email', { email });
      toast.success(`Email de test envoyé à ${email} ✅`);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du test');
    } finally {
      setIsTesting(false);
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
              <Server className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Configuration SMTP</CardTitle>
              <CardDescription>Configurez le serveur d'envoi d'emails</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost" className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Hôte SMTP
              </Label>
              <Input id="smtpHost" {...register('smtpHost')} placeholder="smtp.gmail.com" />
              {errors.smtpHost && <p className="text-sm text-destructive">{errors.smtpHost.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort" className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Port
              </Label>
              <Input id="smtpPort" type="number" {...register('smtpPort')} />
              {errors.smtpPort && <p className="text-sm text-destructive">{errors.smtpPort.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpUser" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Utilisateur SMTP
              </Label>
              <Input id="smtpUser" {...register('smtpUser')} />
              {errors.smtpUser && <p className="text-sm text-destructive">{errors.smtpUser.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Mot de passe SMTP
              </Label>
              <Input id="smtpPassword" type="password" {...register('smtpPassword')} />
              {errors.smtpPassword && <p className="text-sm text-destructive">{errors.smtpPassword.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="smtpSecure" {...register('smtpSecure')} />
            <Label htmlFor="smtpSecure" className="cursor-pointer">Utiliser TLS/SSL</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Expéditeur</CardTitle>
              <CardDescription>Configurez l'adresse d'expédition</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="fromEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email de l'expéditeur
            </Label>
            <Input id="fromEmail" {...register('fromEmail')} type="email" />
            {errors.fromEmail && <p className="text-sm text-destructive">{errors.fromEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Nom de l'expéditeur
            </Label>
            <Input id="fromName" {...register('fromName')} />
            {errors.fromName && <p className="text-sm text-destructive">{errors.fromName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="replyTo" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Répondre à
            </Label>
            <Input id="replyTo" {...register('replyTo')} type="email" placeholder="optional" />
            {errors.replyTo && <p className="text-sm text-destructive">{errors.replyTo.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <Mail className="inline h-4 w-4 mr-1" />
              Testez la configuration en envoyant un email
            </div>
            <Button type="button" variant="outline" onClick={handleTestEmail} disabled={isTesting} className="gap-2">
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer un test
                </>
              )}
            </Button>
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