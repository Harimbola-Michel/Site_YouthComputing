// src/components/admin/UserFormModal.tsx

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
import { RoleSelector } from './RoleSelector';
import { User, Role } from '@/types/user.types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

// ─── Schéma de validation ──────────────────────────────────
const userSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom requis (minimum 2 caractères)'),
    lastName: z.string().min(2, 'Nom requis (minimum 2 caractères)'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR', 'MEMBER']),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
      .optional(),
    emailVerified: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Si c'est une création, le mot de passe est requis
    // Géré séparément
  });

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSuccess?: () => void;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'MEMBER',
      status: 'ACTIVE',
      emailVerified: false,
    },
  });

  // ─── Pré-remplir le formulaire si édition ──────────────
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role as any || 'MEMBER',
        status: user.status as any || 'ACTIVE',
        emailVerified: user.emailVerified || false,
      });
      setPassword('');
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'MEMBER',
        status: 'ACTIVE',
        emailVerified: false,
      });
      setPassword('');
    }
  }, [user, form]);

  // ─── Soumission ───────────────────────────────────────────
  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const payload: any = { ...data };

      // Si création et mot de passe fourni
      if (!isEditing && password) {
        payload.password = password;
      }

      if (isEditing && user) {
        await api.patch(`/users/${user.id}`, payload);
        toast.success(`Utilisateur ${data.firstName} ${data.lastName} mis à jour ✅`);
      } else {
        await api.post('/users', payload);
        toast.success(`Utilisateur ${data.firstName} ${data.lastName} créé 🎉`);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Fermeture ────────────────────────────────────────────
  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── En-tête ──────────────────────────────────── */}
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
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* ─── Formulaire ────────────────────────────────── */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ── Prénom ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Prénom <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Nom ── */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nom <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Email ── */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="jean.dupont@email.com"
                            className="pl-9"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Téléphone ── */}
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
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Rôle ── */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <FormControl>
                        <RoleSelector
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Détermine les permissions de l'utilisateur.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Statut ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={isLoading}
                          >
                            <option value="ACTIVE">Actif</option>
                            <option value="INACTIVE">Inactif</option>
                            <option value="SUSPENDED">Suspendu</option>
                            <option value="PENDING_VERIFICATION">En attente</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Email vérifié ── */}
                  <FormField
                    control={form.control}
                    name="emailVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end space-y-1">
                        <FormLabel>Email vérifié</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 pt-1">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? 'Vérifié ✅' : 'Non vérifié'}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Mot de passe (uniquement création) ── */}
                {!isEditing && (
                  <FormItem>
                    <FormLabel>
                      Mot de passe <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}

                {/* ─── Boutons ─────────────────────────────── */}
                <DialogFooter className="gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading} className="min-w-[120px] gap-2">
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