'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buildImageUrl } from '@/lib/imageUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Linkedin, Calendar, Users, Briefcase, Building2, User } from 'lucide-react';
import { team } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await team.getById(id);
        const data = res?.data?.data ?? res?.data;
        setMember(data);
      } catch (error) {
        toast.error('Impossible de charger le membre');
        router.push('/admin/team');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMember();
  }, [id, router]);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (!member) return null;

  const user = member.user || {};
  const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Inconnu';

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête avec retour */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="font-ubuntu text-2xl font-bold">Détail du membre</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="max-w-3xl mx-auto border-2 border-secondary/10 shadow-xl">
            <CardHeader className="text-center pb-2">
              <Avatar className="mx-auto h-28 w-28 ring-4 ring-secondary/20">
                <AvatarImage src={member.photoUrl || user.avatar ? buildImageUrl(member.photoUrl || user.avatar, false) : undefined} />
                <AvatarFallback className="text-3xl bg-secondary/10 text-secondary">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl mt-4">{fullName}</CardTitle>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-sm px-4 py-1">
                  {member.role}
                </Badge>
                {member.department && (
                  <Badge variant="secondary" className="text-sm px-4 py-1">
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    {member.department}
                  </Badge>
                )}
                <Badge
                  variant={member.isActive ? 'default' : 'secondary'}
                  className={member.isActive ? 'bg-green-500/20 text-green-600' : ''}
                >
                  {member.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Informations personnelles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Membre depuis</p>
                    <p className="text-sm font-medium">{formatDate(member.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Biographie */}
              {member.bio && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Biographie</p>
                  <p className="text-sm whitespace-pre-wrap">{member.bio}</p>
                </div>
              )}

              {/* Liens sociaux */}
              {(user.email || member.linkedin) && (
                <div className="flex flex-wrap gap-2">
                  {user.email && (
                    <Button size="sm" variant="outline" asChild className="gap-2">
                      <a href={`mailto:${user.email}`}>
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  {member.linkedin && (
                    <Button size="sm" variant="outline" asChild className="gap-2">
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID utilisateur</span>
                  <p className="font-mono text-xs">{member.userId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ordre d’affichage</span>
                  <p>{member.displayOrder || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}