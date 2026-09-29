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
import { Loader2, User, Mail, Phone, Building2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { Separator } from '@/components/ui/separator';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileEditForm({ profile, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await users.updateProfile(data);
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Erreur lors de la mise à jour';
      toast.error(msg);
      console.error('Erreur updateProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await users.uploadAvatar(formData);
      onSuccess();
      toast.success('Avatar mis à jour ✅');
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Erreur lors du téléchargement';
      toast.error(msg);
      console.error('Erreur uploadAvatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '';

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-secondary" />
          Modifier mes informations
        </CardTitle>
      </CardHeader>
      <Separator />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          <AvatarUpload
            currentAvatar={profile?.avatar}
            onUpload={handleAvatarUpload}
            isUploading={uploadingAvatar}
            name={fullName || 'Utilisateur'}
          />

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Prénom
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Téléphone
            </Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Institution / Bio
            </Label>
            <Input
              id="bio"
              {...register('bio')}
              placeholder="Courte présentation ou institution"
            />
          </div>
        </CardContent>

        <Separator />
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading || uploadingAvatar}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading || uploadingAvatar} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}