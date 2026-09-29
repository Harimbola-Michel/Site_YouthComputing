'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  BookOpen,
  Target,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import { RegistrationModal } from '../components/RegistrationModal';

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchFormation = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      setImageError(false);
      const response = await formations.getBySlug(slug);
      const data = response?.data?.data || response?.data;
      if (!data) {
        setError('Formation introuvable');
        return;
      }
      setFormation(data);
      if (data?.sessions?.length) {
        const upcoming = data.sessions.find((s: any) => new Date(s.startDate) > new Date());
        setSelectedSessionId(upcoming?.id || data.sessions[0]?.id);
      }
    } catch (err: any) {
      console.error('Erreur chargement formation:', err);
      setError(err?.message || 'Impossible de charger la formation');
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFormation();
  }, [fetchFormation]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid gap-8 lg:grid-cols-3 mt-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full mt-6" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !formation) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 max-w-5xl text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">Formation introuvable</h2>
          <p className="text-muted-foreground mt-2">{error || 'La formation que vous recherchez n\'existe pas.'}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push('/formations')}>
              Voir toutes les formations
            </Button>
            <Button variant="default" onClick={fetchFormation} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const nextSession = formation.sessions?.find((s: any) => new Date(s.startDate) > new Date());
  const hasSessions = formation.sessions && formation.sessions.length > 0;
  const availablePlaces = nextSession
    ? (nextSession.maxParticipants || 0) - (nextSession.currentParticipants || 0)
    : 0;
  const isFull = hasSessions && availablePlaces <= 0;

  const imageSrc = buildImageUrl(formation.imageUrl);
  const finalImage = imageError ? null : imageSrc;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero avec image */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-8 lg:grid-cols-3 items-start"
            >
              {/* Image */}
              <div className="lg:col-span-1">
                <div className="relative overflow-hidden rounded-xl shadow-lg aspect-video bg-gray-100">
                  {finalImage ? (
                    <img
                      src={finalImage}
                      alt={formation.title}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-6xl font-bold text-primary/10">
                        {formation.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Texte */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {formation.category || 'Non classé'}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {formation.level || 'Niveau non défini'}
                  </Badge>
                  {formation.isPublished && (
                    <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Publiée
                    </Badge>
                  )}
                </div>
                <h1 className="font-ubuntu text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {formation.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
                  {formation.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formation.duration || 'Durée non spécifiée'}
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {formation.maxParticipants || 'Illimité'} participants max
                  </span>
                  {nextSession && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Prochaine session : {formatDate(nextSession.startDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {formation.objectives && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="font-ubuntu text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    Objectifs
                  </h2>
                  <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {formation.objectives}
                    </p>
                  </div>
                </motion.div>
              )}

              {formation.prerequisites && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="font-ubuntu text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    Prérequis
                  </h2>
                  <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {formation.prerequisites}
                    </p>
                  </div>
                </motion.div>
              )}

              {hasSessions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="font-ubuntu text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    Sessions disponibles
                  </h2>
                  <div className="mt-4 space-y-3">
                    {formation.sessions
                      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((session: any) => {
                        const sessionPlaces = (session.maxParticipants || 0) - (session.currentParticipants || 0);
                        const isSessionFull = sessionPlaces <= 0;
                        return (
                          <Card key={session.id} className="border-2 border-primary/5 hover:border-primary/20 transition-colors">
                            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">
                                    {formatDate(session.startDate)}
                                    {session.endDate && ` → ${formatDate(session.endDate)}`}
                                  </span>
                                  <Badge variant={isSessionFull ? 'destructive' : 'secondary'}>
                                    {isSessionFull ? 'Complet' : `${sessionPlaces} places`}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {session.location || 'Lieu non défini'}
                                  </span>
                                  {session.price !== undefined && session.price > 0 && (
                                    <span className="flex items-center gap-1">
                                      Prix : {formatCurrency(session.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant={isSessionFull ? 'outline' : 'secondary'}
                                size="sm"
                                disabled={isSessionFull}
                                onClick={() => {
                                  setSelectedSessionId(session.id);
                                  setIsModalOpen(true);
                                }}
                              >
                                {isSessionFull ? 'Complet' : 'S\'inscrire'}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-2 border-primary/5 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" />
                      Résumé
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix</span>
                      <span className="font-bold text-primary">
                        {formation.price && formation.price > 0
                          ? formatCurrency(formation.price)
                          : 'Gratuit'}
                      </span>
                    </div>
                    {nextSession && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prochaine session</span>
                          <span className="font-medium">
                            {formatDate(nextSession.startDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Places disponibles</span>
                          <span className={availablePlaces > 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                            {availablePlaces > 0 ? availablePlaces : 'Complet'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Niveau</span>
                      <Badge variant="secondary">{formation.level || 'Non défini'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée</span>
                      <span>{formation.duration || 'Non spécifiée'}</span>
                    </div>

                    <Button
                      onClick={() => setIsModalOpen(true)}
                      disabled={isFull}
                      className="w-full gap-2 group"
                      size="lg"
                    >
                      <Calendar className="h-4 w-4" />
                      S'inscrire
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    {isFull && (
                      <p className="text-xs text-center text-destructive">
                        Toutes les sessions sont complètes.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      Inscription sécurisée
                    </p>
                    <p>Paiement en ligne accepté (Mobile Money, virement).</p>
                    <p className="pt-1 border-t">Certificat de formation délivré à la fin.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <RegistrationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          formationId={formation.id}
          formationTitle={formation.title}
          formationPrice={formation.price}
          sessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
          onSuccess={() => {
            setIsModalOpen(false);
            toast.success('Inscription confirmée !');
            fetchFormation();
          }}
        />
      </div>
    </PageTransition>
  );
}