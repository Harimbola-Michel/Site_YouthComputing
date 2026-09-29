'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Users,
  DollarSign,
  Loader2,
  X,
  Calendar,
  MapPin,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, cn } from '@/lib/utils';
import { FormationImageUpload } from './FormationImageUpload';

// ─── Niveaux avec les valeurs exactes attendues par le backend ──
const LEVELS = [
  { value: 'DÉBUTANT', label: 'Débutant' },
  { value: 'INTERMÉDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCÉ', label: 'Avancé' },
  { value: 'EXPERT', label: 'Expert' },
];

const CATEGORIES = [
  'Programmation Web',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Design',
  'Marketing Digital',
  'DevOps',
  'Mobile',
];

const formationSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  objectives: z.string().optional(),
  prerequisites: z.string().optional(),
  duration: z.string().min(1, 'La durée est requise'),
  level: z.string().min(1, 'Le niveau est requis'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Le prix ne peut pas être négatif').optional()
  ),
  category: z.string().min(1, 'La catégorie est requise'),
  imageUrl: z.string().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  maxParticipants: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(1, 'Le minimum est 1 participant').optional()
  ),
});

type FormationFormData = z.infer<typeof formationSchema>;

interface EditFormationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation: any;
  onSuccess?: () => void;
}

export function EditFormationModal({
  open,
  onOpenChange,
  formation,
  onSuccess,
}: EditFormationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingSessions, setIsUpdatingSessions] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'sessions'>('general');
  const [newSession, setNewSession] = useState({
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
  });

  const form = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: formation?.title || '',
      description: formation?.description || '',
      objectives: formation?.objectives || '',
      prerequisites: formation?.prerequisites || '',
      duration: formation?.duration || '',
      level: formation?.level || '',
      price: formation?.price ?? undefined,
      category: formation?.category || '',
      imageUrl: formation?.imageUrl || '',
      isPublished: formation?.isPublished || false,
      maxParticipants: formation?.maxParticipants ?? undefined,
    },
  });

  useEffect(() => {
    if (formation) {
      form.reset({
        title: formation.title || '',
        description: formation.description || '',
        objectives: formation.objectives || '',
        prerequisites: formation.prerequisites || '',
        duration: formation.duration || '',
        level: formation.level || '',
        price: formation.price ?? undefined,
        category: formation.category || '',
        imageUrl: formation.imageUrl || '',
        isPublished: formation.isPublished || false,
        maxParticipants: formation.maxParticipants ?? undefined,
      });
    }
  }, [formation, form]);

  const fetchSessions = async () => {
    if (!formation?.id) return;
    setSessionsLoading(true);
    try {
      const response = await formations.getSessions(formation.id);
      const sessionsData = response?.data?.data ?? response?.data ?? [];
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (open && formation?.id) {
      fetchSessions();
    }
    if (!open) {
      setIsAddingSession(false);
      setNewSession({ startDate: '', endDate: '', location: '', maxParticipants: '' });
    }
  }, [open, formation?.id]);

  const onSubmit = async (data: FormationFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        price: data.price ?? 0,
        maxParticipants: data.maxParticipants ?? undefined,
        imageUrl: data.imageUrl || null,
      };
      await formations.update(formation.id, payload);
      toast.success('Formation mise à jour ✅');
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errors = error?.formattedErrors || error?.response?.data?.errors;
      if (errors) {
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => form.setError(field as any, { message: msg }));
          }
        });
      } else {
        const message = error?.response?.data?.message || 'Erreur lors de la mise à jour';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

    setIsUpdatingSessions(true);
    try {
      const payload = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: newSession.location,
        maxParticipants: Number(newSession.maxParticipants) || 20,
      };
      await formations.addSession(formation.id, payload);
      toast.success('Session ajoutée ✅');
      setIsAddingSession(false);
      setNewSession({ startDate: '', endDate: '', location: '', maxParticipants: '' });
      await fetchSessions();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l\'ajout';
      toast.error(msg);
    } finally {
      setIsUpdatingSessions(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    setIsUpdatingSessions(true);
    try {
      await formations.deleteSession(sessionId);
      toast.success('Session supprimée ✅');
      await fetchSessions();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(msg);
    } finally {
      setIsUpdatingSessions(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* En-tête */}
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                  <GraduationCap className="h-5 w-5 text-secondary" />
                  Modifier la formation
                </DialogTitle>
                <DialogDescription>
                  Modifiez les informations de <strong>{formation?.title}</strong>
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* Onglets */}
          <div className="border-b border-border/50 px-6 pt-2">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'general' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('general')}
                className="rounded-b-none"
              >
                Général
              </Button>
              <Button
                variant={activeTab === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('sessions')}
                className="rounded-b-none"
              >
                Sessions {sessions.length > 0 && `(${sessions.length})`}
              </Button>
            </div>
          </div>

          <div className="p-6 pt-4">
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FormationImageUpload
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input className="pl-9" {...field} disabled={isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input className="pl-9" {...field} disabled={isSubmitting} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau <span className="text-destructive">*</span></FormLabel>
                          <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LEVELS.map((lvl) => (
                                <SelectItem key={lvl.value} value={lvl.value}>
                                  {lvl.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (Ar)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="150000"
                                className="pl-9"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>0 = gratuit</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participants max</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="20"
                                className="pl-9"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>Laissez vide pour illimité</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="objectives"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objectifs</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prerequisites"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prérequis</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publier</FormLabel>
                          <FormDescription>Visible sur le site public</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="sm:min-w-[100px]"
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[140px] gap-2">
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Mise à jour...</>
                      ) : (
                        <><GraduationCap className="h-4 w-4" /> Mettre à jour</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Onglet Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-ubuntu text-lg font-semibold">Sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérez les sessions de cette formation.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingSession(true)}
                    disabled={isAddingSession || isUpdatingSessions || sessionsLoading}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>

                {isAddingSession && (
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
                            disabled={isUpdatingSessions}
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
                            disabled={isUpdatingSessions}
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
                            disabled={isUpdatingSessions}
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
                            disabled={isUpdatingSessions}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingSession(false)}
                          disabled={isUpdatingSessions}
                        >
                          Annuler
                        </Button>
                        <Button size="sm" onClick={handleAddSession} disabled={isUpdatingSessions}>
                          {isUpdatingSessions ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Ajouter'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {sessionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : sessions.length === 0 && !isAddingSession ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Aucune session</p>
                    </CardContent>
                  </Card>
                ) : (
                  sessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {formatDate(session.startDate)} — {formatDate(session.endDate)}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {session.currentParticipants || 0} / {session.maxParticipants || '∞'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              session.status === 'SCHEDULED' &&
                                'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
                              session.status === 'ONGOING' &&
                                'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
                              session.status === 'COMPLETED' &&
                                'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
                              session.status === 'CANCELLED' &&
                                'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            )}
                          >
                            {session.status || 'SCHEDULED'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={isUpdatingSessions}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}