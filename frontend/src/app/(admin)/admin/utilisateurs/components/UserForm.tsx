// src/app/(admin)/admin/users/components/UserForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Pencil,
  Mail,
  Phone,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoleSelector } from './RoleSelector';
import { User, Role } from '@/types/user.types';
import { api, users } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { AvatarUpload } from '@/components/ui/avatar-upload';

// Schéma pour l'édition (sans mot de passe)
const userSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (minimum 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'MEMBER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
  emailVerified: z.boolean().optional(),
});

// Schéma pour la création (avec mot de passe)
const createUserSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (minimum 2 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'MEMBER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
  emailVerified: z.boolean().optional(),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[@$!%*?&]/, 'Doit contenir un caractère spécial'),
});

type UserFormData = z.infer<typeof userSchema>;
type CreateUserFormData = z.infer<typeof createUserSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSuccess?: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Actif', color: 'bg-green-500/20 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  INACTIVE: { label: 'Inactif', color: 'bg-gray-500/20 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  SUSPENDED: { label: 'Suspendu', color: 'bg-red-500/20 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  PENDING_VERIFICATION: { label: 'En attente', color: 'bg-amber-500/20 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const isEditing = !!user;

  const schema = isEditing ? userSchema : createUserSchema;

  const form = useForm<UserFormData | CreateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: false,
      ...(isEditing ? {} : { password: '' }),
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        emailVerified: !!user.emailVerified,
      });
      setAvatarUrl(user.avatar);
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'MEMBER',
        status: 'ACTIVE',
        emailVerified: false,
        password: '',
      });
      setAvatarUrl(undefined);
    }
  }, [user, form]);

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await users.uploadAvatar(formData);
      const newAvatarUrl = response.data.data?.avatar || response.data.avatar;
      setAvatarUrl(newAvatarUrl);
      toast.success('Avatar mis à jour ✅');
      // On pourrait rafraîchir les données ici, mais on attend la soumission du formulaire
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'avatar');
      console.error(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: UserFormData | CreateUserFormData) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      if (isEditing) {
        delete (payload as any).password;
        // Si un avatar a été uploadé, on le met dans le payload ? Non, il est déjà enregistré séparément.
        // On pourrait aussi mettre à jour l'avatar via le même appel si le backend le permet.
        await api.put(`/users/${user!.id}`, payload);
        toast.success(`✅ ${data.firstName} ${data.lastName} mis à jour avec succès`);
      } else {
        await api.post('/users', payload);
        toast.success(`🎉 ${data.firstName} ${data.lastName} créé avec succès`);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const status = error?.response?.status;
      let message = error?.response?.data?.message || 'Une erreur est survenue';
      if (status === 403) {
        message = 'Vous n\'avez pas les droits pour effectuer cette action.';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !uploadingAvatar) {
      form.reset();
      onOpenChange(false);
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* En-tête */}
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                  {isEditing ? (
                    <>
                      <Pencil className="h-5 w-5 text-secondary" />
                      Modifier l'utilisateur
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-secondary" />
                      Ajouter un utilisateur
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifiez les informations de l\'utilisateur ci-dessous.'
                    : 'Créez un nouvel utilisateur en remplissant les champs ci-dessous.'}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={handleClose}
                disabled={isLoading || uploadingAvatar}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Avatar upload */}
                <AvatarUpload
                  currentAvatar={avatarUrl}
                  onUpload={handleAvatarUpload}
                  isUploading={uploadingAvatar}
                  name={fullName || 'Utilisateur'}
                />

                {/* Prénom & Nom */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} disabled={isLoading || uploadingAvatar} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} disabled={isLoading || uploadingAvatar} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="jean.dupont@email.com"
                            className="pl-9"
                            {...field}
                            disabled={isLoading || uploadingAvatar}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Téléphone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="+261 34 00 000 00"
                            className="pl-9"
                            {...field}
                            disabled={isLoading || uploadingAvatar}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rôle */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <RoleSelector
                          value={field.value as Role}
                          onChange={field.onChange}
                          disabled={isLoading || uploadingAvatar}
                        />
                      </FormControl>
                      <FormDescription>
                        Détermine les permissions de l'utilisateur.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Statut */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || uploadingAvatar}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {field.value && (
                                <Badge className={cn('text-[10px] uppercase font-medium', statusConfig[field.value]?.color)}>
                                  {statusConfig[field.value]?.label || field.value}
                                </Badge>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <Badge className={cn('text-[10px] uppercase font-medium', config.color)}>
                                {config.label}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Contrôle l'accès à la plateforme.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email vérifié */}
                <FormField
                  control={form.control}
                  name="emailVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email vérifié</FormLabel>
                        <FormDescription>
                          Marquer l'email comme vérifié pour débloquer l'accès.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || uploadingAvatar}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Mot de passe (création) */}
                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading || uploadingAvatar}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Boutons */}
                <DialogFooter className="gap-2 pt-4">
                  <Button variant="outline" onClick={handleClose} disabled={isLoading || uploadingAvatar}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading || uploadingAvatar} className="min-w-[120px] gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}