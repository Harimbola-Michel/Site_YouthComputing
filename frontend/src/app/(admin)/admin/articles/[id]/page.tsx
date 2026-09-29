'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArticleForm } from './components/ArticleForm';
import { articles } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Chargement de l’article ──────────────────────────────
  const fetchArticle = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await articles.getById(id);
      
      // ✅ Extraction robuste : la structure de l'API peut varier
      const articleData = response?.data?.data ?? response?.data ?? null;
      
      if (!articleData) {
        throw new Error('Article introuvable');
      }
      setArticle(articleData);
    } catch (error: any) {
      console.error('Erreur chargement article:', error);
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      if (error.response?.status === 404) {
        setError('Article non trouvé');
        toast.error('Article introuvable');
      } else {
        setError('Impossible de charger l’article');
        toast.error('Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchArticle();
    }
  }, [authLoading, fetchArticle]);

  // ─── États de chargement / auth ──────────────────────────
  if (authLoading || loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/connexion')}>Se connecter</Button>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link href="/admin/articles">Retour à la liste</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/admin/articles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              {article?.title || 'Modifier l\'article'}
            </h1>
            <p className="text-muted-foreground">
              Modifiez le contenu de l’article.
            </p>
          </div>
        </div>

        <ArticleForm
          initialData={article}
          articleId={id}
          onSuccess={() => {
            toast.success('Article mis à jour ✅');
            router.push('/admin/articles');
          }}
          onCancel={() => router.push('/admin/articles')}
        />
      </div>
    </PageTransition>
  );
}