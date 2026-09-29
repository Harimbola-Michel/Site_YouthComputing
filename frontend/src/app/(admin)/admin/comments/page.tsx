'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageTransition } from '@/components/shared/PageTransition';
import { CommentsTable, Comment } from '../articles/components/CommentsTable';
import { comments, articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminCommentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('articleId');

  const [data, setData] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleTitle, setArticleTitle] = useState<string>('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      let commentsData: Comment[] = [];

      if (articleId) {
        // Utilise la route admin pour récupérer tous les commentaires (y compris non approuvés)
        const response = await comments.getByArticleAdmin(articleId);
        commentsData = response?.data?.data ?? response?.data ?? [];

        // Récupère le titre de l'article
        try {
          const articleRes = await articles.getById(articleId);
          setArticleTitle(articleRes?.data?.data?.title || '');
        } catch {
          setArticleTitle('');
        }
      } else {
        // Récupère les commentaires en attente
        const response = await comments.getPending();
        commentsData = response?.data?.data ?? response?.data ?? [];
      }

      console.log('📦 Commentaires chargés :', commentsData);
      setData(Array.isArray(commentsData) ? commentsData : []);
    } catch (error: any) {
      console.error('❌ Erreur chargement commentaires:', error);
      toast.error('Impossible de charger les commentaires');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleApprove = async (id: string) => {
    try {
      await comments.approve(id);
      toast.success('Commentaire approuvé');
      await fetchComments();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await comments.delete(id);
      toast.success('Commentaire supprimé');
      await fetchComments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const handleViewArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">
            {articleId ? (
              <>
                Commentaires de l’article{' '}
                {articleTitle && <span className="text-secondary">« {articleTitle} »</span>}
              </>
            ) : (
              'Gestion des commentaires'
            )}
          </h1>
        </div>

        <CommentsTable
          data={data}
          loading={loading}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onViewArticle={handleViewArticle}
        />
      </div>
    </PageTransition>
  );
}