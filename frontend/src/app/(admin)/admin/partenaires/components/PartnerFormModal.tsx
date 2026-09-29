'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { partners } from '@/lib/api';
import toast from 'react-hot-toast';
import { Partner } from '@/types/partner.types';

const partnerSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  logo: z.string().url('URL invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onSuccess: () => void;
}

export function PartnerFormModal({ open, onOpenChange, partner, onSuccess }: PartnerFormModalProps) {
  const isEditing = !!partner;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      logo: '',
      website: '',
      description: '',
      email: '',
      phone: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (partner) {
      reset({
        name: partner.name || '',
        logo: partner.logo || '',
        website: partner.website || '',
        description: partner.description || '',
        email: partner.email || '',
        phone: partner.phone || '',
        isActive: partner.isActive ?? true,
      });
    } else {
      reset({
        name: '',
        logo: '',
        website: '',
        description: '',
        email: '',
        phone: '',
        isActive: true,
      });
    }
  }, [partner, reset]);

  const onSubmit = async (data: PartnerFormData) => {
    try {
      if (isEditing) {
        await partners.update(partner!.id, data);
        toast.success('Partenaire mis à jour ✅');
      } else {
        await partners.create(data);
        toast.success('Partenaire ajouté 🎉');
      }
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’enregistrement';
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-ubuntu text-xl">
            {isEditing ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations du partenaire.'
              : 'Ajoutez un nouveau partenaire à la liste.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">URL du logo</Label>
              <Input
                id="logo"
                {...register('logo')}
                disabled={isSubmitting}
                placeholder="https://exemple.com/logo.png"
              />
              {errors.logo && <p className="text-sm text-destructive">{errors.logo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                {...register('website')}
                disabled={isSubmitting}
                placeholder="https://exemple.com"
              />
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email de contact</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={isSubmitting}
                placeholder="+261 34 12 345 67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              disabled={isSubmitting}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="isActive">Actif (visible sur le site)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                isEditing ? 'Modifier' : 'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}