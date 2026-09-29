'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { FormationSession } from '@/types';

interface FormationSessionCalendarProps {
  sessions: FormationSession[];
}

export function FormationSessionCalendar({ sessions }: FormationSessionCalendarProps) {
  const upcomingSessions = sessions
    .filter((s) => new Date(s.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Aucune session programmée pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg">Sessions à venir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingSessions.slice(0, 3).map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(session.startDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{session.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {session.currentParticipants} / {session.maxParticipants}
                  </span>
                </div>
              </div>
              <Badge
                variant={
                  session.currentParticipants >= session.maxParticipants
                    ? 'destructive'
                    : 'default'
                }
              >
                {session.currentParticipants >= session.maxParticipants
                  ? 'Complet'
                  : 'Disponible'}
              </Badge>
            </div>
          </motion.div>
        ))}

        {upcomingSessions.length === 0 && (
          <p className="text-center text-muted-foreground">
            Aucune session à venir.
          </p>
        )}
      </CardContent>
    </Card>
  );
}