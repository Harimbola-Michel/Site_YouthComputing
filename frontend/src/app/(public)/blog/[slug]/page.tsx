'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArticleContent } from './components/ArticleContent';
import { ArticleAuthor } from './components/ArticleAuthor';
import { ArticleComments } from './components/ArticleComments';
import { RelatedArticles } from './components/RelatedArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Bookmark, Heart, Loader2, ImageOff } from 'lucide-react';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils'; // ✅ Import

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // ✅ État pour gérer l'erreur de chargement de l'image
  const [imageError, setImageError] = useState(false);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setImageError(false); // Reset image error
      const response = await articles.getBySlug(slug);
      const data = response?.data?.data ?? response?.data;
      if (!data) {
        setError('Article introuvable');
        return;
      }
      setArticle(data);
      setLikeCount(data.likes || 0);

      // Charger les articles liés (même catégorie)
      setLoadingRelated(true);
      const relatedResponse = await articles.getAll({ status: 'PUBLISHED' });
      const allArticles =
        relatedResponse?.data?.data?.data ??
        relatedResponse?.data?.data ??
        relatedResponse?.data ??
        [];
      const related = Array.isArray(allArticles)
        ? allArticles
            .filter((a: any) => a.slug !== slug && a.category === data.category)
            .slice(0, 3)
        : [];
      setRelatedArticles(related);
    } catch (err: any) {
      console.error('Erreur chargement article:', err);
      setError(err?.message || 'Impossible de charger l\'article');
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
      setLoadingRelated(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug, fetchArticle]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article?.title, url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers !');
      } catch {
        toast.error('Impossible de copier le lien');
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    // Ici vous pouvez appeler une API pour enregistrer le like
  };

  // ─── Construction de l'URL de l'image avec fallback ───
  const imageSrc = article?.featuredImage ? buildImageUrl(article.featuredImage, true) : null;
  const showImagePlaceholder = !imageSrc || imageError;

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-3 mt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !article) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive">Article introuvable</h2>
          <p className="text-muted-foreground mt-2">{error || "L'article demandé n'existe pas."}</p>
          <Button asChild className="mt-6">
            <Link href="/blog">Retour au blog</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ─── Barre d'outils ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-secondary text-secondary')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-secondary transition-colors gap-0.5"
              onClick={handleLike}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-secondary text-secondary')} />
              {likeCount > 0 && <span className="text-xs font-medium ml-0.5">{likeCount}</span>}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* ─── Image de couverture avec fallback ───────────────── */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
            {showImagePlaceholder ? (
              <div className="flex h-[300px] w-full flex-col items-center justify-center bg-gray-50 md:h-[400px]">
                <ImageOff className="h-16 w-16 text-gray-300" />
                <span className="mt-4 text-sm text-gray-400">Image non disponible</span>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* ─── Contenu ───────────────────────────────────── */}
          <ArticleContent article={article} />

          {/* ─── Auteur ────────────────────────────────────── */}
          <div className="border-t border-b py-6 my-8">
            <ArticleAuthor article={article} />
          </div>

          {/* ─── Commentaires ──────────────────────────────── */}
          <div className="border-t pt-8">
            <ArticleComments articleId={article.id} />
          </div>

          {/* ─── Articles similaires ───────────────────────── */}
          {relatedArticles.length > 0 && (
            <div className="border-t pt-8">
              <RelatedArticles articles={relatedArticles} loading={loadingRelated} />
            </div>
          )}
        </motion.div>
      </article>
    </PageTransition>
  );
}