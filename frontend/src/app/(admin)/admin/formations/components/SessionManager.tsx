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
  RefreshCw,
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

interface SessionManagerProps {
  formationId: string;
  onSessionChange?: () => void;
}

const statusConfig = {
  SCHEDULED: { label: 'Programmée', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  ONGOING: { label: 'En cours', color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  COMPLETED: { label: 'Terminée', color: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
};

export function SessionManager({ formationId, onSessionChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
  });

  // ─── Fonction de recherche récursive d’un tableau ──────────
  const findArrayOfObjects = (obj: any, depth: number = 0): any[] | null => {
    if (depth > 3) return null; // limite pour éviter la récursion infinie
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj) && obj.length > 0 && obj.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
      return obj;
    }
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
        return value;
      }
      if (typeof value === 'object' && value !== null) {
        const result = findArrayOfObjects(value, depth + 1);
        if (result) return result;
      }
    }
    return null;
  };

  // ─── Chargement des sessions ──────────────────────────────
  const fetchSessions = async () => {
    if (!formationId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await formations.getSessions(formationId);
      
      console.group('🔍 Analyse de la réponse API');
      console.log('Réponse complète:', response);
      console.log('response.data:', response.data);
      console.log('Type de response.data:', typeof response.data);
      console.log('Structure de response.data:', JSON.stringify(response.data, null, 2));

      // 1. Extraction classique
      let sessionsData: any[] = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        sessionsData = response.data.data;
        console.log('✅ Cas 1: data.data est un tableau');
      } else if (response?.data && Array.isArray(response.data)) {
        sessionsData = response.data;
        console.log('✅ Cas 2: data est un tableau');
      } else if (response?.data?.sessions && Array.isArray(response.data.sessions)) {
        sessionsData = response.data.sessions;
        console.log('✅ Cas 3: data.sessions est un tableau');
      } else if (response?.data?.results && Array.isArray(response.data.results)) {
        sessionsData = response.data.results;
        console.log('✅ Cas 4: data.results est un tableau');
      } else {
        // 2. Recherche récursive dans toute la réponse
        console.log('🔎 Recherche récursive d’un tableau de sessions...');
        const found = findArrayOfObjects(response.data);
        if (found) {
          sessionsData = found;
          console.log('✅ Trouvé par recherche récursive');
        } else {
          console.warn('⚠️ Aucun tableau de sessions trouvé dans la réponse.');
        }
      }

      // 3. Filtrage final
      const validSessions = Array.isArray(sessionsData) 
        ? sessionsData.filter(s => s && typeof s === 'object' && s.id)
        : [];

      console.log(`✅ ${validSessions.length} session(s) valide(s) extraite(s)`);
      if (validSessions.length > 0) {
        console.log('📋 Première session:', validSessions[0]);
      }
      console.groupEnd();

      setSessions(validSessions);

    } catch (err: any) {
      console.error('❌ Erreur chargement sessions:', err);
      if (err?.response?.status === 404) {
        setSessions([]);
        setError(null);
        toast.info('Aucune session trouvée pour cette formation');
      } else {
        setError('Impossible de charger les sessions');
        toast.error('Erreur de chargement des sessions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [formationId]);

  // ─── Ajout ──────────────────────────────────────────────────
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de l’ajout';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Suppression ────────────────────────────────────────────
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    try {
      await formations.deleteSession(sessionId);
      toast.success('Session supprimée ✅');
      await fetchSessions();
      onSessionChange?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(msg);
    }
  };

  // ─── Rendu ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSessions} className="mt-2">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-ubuntu text-lg font-semibold">Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {sessions.length} session{sessions.length > 1 ? 's' : ''} programmée(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Actualiser
          </Button>
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
      </div>

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
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {sessions.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucune session programmée</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsAdding(true)}
            >
              Ajouter une session
            </Button>
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
                        {formatDate(session.startDate)} → {formatDate(session.endDate)}
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