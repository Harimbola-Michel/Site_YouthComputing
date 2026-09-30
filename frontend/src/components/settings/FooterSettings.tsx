// src/components/settings/FooterSettings.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Save, RefreshCw, Plus, Trash2,
  Share2, Columns, Mail, Phone, MapPin, Copyright, Building2,
} from 'lucide-react';
import { useSettings } from './SettingsProvider';

const linkSchema = z.object({
  label: z.string().min(1, 'Libellé requis'),
  href: z.string().min(1, 'Lien requis'),
});

const columnSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  links: z.array(linkSchema).default([]),
});

const footerSchema = z.object({
  brandPrimary: z.string().min(1, 'Requis'),
  brandSecondary: z.string().min(1, 'Requis'),
  description: z.string().optional(),
  social: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }).default({}),
  columns: z.array(columnSchema).default([]),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).default({}),
  copyright: z.string().optional(),
});

type FooterFormData = z.infer<typeof footerSchema>;

export function FooterSettings() {
  const { settings, isLoading, updateGroup, resetSettings } = useSettings();

  const form = useForm<FooterFormData>({
    resolver: zodResolver(footerSchema),
    defaultValues: {
      brandPrimary: 'Youth',
      brandSecondary: 'Computing',
      description: 'Association pour la promotion des NTIC à Madagascar.',
      social: { facebook: '', instagram: '', linkedin: '', twitter: '' },
      columns: [
        {
          title: 'Youth Computing',
          links: [
            { label: 'À propos', href: '/a-propos' },
            { label: 'Contact', href: '/contact' },
          ],
        },
        {
          title: 'Services',
          links: [
            { label: 'Formations', href: '/formations' },
            { label: 'Événements', href: '/evenements' },
          ],
        },
      ],
      contact: { email: '', phone: '', address: '' },
      copyright: '',
    },
  });

  const {
    register, handleSubmit, reset, control,
    formState: { isSubmitting, errors },
  } = form;

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
  } = useFieldArray({ control, name: 'columns' });

  // Pour les liens imbriqués on utilise un FieldArray par colonne
  // Astuce : on utilise useFieldArray sur un nom dynamique
  // Ici on rend manuellement chaque colonne avec son propre composant
  useEffect(() => {
    if (settings?.footer) {
      reset({ ...form.getValues(), ...settings.footer });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.footer, reset]);

  const onSubmit = async (data: FooterFormData) => {
    try {
      await updateGroup('footer', data);
    } catch {
      /* déjà géré */
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser la configuration du footer ?')) resetSettings();
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
      {/* Marque */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Marque & description</CardTitle>
              <CardDescription>Identité affichée dans le footer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brandPrimary">Marque (primaire)</Label>
              <Input id="brandPrimary" {...register('brandPrimary')} />
              {errors.brandPrimary && (
                <p className="text-sm text-destructive">{errors.brandPrimary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandSecondary">Marque (secondaire)</Label>
              <Input id="brandSecondary" {...register('brandSecondary')} />
              {errors.brandSecondary && (
                <p className="text-sm text-destructive">{errors.brandSecondary.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Réseaux sociaux</CardTitle>
              <CardDescription>Liens affichés dans le footer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" {...register('social.facebook')} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" {...register('social.instagram')} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" {...register('social.linkedin')} placeholder="https://linkedin.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" {...register('social.twitter')} placeholder="https://twitter.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colonnes de liens */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Columns className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Colonnes de liens</CardTitle>
              <CardDescription>Groupes de liens affichés dans le footer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {columnFields.map((column, colIndex) => (
            <FooterColumn
              key={column.id}
              colIndex={colIndex}
              register={register}
              errors={errors}
              onRemove={() => removeColumn(colIndex)}
              control={control}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => appendColumn({ title: '', links: [] })}
          >
            <Plus className="h-4 w-4" /> Ajouter une colonne
          </Button>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Contact</CardTitle>
              <CardDescription>Coordonnées affichées dans le footer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <Input id="email" type="email" {...register('contact.email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Téléphone
              </Label>
              <Input id="phone" {...register('contact.phone')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Adresse
            </Label>
            <Input id="address" {...register('contact.address')} />
          </div>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary/10 p-2 text-secondary">
              <Copyright className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-ubuntu text-xl">Copyright</CardTitle>
              <CardDescription>Texte du bas de page (l'année est ajoutée automatiquement si vide)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="copyright">Texte</Label>
            <Input
              id="copyright"
              {...register('copyright')}
              placeholder="Youth Computing. Tous droits réservés."
            />
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

/* ------------------------------------------------------------------ */
/* Sous-composant : une colonne avec ses liens                        */
/* ------------------------------------------------------------------ */
function FooterColumn({
  colIndex,
  register,
  errors,
  onRemove,
  control,
}: {
  colIndex: number;
  register: any;
  errors: any;
  onRemove: () => void;
  control: any;
}) {
  // Hook react-hook-form pour les liens de CETTE colonne uniquement
  // On utilise un composant séparé pour respecter les règles des hooks
  const { fields, append, remove } = useColumnLinks(control, colIndex);

  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Titre de la colonne</Label>
          <Input
            {...register(`columns.${colIndex}.title` as const)}
            placeholder="Services"
          />
          {errors.columns?.[colIndex]?.title && (
            <p className="text-xs text-destructive">
              {errors.columns[colIndex]?.title?.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {fields.map((link, linkIndex) => (
          <div key={link.id} className="flex items-end gap-2">
            <Input
              {...register(`columns.${colIndex}.links.${linkIndex}.label` as const)}
              placeholder="Libellé"
              className="flex-1"
            />
            <Input
              {...register(`columns.${colIndex}.links.${linkIndex}.href` as const)}
              placeholder="/lien"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(linkIndex)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => append({ label: '', href: '' })}
        >
          <Plus className="h-3 w-3" /> Ajouter un lien
        </Button>
      </div>
    </div>
  );
}

// Petit hook utilitaire pour les liens d'une colonne
import { useFieldArray } from 'react-hook-form';
function useColumnLinks(control: any, colIndex: number) {
  return useFieldArray({
    control,
    name: `columns.${colIndex}.links` as const,
  });
}
