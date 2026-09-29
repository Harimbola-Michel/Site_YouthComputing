'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  MoreVertical,
  FileText,
  Receipt,
  Wallet,
  Users,
  GraduationCap,
  Send,
  CreditCard,
  Building2,
  Award,
  CalendarDays,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate, cn } from '@/lib/utils';
import { registrations } from '@/lib/api';
import toast from 'react-hot-toast';
import { EmailModal } from './components/EmailModal';

// ─── Configuration des statuts ──────────────────────────────
const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: 'En attente',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800/30',
  },
  CONFIRMED: {
    label: 'Confirmée',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800/30',
  },
  CANCELLED: {
    label: 'Annulée',
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/30',
  },
  COMPLETED: {
    label: 'Terminée',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/30',
  },
  WAITING_LIST: {
    label: "Liste d'attente",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/30',
  },
};

const paymentConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  PENDING: {
    label: 'En attente',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  PAID: {
    label: 'Payé',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  FAILED: {
    label: 'Échoué',
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  REFUNDED: {
    label: 'Remboursé',
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: 'text-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
  },
  PARTIAL: {
    label: 'Partiel',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'confirm' | 'cancel' | 'delete';
  }>({ open: false, action: 'confirm' });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const fetchRegistration = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await registrations.getById(id);
      const data = response?.data?.data || response?.data;
      if (!data) {
        setError('Inscription introuvable');
        return;
      }
      setRegistration(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement inscription:', err);
      setError(err?.response?.data?.message || 'Impossible de charger l\'inscription');
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRegistration();
  }, [id, fetchRegistration]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRegistration();
    setRefreshing(false);
    toast.success('Actualisé ✅');
  };

  const handleAction = async (action: 'confirm' | 'cancel' | 'delete') => {
    setActionLoading(true);
    try {
      if (action === 'confirm') {
        await registrations.confirm(id);
        toast.success('Inscription confirmée ✅');
      } else if (action === 'cancel') {
        await registrations.cancel(id);
        toast.success('Inscription annulée ❌');
      } else if (action === 'delete') {
        await registrations.delete(id);
        toast.success('Inscription supprimée 🗑️');
        router.push('/admin/inscriptions');
        return;
      }
      await fetchRegistration();
      setConfirmDialog({ open: false, action: 'confirm' });
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l\'action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailSent = () => {
    toast.success('Email envoyé avec succès 📧');
  };

  // ─── États de chargement ──────────────────────────────────
  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (error || !registration) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Inscription introuvable</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            {error || "Cette inscription n'existe pas ou a été supprimée."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/admin/inscriptions">Retour à la liste</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  const status = statusConfig[registration.status] || statusConfig.PENDING;
  const payment = paymentConfig[registration.paymentStatus] || paymentConfig.PENDING;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* ─── En-tête ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/admin/inscriptions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-ubuntu text-2xl font-bold tracking-tight">
                  Inscription #{registration.id.slice(-6)}
                </h1>
                <Badge variant="outline" className={cn('gap-1.5 font-medium border', status.border, status.bg, status.color)}>
                  {status.icon}
                  {status.label}
                </Badge>
                <Badge variant="outline" className={cn('gap-1.5 font-medium', payment.bg, payment.color)}>
                  {payment.icon}
                  {payment.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(registration.createdAt)}
                </span>
                <span className="text-muted-foreground/30">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(registration.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => setIsEmailModalOpen(true)}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            {registration.status !== 'CONFIRMED' && registration.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-green-600 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-950/30"
                onClick={() => setConfirmDialog({ open: true, action: 'confirm' })}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Confirmer</span>
              </Button>
            )}
            {registration.status !== 'CANCELLED' && registration.status !== 'COMPLETED' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-amber-600 border-amber-600/30 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={() => setConfirmDialog({ open: true, action: 'cancel' })}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Annuler</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2 text-destructive"
                  onClick={() => setConfirmDialog({ open: true, action: 'delete' })}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* ─── Grille d'informations ───────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Participant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4 text-secondary" />
                  Participant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium text-base">
                    {registration.firstName} {registration.lastName}
                  </p>
                </div>
                <Separator className="my-2" />
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </p>
                  <a href={`mailto:${registration.email}`} className="text-primary hover:underline break-all">
                    {registration.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    Téléphone
                  </p>
                  <a href={`tel:${registration.phone}`} className="text-primary hover:underline">
                    {registration.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Titre</p>
                  <p className="font-medium">
                    {registration.Formation?.title || registration.formation?.title || 'N/A'}
                  </p>
                </div>
                {registration.FormationSession && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Session
                      </p>
                      <p className="font-medium">
                        {formatDate(registration.FormationSession.startDate)}
                        {registration.FormationSession.endDate &&
                          ` → ${formatDate(registration.FormationSession.endDate)}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {registration.FormationSession.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Participants
                      </p>
                      <p className="font-medium">
                        {registration.FormationSession.currentParticipants || 0} /{' '}
                        {registration.FormationSession.maxParticipants || '∞'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <Receipt className="h-4 w-4 text-secondary" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    Montant
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {registration.paymentAmount && registration.paymentAmount > 0
                      ? `${registration.paymentAmount.toLocaleString()} Ar`
                      : 'Gratuit'}
                  </p>
                </div>
                <Separator className="my-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-mono text-sm bg-muted/50 px-2 py-1 rounded break-all">
                    {registration.paymentReference || 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={cn('gap-1.5 font-medium', payment.bg, payment.color)}>
                    {payment.icon}
                    {payment.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Motivation ───────────────────────────────────────── */}
        {registration.motivation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-secondary" />
                  Motivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {registration.motivation}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── ID ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
        >
          <span>ID de l'inscription</span>
          <span className="font-mono">{registration.id}</span>
        </motion.div>

        {/* ─── Modal d'envoi d'email ──────────────────────────── */}
        <EmailModal
          open={isEmailModalOpen}
          onOpenChange={setIsEmailModalOpen}
          registration={registration}
          onSuccess={handleEmailSent}
        />

        {/* ─── Dialogue de confirmation ────────────────────────── */}
        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.action === 'confirm' && 'Confirmer l\'inscription'}
                {confirmDialog.action === 'cancel' && 'Annuler l\'inscription'}
                {confirmDialog.action === 'delete' && 'Supprimer l\'inscription'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.action === 'confirm' &&
                  'Cette action confirmera l\'inscription. L\'utilisateur recevra une notification.'}
                {confirmDialog.action === 'cancel' &&
                  'Cette action annulera l\'inscription. L\'utilisateur en sera informé.'}
                {confirmDialog.action === 'delete' &&
                  'Cette action supprimera définitivement l\'inscription. Cette opération est irréversible.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction(confirmDialog.action)}
                disabled={actionLoading}
                className={
                  confirmDialog.action === 'confirm'
                    ? 'bg-green-600 hover:bg-green-700'
                    : confirmDialog.action === 'cancel'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-destructive hover:bg-destructive/90'
                }
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : confirmDialog.action === 'confirm' ? (
                  'Confirmer'
                ) : confirmDialog.action === 'cancel' ? (
                  'Annuler'
                ) : (
                  'Supprimer'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}