'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { recruitments } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Building,
  Calendar,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CandidatureForm } from '../components/CandidatureForm';
import { Recruitment } from '@/types/recruitment.types';

export default function PublicRecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecruitment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await recruitments.getBySlug(slug);
        const data = response?.data?.data || response?.data;
        if (!data) {
          setError('Offre introuvable');
          toast.error('Offre introuvable');
          return;
        }
        setRecruitment(data);
      } catch (error: any) {
        console.error('Erreur chargement offre:', error);
        const msg = error?.response?.data?.message || 'Impossible de charger l\'offre';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchRecruitment();
  }, [slug]);

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-96 mt-2" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !recruitment) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <h2 className="mt-4 font-ubuntu text-2xl font-bold">
              {error || 'Offre introuvable'}
            </h2>
            <Button asChild className="mt-4">
              <Link href="/recrutements">Retour aux offres</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isExpired = recruitment.deadline && new Date(recruitment.deadline) < new Date();

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link href="/recrutements">
            <ArrowLeft className="h-4 w-4" /> Retour aux offres
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">
              {recruitment.department}
            </Badge>
            <Badge
              variant={recruitment.isActive && !isExpired ? 'default' : 'secondary'}
              className={cn(
                recruitment.isActive && !isExpired && 'bg-green-500 hover:bg-green-600'
              )}
            >
              {recruitment.isActive && !isExpired ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Ouverte
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Fermée
                </span>
              )}
            </Badge>
            {isExpired && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                <Clock className="h-3 w-3 mr-1" /> Expirée
              </Badge>
            )}
          </div>
          <h1 className="font-ubuntu text-3xl font-bold mt-2">{recruitment.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building className="h-4 w-4" />
            {recruitment.position}
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Poste</p>
                <p className="font-medium">{recruitment.position}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Building className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Département</p>
                <p className="font-medium">{recruitment.department}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Date limite</p>
                <p className="font-medium">
                  {recruitment.deadline ? formatDate(recruitment.deadline) : 'Sans limite'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">Statut</p>
                <p className="font-medium">
                  {recruitment.isActive && !isExpired ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Ouverte
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Fermée
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                Description du poste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {recruitment.description}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                Prérequis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {recruitment.requirements || 'Aucun prérequis spécifié.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {recruitment.isActive && !isExpired ? (
          <div className="mt-8">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="font-ubuntu text-xl flex items-center gap-2">
                  <Send className="h-5 w-5 text-secondary" />
                  Postuler à cette offre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CandidatureForm
                  recruitmentId={recruitment.id}
                  onSuccess={() => {
                    // Optionnel : rediriger ou afficher un message
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-8 rounded-lg bg-muted/30 p-6 text-center border border-dashed">
            <p className="text-muted-foreground">
              {isExpired
                ? 'Cette offre est expirée. Vous ne pouvez plus postuler.'
                : 'Cette offre est actuellement fermée. Revenez plus tard.'}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}