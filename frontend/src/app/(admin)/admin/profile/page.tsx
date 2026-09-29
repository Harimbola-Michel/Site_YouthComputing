'use client';

import { useState, useEffect } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Loader2, Sparkles, Shield, Mail, Phone, Building2 } from 'lucide-react';
import { ProfileInfo } from './components/ProfileInfo';
import { ProfileEditForm } from './components/ProfileEditForm';
import { PasswordChangeForm } from './components/PasswordChangeForm';
import { AvatarUpload } from './components/AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await users.getProfile();
      setProfile(response.data.data || response.data);
    } catch (error) {
      toast.error('Impossible de charger votre profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateSuccess = () => {
    setEditing(false);
    fetchProfile();
    toast.success('Profil mis à jour ✅');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Utilisateur';
  const initials = fullName
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête avec dégradé et effet de profondeur */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 p-8 backdrop-blur-sm border border-border/50">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                  <AvatarImage src={profile?.avatar} alt={fullName} />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-ubuntu text-2xl font-bold">{fullName}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{profile?.email}</span>
                    <span className="text-muted-foreground/30">|</span>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {profile?.role || 'Admin'}
                    </Badge>
                    {profile?.isActive ? (
                      <Badge variant="default" className="text-[10px] bg-green-500">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                  <Shield className="h-3.5 w-3.5 text-secondary" />
                  Administrateur
                </Badge>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar avec avatar et stats */}
          <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-b from-background to-muted/20">
            <CardHeader className="flex flex-col items-center text-center pb-0">
              <div className="relative -mt-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl" />
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl relative">
                  <AvatarImage src={profile?.avatar} alt={fullName} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20 text-secondary">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl mt-3">{fullName}</CardTitle>
              <CardDescription className="text-xs flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Separator />
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Téléphone</p>
                    <p className="font-medium">{profile?.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Institution</p>
                    <p className="font-medium">{profile?.bio || 'Non renseignée'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Membre depuis</p>
                    <p className="font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onglets */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger
                  value="info"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <User className="h-4 w-4 mr-2" />
                  Informations
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Sécurité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                {editing ? (
                  <ProfileEditForm
                    profile={profile}
                    onSuccess={handleUpdateSuccess}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <ProfileInfo profile={profile} onEdit={() => setEditing(true)} />
                )}
              </TabsContent>

              <TabsContent value="security" className="mt-4">
                <PasswordChangeForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}