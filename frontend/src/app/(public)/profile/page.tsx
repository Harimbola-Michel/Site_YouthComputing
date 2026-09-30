'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Shield,
  BookOpen,
  LogOut,
  Edit,
  Save,
  Camera,
  Loader2,
  UserCircle,
  History,
  Clock,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { users, registrations } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';

// ─── Schémas de validation ──────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'La bio ne doit pas dépasser 500 caractères').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mêmes règles que le backend (changePasswordValidator)
const strongPassword = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial');

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// ─── Composant principal ────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [registrationsData, setRegistrationsData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // ─── Formulaires ──────────────────────────────────────────────
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      bio: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // ─── Chargement des données ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        profileForm.reset({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
        setAvatarPreview(user.avatar || null);

        try {
          const response = await registrations.getMyRegistrations();
          // Le backend renvoie { success, data: [...] } (ou un objet paginé)
          const payload = response.data?.data ?? response.data;
          const list = Array.isArray(payload)
            ? payload
            : payload?.items ?? payload?.registrations ?? [];
          setRegistrationsData(list);
        } catch (err) {
          console.error('Erreur chargement inscriptions:', err);
          setRegistrationsData([]);
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        toast.error('Impossible de charger les informations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // ─── Redirection si non authentifié ──────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/connexion');
    }
  }, [authLoading, isAuthenticated, router]);

  // ─── Mise à jour du profil ──────────────────────────────────
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const response = await users.updateProfile(data);
      const updated = response.data?.data;
      if (user) {
        updateUser({ ...user, ...(updated && typeof updated === 'object' ? updated : data) });
      }
      toast.success('Profil mis à jour avec succès ✅');
      setIsEditing(false);
    } catch (error: any) {
      const fieldErrors = error?.formattedErrors as Record<string, string[]> | undefined;
      const first = fieldErrors && Object.values(fieldErrors)[0]?.[0];
      toast.error(first || error?.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Changement de mot de passe ──────────────────────────────
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await users.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Mot de passe modifié avec succès 🔒');
      passwordForm.reset();
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      const fieldErrors = error?.formattedErrors as Record<string, string[]> | undefined;
      const first = fieldErrors && Object.values(fieldErrors)[0]?.[0];
      toast.error(first || error?.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordDialogChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) passwordForm.reset();
  };

  // ─── Upload d’avatar ─────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2MB");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non supporté (JPEG, PNG, WEBP)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await users.uploadAvatar(formData);
      const avatarUrl = response.data?.data?.url || response.data?.url;
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
        toast.success('Avatar mis à jour ✅');
      }
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Déconnexion (le contexte gère toast + redirection) ─────
  const handleLogout = async () => {
    await logout();
  };

  // ─── États de chargement ────────────────────────────────────
  if (authLoading || isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated || !user) return null;

  // ─── Rendu ────────────────────────────────────────────────────
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
      : 'U';

  const stats = {
    total: registrationsData.length,
    completed: registrationsData.filter((r) => r.status === 'COMPLETED').length,
    pending: registrationsData.filter((r) => r.status === 'PENDING' || r.status === 'CONFIRMED').length,
  };

  const avatarSrc = avatarPreview
    ? buildImageUrl(avatarPreview)
    : user.avatar
    ? buildImageUrl(user.avatar)
    : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/5 py-8">
        <div className="container mx-auto max-w-5xl px-4">
          {/* ─── En-tête ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="font-ubuntu text-3xl font-bold md:text-4xl">
              Mon{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Profil
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gérez vos informations personnelles et suivez vos inscriptions.
            </p>
          </motion.div>

          {/* ─── Contenu principal ───────────────────────────────── */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Sidebar – Carte utilisateur */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-24 border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mx-auto w-28 h-28">
                    <Avatar className="h-28 w-28 ring-4 ring-secondary/20 ring-offset-2 ring-offset-background">
                      <AvatarImage src={avatarSrc || undefined} alt={user.firstName || 'User'} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className={cn(
                        'absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-secondary p-2 text-white shadow-lg transition-all hover:bg-secondary/90',
                        isUploading && 'opacity-50 pointer-events-none'
                      )}
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      <span className="sr-only">Changer l&apos;avatar</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </div>

                  {/* Identité */}
                  <div className="mt-4">
                    <h2 className="font-ubuntu text-xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.role && (
                      <Badge variant="secondary" className="mt-2 uppercase">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <p className="text-2xl font-bold text-primary">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                      <p className="text-xs text-muted-foreground">Terminées</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">En cours</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-secondary"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? 'Annuler' : 'Modifier le profil'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      <Shield className="h-4 w-4" />
                      Changer le mot de passe
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                      onClick={() => setIsLogoutDialogOpen(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contenu principal – Onglets */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="registrations" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Inscriptions ({stats.total})
                  </TabsTrigger>
                </TabsList>

                {/* ─── Onglet Profil ────────────────────────────── */}
                <TabsContent value="profile" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-ubuntu flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-secondary" />
                        Informations personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label htmlFor="firstName" className="text-sm font-medium">Prénom *</label>
                            <Input
                              id="firstName"
                              placeholder="Jean"
                              {...profileForm.register('firstName')}
                              disabled={!isEditing || isSaving}
                            />
                            {profileForm.formState.errors.firstName && (
                              <p className="text-sm text-destructive">
                                {profileForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="lastName" className="text-sm font-medium">Nom *</label>
                            <Input
                              id="lastName"
                              placeholder="Dupont"
                              {...profileForm.register('lastName')}
                              disabled={!isEditing || isSaving}
                            />
                            {profileForm.formState.errors.lastName && (
                              <p className="text-sm text-destructive">
                                {profileForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="email" className="text-sm font-medium">Email</label>
                          <Input id="email" value={user.email} disabled className="bg-muted" />
                          <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
                          <Input
                            id="phone"
                            placeholder="034 12 345 67"
                            {...profileForm.register('phone')}
                            disabled={!isEditing || isSaving}
                          />
                          {profileForm.formState.errors.phone && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                          <Textarea
                            id="bio"
                            placeholder="Parlez-nous un peu de vous..."
                            rows={3}
                            {...profileForm.register('bio')}
                            disabled={!isEditing || isSaving}
                          />
                          {profileForm.formState.errors.bio && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.bio.message}
                            </p>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSaving} className="gap-2">
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Enregistrer
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={isSaving}
                            >
                              Annuler
                            </Button>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ─── Onglet Inscriptions ───────────────────────── */}
                <TabsContent value="registrations" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-ubuntu flex items-center gap-2">
                        <History className="h-5 w-5 text-secondary" />
                        Historique des inscriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {registrationsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground opacity-30" />
                          <h3 className="mt-4 text-lg font-semibold">Aucune inscription</h3>
                          <p className="text-sm text-muted-foreground">
                            Vous n&apos;êtes inscrit à aucune formation pour le moment.
                          </p>
                          <Button asChild className="mt-4">
                            <a href="/formations">Découvrir les formations</a>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {registrationsData.map((reg) => {
                            const session = reg.session ?? reg.formationSession;
                            return (
                              <div
                                key={reg.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                              >
                                <div>
                                  <p className="font-medium">{reg.formation?.title || 'Formation'}</p>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {formatDate(reg.createdAt)}
                                    </span>
                                    {session?.startDate && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDate(session.startDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      reg.status === 'CONFIRMED' && 'bg-green-500/10 text-green-600',
                                      reg.status === 'PENDING' && 'bg-yellow-500/10 text-yellow-600',
                                      reg.status === 'CANCELLED' && 'bg-red-500/10 text-red-600',
                                      reg.status === 'COMPLETED' && 'bg-blue-500/10 text-blue-600'
                                    )}
                                  >
                                    {reg.status === 'CONFIRMED' && 'Confirmée'}
                                    {reg.status === 'PENDING' && 'En attente'}
                                    {reg.status === 'CANCELLED' && 'Annulée'}
                                    {reg.status === 'COMPLETED' && 'Terminée'}
                                  </Badge>
                                  {reg.paymentStatus && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        reg.paymentStatus === 'PAID' && 'border-green-500 text-green-600',
                                        reg.paymentStatus === 'PENDING' && 'border-yellow-500 text-yellow-600'
                                      )}
                                    >
                                      {reg.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* ─── Dialog : Changement de mot de passe ────────────── */}
        <AlertDialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Changer le mot de passe</AlertDialogTitle>
              <AlertDialogDescription>
                Entrez votre mot de passe actuel et le nouveau mot de passe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="dialog-currentPassword" className="text-sm font-medium">
                  Mot de passe actuel *
                </label>
                <Input
                  id="dialog-currentPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...passwordForm.register('currentPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dialog-newPassword" className="text-sm font-medium">
                  Nouveau mot de passe *
                </label>
                <Input
                  id="dialog-newPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...passwordForm.register('newPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dialog-confirmPassword" className="text-sm font-medium">
                  Confirmer *
                </label>
                <Input
                  id="dialog-confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...passwordForm.register('confirmPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel type="button" disabled={isChangingPassword}>
                  Annuler
                </AlertDialogCancel>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>

        {/* ─── Dialog : Déconnexion ────────────────────────────── */}
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Déconnexion</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}