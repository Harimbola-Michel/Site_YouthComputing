'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, cn } from '@/lib/utils';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

interface SessionsTableProps {
  formationId: string;
  onSessionChange?: () => void;
}

const statusConfig = {
  SCHEDULED: { label: 'Programmée', color: 'bg-blue-500/10 text-blue-600' },
  ONGOING: { label: 'En cours', color: 'bg-green-500/10 text-green-600' },
  COMPLETED: { label: 'Terminée', color: 'bg-gray-500/10 text-gray-600' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-500/10 text-red-600' },
};

export function SessionsTable({ formationId, onSessionChange }: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSession, setNewSession] = useState({
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
  });

  const fetchSessions = async () => {
    if (!formationId) return;
    setLoading(true);
    try {
      const response = await formations.getSessions(formationId);
      const data = response?.data?.data || response?.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
      toast.error('Impossible de charger les sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [formationId]);

  const handleAddSession = async () => {
    if (!newSession.startDate || !newSession.endDate || !newSession.location) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const start = new Date(newSession.startDate);
    const end = new Date(newSession.endDate);
    if (end <= start) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: newSession.location,
        maxParticipants: Number(newSession.maxParticipants) || 20,
      };
      await formations.addSession(formationId, payload);
      toast.success('Session ajoutée ✅');
      setIsAdding(false);
      setNewSession({ startDate: '', endDate: '', location: '', maxParticipants: '' });
      await fetchSessions();
      onSessionChange?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l’ajout';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    try {
      await formations.deleteSession(sessionId);
      toast.success('Session supprimée ✅');
      await fetchSessions();
      onSessionChange?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et bouton d’ajout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-ubuntu text-lg font-semibold">Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {sessions.length} session{sessions.length > 1 ? 's' : ''} programmée(s)
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {/* Formulaire d’ajout */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-primary/10">
              <CardContent className="p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date de début *</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.startDate}
                      onChange={(e) =>
                        setNewSession({ ...newSession, startDate: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin *</Label>
                    <Input
                      type="datetime-local"
                      value={newSession.endDate}
                      onChange={(e) =>
                        setNewSession({ ...newSession, endDate: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lieu *</Label>
                    <Input
                      placeholder="Lieu"
                      value={newSession.location}
                      onChange={(e) =>
                        setNewSession({ ...newSession, location: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Participants max</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={newSession.maxParticipants}
                      onChange={(e) =>
                        setNewSession({ ...newSession, maxParticipants: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleAddSession} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des sessions */}
      {sessions.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucune session programmée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const status = statusConfig[session.status] || statusConfig.SCHEDULED;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium">
                        {formatDate(session.startDate)} – {formatDate(session.endDate)}
                      </span>
                      <Badge variant="secondary" className={cn('font-medium', status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {session.currentParticipants} / {session.maxParticipants || '∞'}
                      </span>
                      {session.status === 'SCHEDULED' && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-3.5 w-3.5" />
                          À venir
                        </span>
                      )}
                      {session.status === 'COMPLETED' && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Terminée
                        </span>
                      )}
                      {session.status === 'CANCELLED' && (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3.5 w-3.5" />
                          Annulée
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}