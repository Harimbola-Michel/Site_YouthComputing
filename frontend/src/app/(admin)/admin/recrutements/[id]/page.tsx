'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Users,
  FileText,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { recruitments } from '@/lib/api';
import { extractDataArray } from '@/lib/api-helpers';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { PageTransition } from '@/components/shared/PageTransition';
import { CandidaturesTable } from '../components/CandidaturesTable';

export default function RecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [recruitment, setRecruitment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [candidatureCount, setCandidatureCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement de l’offre ────────────────────────────────────
  const fetchRecruitment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await recruitments.getById(id);
      const data = response?.data?.data || response?.data;

      if (!data) {
        throw new Error('Offre non trouvée');
      }

      setRecruitment(data);

      // ✅ Extraction robuste du nombre de candidatures
      let count = 0;
      if (data.candidatures && Array.isArray(data.candidatures)) {
        count = data.candidatures.length;
      } else if (data._count && typeof data._count.candidatures === 'number') {
        count = data._count.candidatures;
      } else if (typeof data.candidatureCount === 'number') {
        count = data.candidatureCount;
      } else if (data.candidatures && typeof data.candidatures === 'object') {
        // Extraction des candidatures imbriquées
        const found = extractDataArray(data.candidatures, null);
        if (found && Array.isArray(found)) {
          count = found.length;
        }
      }
      setCandidatureCount(count);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
      setError(err?.message || 'Impossible de charger l’offre');
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecruitment();
  }, [fetchRecruitment]);

  // ─── Rafraîchissement ──────────────────────────────────────────
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchRecruitment();
    setIsRefreshing(false);
    if (!error) toast.success('✅ Données actualisées');
  };

  // ─── Suppression ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!recruitment) return;
    if (!confirm(`Supprimer l’offre "${recruitment.title}" ? Cette action est irréversible.`)) return;
    setIsDeleting(true);
    try {
      await recruitments.delete(id);
      toast.success('Offre supprimée ✅');
      router.push('/admin/recrutements');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── États de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-1" /></div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageTransition>
    );
  }

  // ─── Erreur ─────────────────────────────────────────────────────
  if (error || !recruitment) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Offre introuvable</h2>
            <p className="text-muted-foreground">{error || "L’offre demandée n’existe pas"}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button asChild>
                <Link href="/admin/recrutements">Retour à la liste</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────────
  const isActive = recruitment.isActive;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/admin/recrutements">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-ubuntu text-2xl font-bold">{recruitment.title}</h1>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={cn(
                    isActive && 'bg-green-500 hover:bg-green-600'
                  )}
                >
                  {isActive ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Fermée
                    </span>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {recruitment.position} • {recruitment.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Actualisation...' : 'Rafraîchir'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/recrutements/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
          </div>
        </div>

        {/* ─── Informations ──────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{recruitment.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Département</p>
                  <p className="font-medium">{recruitment.department}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Poste</p>
                  <p className="font-medium">{recruitment.position}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Date limite</p>
                  <p className="font-medium">
                    {recruitment.deadline ? formatDate(recruitment.deadline) : 'Sans limite'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Candidatures reçues</p>
                  <p className="font-medium text-lg flex items-center gap-2">
                    {candidatureCount}
                    {candidatureCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {candidatureCount === 1 ? '1 dossier' : `${candidatureCount} dossiers`}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Prérequis ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-secondary" /> Prérequis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{recruitment.requirements}</p>
          </CardContent>
        </Card>

        {/* ─── Candidatures ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Candidatures reçues
              <Badge variant="outline" className="ml-2">
                {candidatureCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CandidaturesTable recruitmentId={id} onRefresh={handleRefresh} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}