'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  CheckCircle,
  Smartphone,
  Send,
  X,
  Wallet,
  Copy,
  Banknote,
  Phone,
  User,
  Mail,
  FileText,
  Calendar,
  MapPin,
  Receipt,
  Building2,
  Users,
  Clock,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { FormationSession } from '@/types/formation.types';

// ─── Schéma de validation ──────────────────────────────────────
const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis (minimum 2 caractères)'),
  lastName: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  motivation: z.string().optional(),
  paymentMethod: z.enum(['mobile_money', 'bank_transfer']).default('mobile_money'),
  mobileMoneyOperator: z.string().optional(),
  paymentReference: z.string().min(6, 'La référence de paiement est requise (minimum 6 caractères)'),
  amountPaid: z.number({
    required_error: 'Veuillez saisir le montant que vous avez payé.',
    invalid_type_error: 'Le montant doit être un nombre.',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// ─── Props ─────────────────────────────────────────────────────
interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formationId: string;
  formationTitle: string;
  formationPrice?: number;
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  onSuccess?: () => void;
}

// ─── Opérateurs Mobile Money ──────────────────────────────────
const MOBILE_MONEY_OPERATORS = [
  {
    id: 'MVola',
    label: 'MVola',
    icon: '📱',
    phone: '034 05 123 45',
    instructions: 'Envoyez le montant exact via MVola en utilisant la référence ci-dessous.',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30',
  },
  {
    id: 'Airtel Money',
    label: 'Airtel Money',
    icon: '📶',
    phone: '034 05 678 90',
    instructions: 'Effectuez le paiement via Airtel Money avec la référence fournie.',
    color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30',
  },
  {
    id: 'Orange Money',
    label: 'Orange Money',
    icon: '🟠',
    phone: '034 05 111 22',
    instructions: 'Utilisez Orange Money et indiquez la référence dans le motif du virement.',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30',
  },
  {
    id: 'Telma Money',
    label: 'Telma Money',
    icon: '🔵',
    phone: '034 05 333 44',
    instructions: 'Payez par Telma Money en mentionnant la référence unique.',
    color: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800/30',
  },
];

export function RegistrationModal({
  open,
  onOpenChange,
  formationId,
  formationTitle,
  formationPrice = 0,
  sessionId,
  onSessionChange,
  onSuccess,
}: RegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessions, setSessions] = useState<FormationSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | undefined>(sessionId);
  const [selectedSessionPrice, setSelectedSessionPrice] = useState<number>(formationPrice);
  const [selectedSessionData, setSelectedSessionData] = useState<FormationSession | null>(null);
  const [sessionSearchOpen, setSessionSearchOpen] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      motivation: '',
      paymentMethod: 'mobile_money',
      mobileMoneyOperator: 'MVola',
      paymentReference: '',
      amountPaid: 0,
    },
  });

  const paymentMethod = form.watch('paymentMethod');
  const currentOperator = form.watch('mobileMoneyOperator');

  // ─── Générer une référence de paiement ──────────────────────
  const generatePaymentReference = () => {
    const prefix = 'YCF';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${random}-${timestamp}`;
  };

  // ─── Charger les sessions ──────────────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      if (!formationId) return;
      setLoadingSessions(true);
      try {
        const response = await formations.getSessions(formationId);
        let rawData: FormationSession[] = [];
        // Extraction robuste du tableau de sessions
        if (response?.data?.data && Array.isArray(response.data.data)) {
          rawData = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          rawData = response.data;
        } else if (response?.data?.sessions && Array.isArray(response.data.sessions)) {
          rawData = response.data.sessions;
        } else if (response?.data?.results && Array.isArray(response.data.results)) {
          rawData = response.data.results;
        } else {
          const findSessionsArray = (obj: any): FormationSession[] | null => {
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
                const result = findSessionsArray(value);
                if (result) return result;
              }
            }
            return null;
          };
          const found = findSessionsArray(response.data);
          if (found) rawData = found;
        }

        const upcoming = rawData
          .filter((s) => new Date(s.startDate) > new Date())
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const finalSessions = upcoming.length ? upcoming : rawData;
        setSessions(finalSessions);

        let defaultSessionId = sessionId;
        if (!defaultSessionId && finalSessions.length > 0) {
          defaultSessionId = finalSessions[0]?.id;
        }

        if (defaultSessionId) {
          const session = finalSessions.find((s) => s.id === defaultSessionId);
          if (session) {
            setSelectedSession(defaultSessionId);
            setSelectedSessionPrice(session.price ?? formationPrice);
            setSelectedSessionData(session);
            onSessionChange?.(defaultSessionId);
          }
        }
      } catch (err) {
        console.error('Erreur chargement sessions:', err);
        toast.error('Impossible de charger les sessions');
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [formationId, sessionId, onSessionChange, formationPrice]);

  // ─── Générer la référence à l'ouverture ────────────────────
  useEffect(() => {
    if (open) {
      const ref = generatePaymentReference();
      form.setValue('paymentReference', ref);
      form.setValue('amountPaid', 0);
    }
  }, [open, form]);

  // ─── Mise à jour du prix lors du changement de session ────
  const handleSessionChange = (val: string) => {
    const session = sessions.find((s) => s.id === val);
    if (session) {
      setSelectedSession(val);
      setSelectedSessionPrice(session.price ?? formationPrice);
      setSelectedSessionData(session);
      onSessionChange?.(val);
      form.setValue('amountPaid', 0);
      setSessionSearchOpen(false);
    }
  };

  // ─── Copier / regénérer ──────────────────────────────────
  const copyReference = () => {
    const ref = form.getValues('paymentReference');
    if (ref) {
      navigator.clipboard.writeText(ref);
      toast.success('Référence copiée !');
    }
  };

  const regenerateReference = () => {
    const ref = generatePaymentReference();
    form.setValue('paymentReference', ref);
    toast.success('Nouvelle référence générée');
  };

  const copyOperatorPhone = () => {
    const operator = MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator);
    if (operator) {
      navigator.clipboard.writeText(operator.phone);
      toast.success('Numéro de téléphone copié !');
    }
  };

  // ─── Soumission ─────────────────────────────────────────────
  const onSubmit = async (data: RegistrationFormData) => {
    if (!selectedSession) {
      toast.error('Veuillez sélectionner une session');
      return;
    }

    if (data.amountPaid !== selectedSessionPrice) {
      form.setError('amountPaid', {
        type: 'manual',
        message: `Le montant doit être exactement ${selectedSessionPrice.toLocaleString()} Ar.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        sessionId: selectedSession,
        paymentAmount: selectedSessionPrice,
      };
      await formations.register(formationId, payload);
      setIsSuccess(true);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
      setTimeout(() => setIsSuccess(false), 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-lg">
        {/* En-tête */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                <span className="text-secondary">S'inscrire</span>
                à la formation
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span>{formationTitle}</span>
                {selectedSessionPrice > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Wallet className="h-3 w-3" />
                    {selectedSessionPrice.toLocaleString()} Ar
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </div>

        <div className="p-6 pt-4">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 font-ubuntu text-xl font-semibold">Inscription confirmée !</h3>
              <p className="mt-2 text-muted-foreground">Vous recevrez un email de confirmation sous 48h.</p>
              <p className="mt-1 text-sm font-mono text-muted-foreground">Référence : {form.getValues('paymentReference')}</p>
              {selectedSessionPrice > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Montant : <span className="font-semibold">{selectedSessionPrice.toLocaleString()} Ar</span>
                </p>
              )}
              <Button variant="outline" className="mt-6" onClick={handleClose}>
                Fermer
              </Button>
            </motion.div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ─── SECTION : Session ────────────────────────── */}
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-secondary" />
                    {sessionId ? 'Session sélectionnée' : 'Choisissez votre session'}
                  </FormLabel>
                  {loadingSessions ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Chargement des sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune session disponible.</p>
                  ) : sessionId ? (
                    <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm">
                      {selectedSessionData ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {new Date(selectedSessionData.startDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' – '}
                            {selectedSessionData.location}
                          </span>
                          {selectedSessionData.price !== undefined && selectedSessionData.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Prix : {selectedSessionData.price.toLocaleString()} Ar
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>Session chargée</span>
                      )}
                    </div>
                  ) : (
                    // ─── Combobox avec recherche ────────────────
                    <Popover open={sessionSearchOpen} onOpenChange={setSessionSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={sessionSearchOpen}
                          className="w-full justify-between"
                        >
                          {selectedSession ? (
                            (() => {
                              const s = sessions.find((s) => s.id === selectedSession);
                              return s ? (
                                <span className="truncate">
                                  {new Date(s.startDate).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                  {' – '}
                                  {s.location}
                                  {s.price !== undefined && s.price > 0 && ` (${s.price.toLocaleString()} Ar)`}
                                </span>
                              ) : (
                                'Sélectionner une session'
                              );
                            })()
                          ) : (
                            'Sélectionner une session'
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une session..." />
                          <CommandList>
                            <CommandEmpty>Aucune session trouvée.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-60">
                                {sessions.map((s) => {
                                  const isSelected = selectedSession === s.id;
                                  const placesLeft = (s.maxParticipants ?? 0) - (s.currentParticipants ?? 0);
                                  return (
                                    <CommandItem
                                      key={s.id}
                                      value={s.id}
                                      onSelect={() => handleSessionChange(s.id)}
                                      className="flex flex-col items-start gap-1 py-2"
                                    >
                                      <div className="flex w-full items-center justify-between">
                                        <span className="font-medium">
                                          {new Date(s.startDate).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                          {' – '}
                                          {s.location}
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {s.price !== undefined && s.price > 0 && (
                                          <span className="flex items-center gap-1">
                                            <Wallet className="h-3 w-3" />
                                            {s.price.toLocaleString()} Ar
                                          </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {s.currentParticipants ?? 0} / {s.maxParticipants ?? '∞'}
                                        </span>
                                        {placesLeft > 0 && placesLeft <= 5 && (
                                          <span className="text-amber-600 font-semibold">
                                            Plus que {placesLeft} place{placesLeft > 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  {/* Détails de la session sélectionnée */}
                  {selectedSessionData && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedSessionData.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedSessionData.startDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedSessionData.startDate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {selectedSessionData.currentParticipants ?? 0} / {selectedSessionData.maxParticipants ?? '∞'}
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── SECTION : Identité ───────────────────────── */}
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary" />
                    Identité
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@email.com" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          Téléphone *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="034 12 345 67" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          Motivation
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Pourquoi souhaitez-vous suivre cette formation ?"
                            rows={2}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ─── SECTION : Paiement ───────────────────────── */}
                <div className="rounded-lg border-2 border-primary/10 p-4 space-y-4 bg-muted/5">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-secondary" />
                    Informations de paiement
                    {selectedSessionPrice > 0 && (
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        Montant : <span className="font-semibold text-primary">{selectedSessionPrice.toLocaleString()} Ar</span>
                      </span>
                    )}
                  </p>

                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(val) => form.setValue('paymentMethod', val as any)}
                    className="flex flex-col gap-2 sm:flex-row sm:gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="mobile_money" id="mm" />
                      <label htmlFor="mm" className="flex items-center gap-1 text-sm cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="bank_transfer" id="bt" />
                      <label htmlFor="bt" className="flex items-center gap-1 text-sm cursor-pointer">
                        <Building2 className="h-4 w-4" />
                        Virement bancaire
                      </label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="paymentReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Receipt className="h-3.5 w-3.5 text-secondary" />
                            Référence de paiement *
                            <span className="text-xs text-muted-foreground font-normal">
                              (copiable)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                placeholder="YCF-XXXXXX-XXXXXX"
                                disabled={isSubmitting}
                                className="font-mono text-sm pr-24"
                              />
                              <div className="absolute right-1 top-1 flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={copyReference}
                                  title="Copier"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={regenerateReference}
                                  title="Regénérer"
                                >
                                  <Loader2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Cette référence vous sera demandée lors du paiement.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                          Montant payé *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={`${selectedSessionPrice}`}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Saisissez le montant exact que vous avez envoyé (prix : {selectedSessionPrice.toLocaleString()} Ar).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AnimatePresence>
                    {paymentMethod === 'mobile_money' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <FormField
                          control={form.control}
                          name="mobileMoneyOperator"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                Opérateur Mobile Money *
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisissez un opérateur" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MOBILE_MONEY_OPERATORS.map((op) => (
                                    <SelectItem key={op.id} value={op.id}>
                                      <span className="flex items-center gap-2">
                                        <span>{op.icon}</span>
                                        {op.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {currentOperator && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              'rounded-lg border p-3 text-xs space-y-1',
                              MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.color
                            )}
                          >
                            <p className="font-medium flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-secondary" />
                              Coordonnées {currentOperator}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Numéro :</span>
                              <span className="font-mono font-medium">
                                {MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.phone}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={copyOperatorPhone}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-muted-foreground">
                              {MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.instructions}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {paymentMethod === 'bank_transfer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs space-y-1 border border-amber-100 dark:border-amber-800/30"
                    >
                      <p className="font-medium text-secondary flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Coordonnées bancaires
                      </p>
                      <div className="space-y-0.5 text-muted-foreground">
                        <p><span className="font-medium">Banque :</span> Bank of Africa</p>
                        <p><span className="font-medium">Compte :</span> 1234 5678 9012 3456</p>
                        <p><span className="font-medium">IBAN :</span> MG34 0000 1234 5678 9012</p>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Virement à effectuer avant le début de la formation en utilisant la référence ci-dessus.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* ─── Boutons ───────────────────────────────────── */}
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || sessions.length === 0}
                    className="gap-2 min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        S'inscrire
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground">
                  En vous inscrivant, vous acceptez les conditions générales de Youth Computing.
                  Vos données sont sécurisées et utilisées uniquement pour la gestion de votre inscription.
                </p>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}