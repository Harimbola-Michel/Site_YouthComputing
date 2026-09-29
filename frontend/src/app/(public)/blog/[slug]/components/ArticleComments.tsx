'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, MessageCircle, User, Mail, Calendar, CheckCircle } from 'lucide-react';
import { articles } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const commentSchema = z.object({
  authorName: z.string().min(2, 'Le nom est requis (minimum 2 caracteres)'),
  authorEmail: z.string().email('Adresse email invalide'),
  content: z.string().min(3, 'Le commentaire doit contenir au moins 3 caracteres').max(1000, 'Le commentaire ne doit pas depasser 1000 caracteres'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface ArticleCommentsProps {
  articleId: string;
}

function findCommentsArray(obj: any, depth: number = 0): any[] | null {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;
  if (Array.isArray(obj) && obj.length > 0 && obj.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
    return obj;
  }
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      const result = findCommentsArray(value, depth + 1);
      if (result) return result;
    }
  }
  return null;
}

export function ArticleComments({ articleId }: ArticleCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      authorName: '',
      authorEmail: '',
      content: '',
    },
  });

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articles.getComments(articleId);
      console.log('📦 Réponse API commentaires :', response);

      let commentsArray: any[] = [];
      if (response?.data) {
        const found = findCommentsArray(response.data);
        if (found) {
          commentsArray = found;
        } else {
          const directPaths = [
            response.data.data,
            response.data.comments,
            response.data.items,
            response.data.results,
            response.data,
          ];
          for (const path of directPaths) {
            if (Array.isArray(path) && path.length > 0 && path.every(item => typeof item === 'object' && 'id' in item)) {
              commentsArray = path;
              break;
            }
          }
        }
      }

      console.log(`✅ ${commentsArray.length} commentaires extraits.`);

      const normalized = commentsArray.map((c: any) => ({
        ...c,
        isApproved: c.isApproved ?? c.approved ?? false,
        authorName: c.authorName || c.name || 'Anonyme',
        authorEmail: c.authorEmail || c.email || '',
        content: c.content || c.message || '',
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
      }));

      // Filtrer les commentaires approuvés
      const approvedComments = normalized.filter((c: any) => c.isApproved !== false);
      setComments(approvedComments);
    } catch (err: any) {
      console.error('❌ Erreur chargement commentaires:', err);
      setError('Impossible de charger les commentaires');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      await articles.createComment({
        ...data,
        articleId,
      });
      toast.success('Commentaire envoyé ✅ Il sera visible après validation.');
      form.reset();
      await fetchComments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── États de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-2 border-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-secondary" />
            Commentaires
            <Skeleton className="h-4 w-8 ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ─── État d’erreur ────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-2 border-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-secondary" />
            Commentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchComments} className="mt-2">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────────
  return (
    <Card className="border-2 border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-secondary" />
          Commentaires
          <span className="text-sm text-muted-foreground font-normal">
            ({comments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun commentaire pour le moment.</p>
            <p className="text-sm text-muted-foreground/60">
              Soyez le premier à réagir ! (Les commentaires sont validés avant publication.)
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-muted"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-medium">
                      {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.isApproved && (
                        <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle className="h-3 w-3" />
                          Validé
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Formulaire d’ajout ────────────────────────────── */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-secondary" />
            Laisser un commentaire
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Votre nom"
                className="pl-9 border-2 focus:border-primary/50 transition-colors"
                {...form.register('authorName')}
                disabled={isSubmitting}
              />
              {form.formState.errors.authorName && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.authorName.message}</p>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Votre email"
                className="pl-9 border-2 focus:border-primary/50 transition-colors"
                {...form.register('authorEmail')}
                disabled={isSubmitting}
              />
              {form.formState.errors.authorEmail && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.authorEmail.message}</p>
              )}
            </div>
          </div>
          <Textarea
            placeholder="Votre commentaire..."
            rows={4}
            className="border-2 focus:border-primary/50 transition-colors resize-none"
            {...form.register('content')}
            disabled={isSubmitting}
          />
          {form.formState.errors.content && (
            <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
          )}
          <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Publier le commentaire'
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Votre commentaire sera visible après validation par un modérateur.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}