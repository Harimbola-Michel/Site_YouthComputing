'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, cn } from '@/lib/utils';

interface Session {
  id: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

interface SessionsListProps {
  sessions: Session[];
}

const statusConfig = {
  SCHEDULED: { label: 'Programmée', color: 'bg-blue-500/10 text-blue-600' },
  ONGOING: { label: 'En cours', color: 'bg-green-500/10 text-green-600' },
  COMPLETED: { label: 'Terminée', color: 'bg-gray-500/10 text-gray-600' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-500/10 text-red-600' },
};

export function SessionsList({ sessions }: SessionsListProps) {
  const upcomingSessions = sessions
    .filter((s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastSessions = sessions
    .filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED')
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary" />
          Sessions
          <Badge variant="outline" className="ml-2">
            {upcomingSessions.length} à venir
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sessions à venir */}
        {upcomingSessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">À venir</h4>
            {upcomingSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(session.startDate)} — {formatDate(session.endDate)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {session.currentParticipants} / {session.maxParticipants}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn('font-medium', statusConfig[session.status]?.color)}
                  >
                    {statusConfig[session.status]?.label || session.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sessions passées */}
        {pastSessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Passées</h4>
            {pastSessions.slice(0, 3).map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border p-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(session.startDate)} — {formatDate(session.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px]', statusConfig[session.status]?.color)}
                  >
                    {statusConfig[session.status]?.label || session.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
            {pastSessions.length > 3 && (
              <p className="text-center text-xs text-muted-foreground">
                + {pastSessions.length - 3} session(s) passée(s)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}