'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Globe, Mail, MapPin, Phone, FileText, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from './SettingsProvider';
import toast from 'react-hot-toast';

const generalSchema = z.object({
  siteName: z.string().min(1, 'Nom requis'),
  siteUrl: z.string().url('URL invalide'),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email('Email invalide'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(true),
});

type GeneralFormData = z.infer<typeof generalSchema>;

export function GeneralSettings() {
  const { settings, isLoading, updateGroup, resetSettings } = useSettings();
  const form = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      siteName: '',
      siteUrl: '',
      siteDescription: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      maintenanceMode: false,
      allowRegistration: true,
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting, errors }, setValue } = form;

  useEffect(() => {
    if (settings?.general) {
      reset(settings.general);
    }
  }, [settings, reset]);

  const onSubmit = async (data: GeneralFormData) => {
    try {
      await updateGroup('general', data);
    } catch (error) {
      // déjà géré dans le provider
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser les paramètres généraux ?')) {
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
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Informations générales</CardTitle>
              <CardDescription>Configurez les informations principales du site</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Nom du site
              </Label>
              <Input id="siteName" {...register('siteName')} placeholder="Youth Computing" />
              {errors.siteName && <p className="text-sm text-destructive">{errors.siteName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                URL du site
              </Label>
              <Input id="siteUrl" {...register('siteUrl')} placeholder="https://..." />
              {errors.siteUrl && <p className="text-sm text-destructive">{errors.siteUrl.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </Label>
            <Textarea id="siteDescription" {...register('siteDescription')} rows={3} placeholder="Description du site" />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email de contact
              </Label>
              <Input id="contactEmail" {...register('contactEmail')} type="email" />
              {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Téléphone
              </Label>
              <Input id="contactPhone" {...register('contactPhone')} placeholder="+261 ..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Adresse
            </Label>
            <Input id="address" {...register('address')} placeholder="Antananarivo, Madagascar" />
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="maintenanceMode" {...register('maintenanceMode')} />
              <Label htmlFor="maintenanceMode" className="cursor-pointer">Mode maintenance</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="allowRegistration" {...register('allowRegistration')} />
              <Label htmlFor="allowRegistration" className="cursor-pointer">Inscriptions autorisées</Label>
            </div>
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