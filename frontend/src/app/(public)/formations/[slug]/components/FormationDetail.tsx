'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Users,
  MapPin,
  Award,
  Target,
  BookOpen,
  Calendar,
  ImageOff,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import type { Formation } from '@/types';

interface FormationDetailProps {
  formation: Formation;
}

export function FormationDetail({ formation }: FormationDetailProps) {
  // Sécurisation : si formation n'existe pas, on affiche un message
  if (!formation) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
        Formation introuvable
      </div>
    );
  }

  const nextSession = formation.sessions?.find((s) => new Date(s.startDate) > new Date());
  const [imageError, setImageError] = useState(false);
  const imageUrl = formation.imageUrl ? buildImageUrl(formation.imageUrl, true) : null;
  const showImage = imageUrl && !imageError;

  // Informations sous forme de tableaux pour itération
  const infoItems = [
    { icon: Clock, label: 'Durée', value: formation.duration || 'Non défini' },
    { icon: Award, label: 'Niveau', value: formation.level || 'Débutant' },
    { icon: Users, label: 'Participants', value: formation.maxParticipants || 'Illimité' },
    {
      icon: Calendar,
      label: 'Prochaine session',
      value: nextSession ? formatDate(nextSession.startDate) : 'À venir',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* ─── Bannière image ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
        {showImage ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={formation.title || 'Formation'}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 1200px"
              unoptimized
              onError={() => setImageError(true)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="h-16 w-16 opacity-20" />
              <span className="text-sm font-medium opacity-60">Image non disponible</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0">
            {formation.category || 'Formation'}
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0">
            {formation.level || 'Débutant'}
          </Badge>
          {formation.isFeatured && (
            <Badge variant="default" className="bg-secondary text-white border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              À la une
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Titre et description ────────────────────────────── */}
      <div>
        <h1 className="font-ubuntu text-3xl font-bold md:text-4xl">
          {formation.title || 'Sans titre'}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          {formation.description || 'Aucune description disponible.'}
        </p>
      </div>

      {/* ─── Grille d’informations ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-secondary/20 hover:bg-secondary/5"
          >
            <div className="mt-0.5 rounded-full bg-secondary/10 p-2 text-secondary">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Tarif ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Tarif</p>
        <p className="text-3xl font-bold text-primary">
          {formation.price && formation.price > 0 ? formatCurrency(formation.price) : 'Gratuit'}
        </p>
        {formation.price && formation.price > 0 && (
          <p className="text-xs text-muted-foreground mt-1">TVA non applicable</p>
        )}
      </div>

      {/* ─── Objectifs ────────────────────────────────────────── */}
      {formation.objectives && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="flex items-center gap-2 font-ubuntu text-xl font-semibold">
            <Target className="h-5 w-5 text-secondary" />
            Objectifs
          </h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">{formation.objectives}</p>
        </motion.div>
      )}

      {/* ─── Prérequis ────────────────────────────────────────── */}
      {formation.prerequisites && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="flex items-center gap-2 font-ubuntu text-xl font-semibold">
            <BookOpen className="h-5 w-5 text-secondary" />
            Prérequis
          </h3>
          <p className="mt-2 text-muted-foreground leading-relaxed">{formation.prerequisites}</p>
        </motion.div>
      )}

      {/* ─── Sessions ─────────────────────────────────────────── */}
      {formation.sessions && formation.sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border/50 p-6"
        >
          <h3 className="flex items-center gap-2 font-ubuntu text-xl font-semibold">
            <Calendar className="h-5 w-5 text-secondary" />
            Sessions disponibles
          </h3>
          <div className="mt-4 space-y-3">
            {formation.sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {formatDate(session.startDate)} – {formatDate(session.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">{session.location || 'Lieu non spécifié'}</p>
                </div>
                <Badge
                  variant={
                    session.currentParticipants >= session.maxParticipants
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {session.currentParticipants ?? 0} / {session.maxParticipants ?? '∞'} places
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}