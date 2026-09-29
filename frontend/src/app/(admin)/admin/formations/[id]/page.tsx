'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  GraduationCap,
  MapPin,
  Trash2,
  Users,
  BookOpen,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formations } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { PageTransition } from '@/components/shared/PageTransition';
import { EditFormationModal } from '../components/EditFormationModal';
import { SessionManager } from '../components/SessionManager';
type Formation = {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives?: string;
  prerequisites?: string;
  duration: string;
  level: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
};

const levelConfig: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'Débutant', color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  INTERMEDIATE: { label: 'Intermédiaire', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  ADVANCED: { label: 'Avancé', color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  EXPERT: { label: 'Expert', color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
};

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFormation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await formations.getById(id);
      // ✅ Extraction robuste des données
      const data = response?.data?.data || response?.data;
      if (!data) throw new Error('Formation non trouvée');
      setFormation(data);
    } catch (err: any) {
      console.error('Erreur chargement formation:', err);
      setError(err?.message || 'Impossible de charger la formation');
      toast.error('Erreur lors du chargement de la formation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormation();
  }, [id]);

  const handleUpdate = () => fetchFormation();

  const handleDelete = async () => {
    if (!formation) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${formation.title}" ?\nCette action est irréversible.`)) return;
    setIsDeleting(true);
    try {
      await formations.delete(formation.id);
      toast.success('Formation supprimée avec succès');
      router.push('/admin/formations');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Erreur suppression:', error);
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!formation) return;
    try {
      await formations.togglePublish(formation.id);
      toast.success(formation.isPublished ? 'Formation dépubliée' : 'Formation publiée');
      handleUpdate();
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
      console.error('Erreur toggle publish:', error);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (error || !formation) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">Formation introuvable</h2>
            <p className="mt-2 text-muted-foreground">{error || "La formation demandée n'existe pas"}</p>
            <Button asChild className="mt-6">
              <Link href="/admin/formations">Retour à la liste</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const levelInfo = levelConfig[formation.level] || levelConfig.BEGINNER;
  const StatusIcon = formation.isPublished ? CheckCircle : XCircle;
  const statusLabel = formation.isPublished ? 'Publiée' : 'Brouillon';
  const statusColor = formation.isPublished
    ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
    : 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/admin/formations">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-ubuntu text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formation.title}
                </h1>
                <Badge variant="secondary" className={cn('gap-1.5 font-medium', statusColor)}>
                  <StatusIcon className="h-3 w-3" />
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {levelInfo.label}
                </span>
                <span className="text-muted-foreground/30">|</span>
                <Badge variant="outline">{formation.category}</Badge>
                <span className="text-muted-foreground/30">|</span>
                <span className="font-mono text-xs">{formation.slug}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleTogglePublish} className="gap-2">
              {formation.isPublished ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Dépublier
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publier
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="gap-2">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="font-ubuntu text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {formation.description || 'Aucune description disponible'}
              </p>
              {formation.objectives && (
                <>
                  <Separator className="my-4" />
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-secondary" />
                      Objectifs
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-1">
                      {formation.objectives}
                    </p>
                  </div>
                </>
              )}
              {formation.prerequisites && (
                <>
                  <Separator className="my-4" />
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      Prérequis
                    </h4>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-1">
                      {formation.prerequisites}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-ubuntu text-base">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Durée</p>
                    <p className="font-medium">{formation.duration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Niveau</p>
                    <Badge variant="secondary" className={cn('font-medium', levelInfo.color)}>
                      {levelInfo.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Prix</p>
                    <p className="font-medium">
                      {formation.price > 0 ? `${formation.price.toLocaleString()} Ar` : 'Gratuit'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Participants max</p>
                    <p className="font-medium">
                      {formation.maxParticipants ? `${formation.maxParticipants} personnes` : 'Illimité'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Créée le</p>
                    <p className="font-medium">{formatDate(formation.createdAt)}</p>
                  </div>
                </div>
                {formation.updatedAt && formation.updatedAt !== formation.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
                      <p className="font-medium">{formatDate(formation.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gestion des sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-ubuntu text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              Gestion des sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionManager
              formationId={formation.id}
              onSessionChange={handleUpdate}
            />
          </CardContent>
        </Card>

        {/* ID de la formation */}
        <div className="flex items-center justify-between rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <span>ID de la formation</span>
          <span className="font-mono">{formation.id}</span>
        </div>

        {/* Modal d'édition */}
        <EditFormationModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          formation={formation}
          onSuccess={() => {
            handleUpdate();
            setIsEditModalOpen(false);
            toast.success('Formation mise à jour ✅');
          }}
        />
      </div>
    </PageTransition>
  );
}