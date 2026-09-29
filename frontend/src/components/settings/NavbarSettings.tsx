// src/components/settings/NavbarSettings.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Save, RefreshCw, Plus, Trash2,
  Navigation, Image as ImageIcon, Link2, MousePointerClick, Bell, Sun, LogIn,
} from 'lucide-react';
import { useSettings } from './SettingsProvider';

const navItemSchema = z.object({
  label: z.string().min(1, 'Libellé requis'),
  href: z.string().min(1, 'Lien requis'),
});

const navbarSchema = z.object({
  logoUrl: z.string().optional(),
  logoAlt: z.string().optional(),
  brandPrimary: z.string().min(1, 'Requis'),
  brandSecondary: z.string().min(1, 'Requis'),
  navItems: z.array(navItemSchema).default([]),
  showThemeToggle: z.boolean().default(true),
  showNotifications: z.boolean().default(true),
  showAuthButtons: z.boolean().default(true),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

type NavbarFormData = z.infer<typeof navbarSchema>;

export function NavbarSettings() {
  const { settings, isLoading, updateGroup, resetSettings } = useSettings();

  const form = useForm<NavbarFormData>({
    resolver: zodResolver(navbarSchema),
    defaultValues: {
      logoUrl: '/images/Youth Computing.png',
      logoAlt: 'Youth Computing',
      brandPrimary: 'Youth',
      brandSecondary: 'Computing',
      navItems: [
        { label: 'Accueil', href: '/' },
        { label: 'À propos', href: '/a-propos' },
        { label: 'Recrutement', href: '/recrutements' },
        { label: 'Partenaires', href: '/partenaires' },
      ],
      showThemeToggle: true,
      showNotifications: true,
      showAuthButtons: true,
      ctaLabel: "S'inscrire",
      ctaHref: '/inscription',
    },
  });

  const {
    register, handleSubmit, reset, control,
    formState: { isSubmitting, errors },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: 'navItems' });

  useEffect(() => {
    if (settings?.navbar) {
      reset({ ...form.getValues(), ...settings.navbar });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.navbar, reset]);

  const onSubmit = async (data: NavbarFormData) => {
    try {
      await updateGroup('navbar', data);
    } catch {
      /* géré par le provider */
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser la configuration de la navbar ?')) resetSettings();
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
      {/* Identité visuelle */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Identité visuelle</CardTitle>
              <CardDescription>Logo et nom de marque affichés dans la navbar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" /> URL du logo
              </Label>
              <Input id="logoUrl" {...register('logoUrl')} placeholder="/images/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoAlt" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" /> Texte alternatif
              </Label>
              <Input id="logoAlt" {...register('logoAlt')} placeholder="Youth Computing" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brandPrimary" className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" /> Marque (primaire)
              </Label>
              <Input id="brandPrimary" {...register('brandPrimary')} />
              {errors.brandPrimary && (
                <p className="text-sm text-destructive">{errors.brandPrimary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandSecondary" className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" /> Marque (secondaire)
              </Label>
              <Input id="brandSecondary" {...register('brandSecondary')} />
              {errors.brandSecondary && (
                <p className="text-sm text-destructive">{errors.brandSecondary.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liens de navigation */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Liens de navigation</CardTitle>
              <CardDescription>Menu principal affiché sur desktop</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-border/40 bg-muted/20 p-3"
              >
                <div className="flex-1 min-w-[160px] space-y-1">
                  <Label className="text-xs">Libellé</Label>
                  <Input
                    {...register(`navItems.${index}.label` as const)}
                    placeholder="Accueil"
                  />
                  {errors.navItems?.[index]?.label && (
                    <p className="text-xs text-destructive">
                      {errors.navItems[index]?.label?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label className="text-xs">Lien</Label>
                  <Input
                    {...register(`navItems.${index}.href` as const)}
                    placeholder="/a-propos"
                  />
                  {errors.navItems?.[index]?.href && (
                    <p className="text-xs text-destructive">
                      {errors.navItems[index]?.href?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => append({ label: '', href: '' })}
          >
            <Plus className="h-4 w-4" /> Ajouter un lien
          </Button>
        </CardContent>
      </Card>

      {/* Options */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <MousePointerClick className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Options d'affichage</CardTitle>
              <CardDescription>Éléments visibles dans la navbar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Switch id="showThemeToggle" {...register('showThemeToggle')} />
              <Label htmlFor="showThemeToggle" className="cursor-pointer flex items-center gap-1">
                <Sun className="h-4 w-4" /> Thème
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="showNotifications" {...register('showNotifications')} />
              <Label htmlFor="showNotifications" className="cursor-pointer flex items-center gap-1">
                <Bell className="h-4 w-4" /> Notifications
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="showAuthButtons" {...register('showAuthButtons')} />
              <Label htmlFor="showAuthButtons" className="cursor-pointer flex items-center gap-1">
                <LogIn className="h-4 w-4" /> Boutons connexion
              </Label>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaLabel">Libellé CTA (inscription)</Label>
              <Input id="ctaLabel" {...register('ctaLabel')} placeholder="S'inscrire" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaHref">Lien CTA</Label>
              <Input id="ctaHref" {...register('ctaHref')} placeholder="/inscription" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Réinitialiser
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Sauvegarder
            </>
          )}
        </Button>
      </div>
    </form>
  );
}