'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
import { Pencil, Mail, Phone, User, FileText, Building2, CalendarDays } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function ProfileInfo({ profile, onEdit }) {
  const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '—';
  const initials = fullName
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar ? buildImageUrl(profile.avatar, false) : undefined} alt={fullName} />
            <AvatarFallback className="text-sm font-bold bg-secondary/10 text-secondary">
              {initials || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
            <CardDescription>Gérez vos données personnelles</CardDescription>
          </div>
        </div>
        <Button onClick={onEdit} variant="default" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <User className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom complet</p>
                <p className="font-medium">{fullName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Mail className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                <p className="font-medium">{profile?.email || '—'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Phone className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Téléphone</p>
                <p className="font-medium">{profile?.phone || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <Building2 className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Institution</p>
                <p className="font-medium">{profile?.bio || 'Non renseignée'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Statut :</span>
            <Badge variant={profile?.isActive ? 'default' : 'secondary'}>
              {profile?.isActive ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Rôle :</span>
            <Badge variant="outline">{profile?.role || 'Admin'}</Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs">
              Membre depuis{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}