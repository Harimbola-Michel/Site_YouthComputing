'use client';

import { useState } from 'react';
import { buildImageUrl } from '@/lib/imageUtils';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Award,
  Target,
  BookOpen,
  Calendar,
  FileText,
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RegistrationModal } from '../components/RegistrationModal';
import { cn } from '@/lib/utils';
import type { Formation } from '@/types';
import toast from 'react-hot-toast';

interface FormationDetailProps {
  formation: Formation;
}

const levelConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BEGINNER: {
    label: 'Débutant',
    color: 'bg-green-500/10 text-green-700 border-green-500/20',
    icon: <Star className="h-4 w-4" />,
  },
  INTERMEDIATE: {
    label: 'Intermédiaire',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    icon: <Star className="h-4 w-4" />,
  },
  ADVANCED: {
    label: 'Avancé',
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    icon: <Star className="h-4 w-4" />,
  },
  EXPERT: {
    label: 'Expert',
    color: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: <Star className="h-4 w-4" />,
  },
};

export function FormationDetail({ formation }: FormationDetailProps) {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    formation.sessions?.[0]?.id
  );
  const [showAllSessions, setShowAllSessions] = useState(false);

  const nextSession = formation.sessions?.find((s) => new Date(s.startDate) > new Date());
  const upcomingSessions = formation.sessions
    ?.filter((s) => new Date(s.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) || [];

  const levelInfo = levelConfig[formation.level] || levelConfig.BEGINNER;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* ─── En-tête avec image ────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
          {formation.imageUrl && (
            <div className="absolute inset-0 opacity-10">
              <img
                src={buildImageUrl(formation.imageUrl, false)}
                alt={formation.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="relative p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {formation.category}
              </Badge>
              <Badge className={cn('text-xs border', levelInfo.color)}>
                <span className="flex items-center gap-1">
                  {levelInfo.icon}
                  {levelInfo.label}
                </span>
              </Badge>
              {formation.isPublished ? (
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                  Publiée
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Brouillon
                </Badge>
              )}
              {nextSession && (
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Prochaine session : {formatDate(nextSession.startDate)}
                </Badge>
              )}
            </div>

            <h1 className="font-ubuntu text-3xl font-bold md:text-4xl lg:text-5xl">
              {formation.title}
            </h1>
            <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
              {formation.description}
            </p>

            {/* Statistiques rapides */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-muted-foreground">Durée :</span>
                <span className="font-medium">{formation.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-secondary" />
                <span className="text-muted-foreground">Places :</span>
                <span className="font-medium">
                  {formation.maxParticipants ? `${formation.maxParticipants} pers.` : 'Illimité'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-secondary" />
                <span className="text-muted-foreground">Tarif :</span>
                <span className="font-medium text-primary">
                  {formation.price && formation.price > 0
                    ? `${formation.price.toLocaleString()} Ar`
                    : 'Gratuit'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Grille des métriques ────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: Clock,
              label: 'Durée',
              value: formation.duration,
            },
            {
              icon: Award,
              label: 'Niveau',
              value: levelInfo.label,
            },
            {
              icon: Users,
              label: 'Participants',
              value: formation.maxParticipants ? `${formation.maxParticipants}` : 'Illimité',
            },
            {
              icon: Calendar,
              label: 'Prochaine session',
              value: nextSession ? formatDate(nextSession.startDate) : 'À venir',
            },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="rounded-lg bg-secondary/10 p-2.5 text-secondary">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-medium text-sm">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Objectifs et Prérequis ──────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          {formation.objectives && (
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    Objectifs pédagogiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {formation.objectives}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {formation.prerequisites && (
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    Prérequis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {formation.prerequisites}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ─── Sessions ────────────────────────────────────────── */}
        {formation.sessions && formation.sessions.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Sessions disponibles
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {upcomingSessions.length} à venir
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const displaySessions = showAllSessions ? upcomingSessions : upcomingSessions.slice(0, 3);
                    if (displaySessions.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune session programmée pour le moment.
                        </p>
                      );
                    }
                    return displaySessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium">
                              {formatDate(session.startDate)} → {formatDate(session.endDate)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {session.status || 'Programmée'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {session.currentParticipants || 0} / {session.maxParticipants || '∞'}
                            </span>
                            {session.price !== undefined && session.price > 0 && (
                              <span className="flex items-center gap-1 text-primary">
                                <DollarSign className="h-3.5 w-3.5" />
                                {session.price.toLocaleString()} Ar
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setIsRegisterModalOpen(true);
                          }}
                        >
                          S'inscrire
                        </Button>
                      </motion.div>
                    ));
                  })()}

                  {upcomingSessions.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-muted-foreground"
                      onClick={() => setShowAllSessions(!showAllSessions)}
                    >
                      {showAllSessions ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Voir toutes les sessions ({upcomingSessions.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Points forts ────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                Pourquoi suivre cette formation ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Shield, text: 'Certification reconnue' },
                  { icon: Users, text: 'Formation en petit groupe' },
                  { icon: PlayCircle, text: 'Approche pratique et concrète' },
                  { icon: Star, text: 'Formateurs expérimentés' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                  >
                    <div className="rounded-full bg-secondary/10 p-1.5 text-secondary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Call to Action ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-center text-white"
        >
          <h2 className="font-ubuntu text-2xl font-bold">Prêt à commencer ?</h2>
          <p className="mt-2 text-white/80 max-w-lg mx-auto">
            Inscrivez-vous dès maintenant à cette formation et faites progresser votre carrière.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={() => setIsRegisterModalOpen(true)}
              disabled={!formation.isPublished}
            >
              {formation.isPublished ? (
                <>
                  S'inscrire maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Formation non disponible'
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => window.location.href = '/contact'}
            >
              Nous contacter
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Modal d’inscription ────────────────────────────────── */}
      <RegistrationModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        formationId={formation.id}
        formationTitle={formation.title}
        formationPrice={formation.price ?? 0}
        sessionId={selectedSessionId}
        onSessionChange={setSelectedSessionId}
        onSuccess={() => {
          toast.success('Inscription réussie ! Vous recevrez un email de confirmation.');
          setIsRegisterModalOpen(false);
        }}
      />
    </>
  );
}