'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageTransition } from '@/components/shared/PageTransition';
import { y2c } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Y2CEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || !isAuthenticated) return;
      try {
        setLoading(true);
        const response = await y2c.getEvent(id);
        const data = response?.data?.data || response?.data;
        setEvent(data);
      } catch (error) {
        toast.error('Erreur lors du chargement');
        router.push('/admin/y2c/evenements');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchEvent();
  }, [id, isAuthenticated, authLoading, router]);

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm(`Supprimer l’événement "${event.title}" ?`)) return;
    setIsDeleting(true);
    try {
      await y2c.deleteEvent(id);
      toast.success('Événement supprimé');
      router.push('/admin/y2c/evenements');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Veuillez vous connecter.</p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  if (!event) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg text-muted-foreground">Événement introuvable.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/y2c/evenements">Retour à la liste</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  const eventTypeLabels: Record<string, string> = {
    TRAINING: 'Formation',
    CONFERENCE: 'Conférence',
    WORKSHOP: 'Atelier',
    MEETUP: 'Meetup',
    TEAM_SETUP: 'Team Set Up',
    THREE_S: '3S',
    TEAM_REALIZE: 'Team Realize',
    COFFREDAY: 'Coffreday',
    HACKATHON: 'Hackathon',
    OTHER: 'Autre',
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/admin/y2c/evenements">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-ubuntu text-2xl font-bold">{event.title}</h1>
                <Badge variant={event.isPublished ? 'default' : 'secondary'}>
                  {event.isPublished ? 'Publié' : 'Brouillon'}
                </Badge>
                <Badge variant="outline">{eventTypeLabels[event.eventType] || event.eventType}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/y2c/evenements/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(event.startDate)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Lieu</p>
                <p className="font-medium">{event.location || 'Non spécifié'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="font-medium">{event.maxParticipants || 'Illimité'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Prix</p>
                <p className="font-medium">{event.isPaid ? `${event.price || 0} Ar` : 'Gratuit'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {event.description || 'Aucune description.'}
            </p>
          </CardContent>
        </Card>

        {/* Lien vers les inscriptions */}
        <div className="flex justify-end">
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/admin/y2c/evenements/${id}/inscriptions`}>
              <Users className="h-4 w-4" />
              Voir les inscriptions
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}