'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArticlesTable } from './components/ArticlesTable';
import { ArticleFormModal } from './components/ArticleFormModal';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminArticlesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Chargement des articles ──────────────────────────────
  const fetchArticles = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await articles.getAll();
      // Extraction robuste pour la structure { data: { data: [...] } }
      const articlesData = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];
      setData(articlesData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.push('/connexion');
        return;
      }
      if (error.response?.status === 403) {
        toast.error('Accès interdit – vous devez être administrateur.');
        return;
      }
      console.error('Erreur chargement articles:', error);
      toast.error('Impossible de charger les articles');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchArticles();
    }
  }, [authLoading, fetchArticles]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleAdd = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleArticleCreated = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
    fetchArticles();
    toast.success(editingArticle ? 'Article modifié ✅' : 'Article créé 🎉');
  };

  const handleDelete = async (article) => {
    try {
      await articles.delete(article.id);
      toast.success('Article supprimé');
      fetchArticles();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  // ✅ Nouveau handler pour la visualisation des commentaires
  const handleViewComments = (articleId: string) => {
    router.push(`/admin/comments?articleId=${articleId}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchArticles();
    setIsRefreshing(false);
    toast.success('✅ Liste actualisée');
  };

  // ─── États de chargement / auth ──────────────────────────
  if (authLoading) {
    return (
      <PageTransition>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ─── En-tête ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-ubuntu text-3xl font-bold tracking-tight text-foreground">
              Articles
            </h1>
            <p className="text-muted-foreground">
              Gérez les articles du blog de l’association.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Rafraîchir
            </Button>
            <Button
              onClick={handleAdd}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-4 w-4" />
              Nouvel article
            </Button>
          </div>
        </div>

        {/* ─── Tableau avec gestion des commentaires ──── */}
        <ArticlesTable
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewComments={handleViewComments}  // ✅ AJOUT : permet d'ouvrir la page des commentaires
        />

        {/* ─── Modal du formulaire ─────────────────────── */}
        <AnimatePresence>
          {isModalOpen && (
            <ArticleFormModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              article={editingArticle}
              onSuccess={handleArticleCreated}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}