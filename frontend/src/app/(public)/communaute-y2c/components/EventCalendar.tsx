'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { y2c } from '@/lib/api';
import toast from 'react-hot-toast';
import { EventRegistrationModal } from './EventRegistrationModal';

type Event = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location: string;
  eventType: string;
  description?: string;
  maxParticipants?: number;
};

const eventTypeColors: Record<string, string> = {
  TRAINING: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  CONFERENCE: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  WORKSHOP: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  MEETUP: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  TEAM_SETUP: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  THREE_S: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  TEAM_REALIZE: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  COFFREDAY: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  HACKATHON: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  OTHER: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
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
  return labels[type] || type;
};

export function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const response = await y2c.getEvents();
        let rawData = response?.data?.data || response?.data || [];
        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
          rawData = rawData.data || [];
        }
        const normalized = Array.isArray(rawData) ? rawData : [];
        setEvents(normalized);
        setError(null);
      } catch (error: any) {
        console.error('❌ Erreur chargement événements:', error);
        const msg = error?.response?.data?.message || 'Impossible de charger les événements';
        setError(msg);
        toast.error(msg);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    // Optionnel : rafraîchir les données ou afficher un message
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-primary/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-destructive/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeEvents = Array.isArray(events) ? events : [];

  if (safeEvents.length === 0) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-primary/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Événements à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground font-medium">
              Aucun événement programmé
            </p>
            <p className="text-sm text-muted-foreground/60">
              Revenez bientôt pour découvrir nos prochaines activités.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayEvents = safeEvents.slice(0, 5);

  return (
    <>
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-primary/5 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Événements à venir
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {safeEvents.length} événement{safeEvents.length > 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group relative rounded-lg border border-border/50 p-4 transition-all hover:border-secondary/30 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-medium text-foreground group-hover:text-secondary transition-colors truncate">
                      {event.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={cn(
                        'text-[10px] uppercase font-medium',
                        eventTypeColors[event.eventType] || eventTypeColors.OTHER
                      )}
                    >
                      {getTypeLabel(event.eventType)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-8"
                      onClick={() => handleRegisterClick(event)}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      S'inscrire
                    </Button>
                  </div>
                </div>
                {event.description && (
                  <p className="mt-2 text-sm text-muted-foreground/80 line-clamp-2">
                    {event.description}
                  </p>
                )}
                {event.maxParticipants && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Users className="h-3 w-3" />
                    <span>Max {event.maxParticipants} participants</span>
                  </div>
                )}
                <div className="absolute -right-2 -top-2 h-10 w-10 rounded-full bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>

          {safeEvents.length > 5 && (
            <div className="text-center pt-1">
              <span className="text-xs text-muted-foreground/60">
                + {safeEvents.length - 5} autre{safeEvents.length - 5 > 1 ? 's' : ''} événement{safeEvents.length - 5 > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <EventRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        event={selectedEvent}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  );
}