'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, User, Users, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { team } from '@/lib/api';
import { buildImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
  role?: string;
  department?: string;
  bio?: string;
  linkedin?: string;
  photoUrl?: string;
}

interface TeamSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function TeamSection({
  title = 'Notre Équipe',
  subtitle = 'Des passionnés engagés pour la promotion des NTIC à Madagascar',
  limit = 8,
}: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await team.getActive();
        const data = response.data?.data || response.data || [];
        const safeData = data
          .map((member: any) => ({
            ...member,
            user: member.user || { firstName: 'Utilisateur', lastName: '', email: '' },
          }))
          .slice(0, limit);
        setMembers(safeData);
      } catch (err) {
        console.error('Erreur équipe:', err);
        setError('Impossible de charger l’équipe.');
        setMembers([]);
        toast.error('Erreur de chargement de l\'équipe');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [limit]);

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 text-center">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="mt-2 h-4 w-64 mx-auto" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="py-12 md:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Équipe en cours de constitution</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-6xl mx-auto px-4">
        {/* ─── En-tête ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary mb-3">
            <Sparkles className="h-4 w-4" />
            Notre équipe
          </div>
          <h2 className="font-ubuntu text-3xl font-bold md:text-4xl">
            {title} <span className="text-secondary">Youth Computing</span>
          </h2>
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-20 bg-secondary rounded-full" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* ─── Grille ────────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => {
            const user = member.user || { firstName: 'Membre', lastName: '', email: '' };
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Membre';
            const initials = user.firstName?.[0]?.toUpperCase() || '';
            const avatarUrl = member.photoUrl || user.avatar
              ? buildImageUrl(member.photoUrl || user.avatar, false)
              : null;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Card className="group h-full overflow-hidden border-0 bg-gradient-to-br from-background to-muted/10 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6 text-center relative">
                    {/* Badge de rôle en haut */}
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-[10px] uppercase bg-secondary/10 text-secondary border-0"
                    >
                      {member.role || 'Membre'}
                    </Badge>

                    {/* Avatar */}
                    <div className="relative mx-auto">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Avatar className="relative h-24 w-24 mx-auto ring-2 ring-secondary/20 group-hover:ring-secondary/40 transition-all duration-300">
                        <AvatarImage
                          src={avatarUrl || undefined}
                          alt={fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary text-2xl font-bold">
                          {initials || <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Nom et rôle */}
                    <h3 className="mt-4 font-ubuntu text-lg font-semibold leading-tight">
                      {fullName}
                    </h3>
                    <p className="text-sm font-medium text-secondary">
                      {member.role || 'Membre'}
                    </p>
                    {member.department && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {member.department}
                      </p>
                    )}

                    {/* Bio */}
                    {member.bio && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {/* Contacts */}
                    <div className="mt-4 flex items-center justify-center gap-2 border-t border-border/30 pt-4">
                      {user.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all duration-200"
                          onClick={() => {
                            navigator.clipboard.writeText(user.email);
                            toast.success('Email copié !');
                          }}
                          title="Copier l'email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      {member.linkedin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-200"
                          onClick={() => window.open(member.linkedin, '_blank')}
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      )}
                      {!user.email && !member.linkedin && (
                        <span className="text-[10px] text-muted-foreground/50">
                          Aucun contact
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}