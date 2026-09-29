'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// ─── Schéma de validation ──────────────────────────────────
const articleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  tags: z.string().optional(),
  status: z.string().default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const CATEGORIES = ['Actualités', 'Formations', 'Événements', 'Projets', 'Témoignages', 'Autre'];

interface ArticleFormProps {
  initialData?: any;
  articleId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ArticleForm({ initialData, articleId, onSuccess, onCancel }: ArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!articleId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      status: 'DRAFT',
      isFeatured: false,
    },
  });

  // ─── Remplir le formulaire avec les données initiales ───
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        content: initialData.content || '',
        excerpt: initialData.excerpt || '',
        category: initialData.category || '',
        tags: initialData.tags?.join(', ') || '',
        status: initialData.status || 'DRAFT',
        isFeatured: initialData.isFeatured || false,
      });
    }
  }, [initialData, reset]);

  const isPublished = watch('status') === 'PUBLISHED';
  const category = watch('category');

  // ─── Soumission ────────────────────────────────────────────
  const onSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
      };

      if (isEditing) {
        await articles.update(articleId!, payload);
        toast.success('Article mis à jour avec succès');
      } else {
        await articles.create(payload);
        toast.success('Article créé avec succès');
      }
      onSuccess?.();
    } catch (error: any) {
      const message = error?.response?.data?.message || 
                      error?.message || 
                      'Erreur lors de l’enregistrement';
      toast.error(message);
      console.error('Erreur soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="font-ubuntu text-xl">
            {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ─── Titre ─── */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
              disabled={isLoading}
              placeholder="Titre de l’article"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* ─── Catégorie + Tags ─── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-1">
                Catégorie <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => setValue('category', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="React, Next.js, Formation"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Exemple : React, Next.js, TypeScript
              </p>
            </div>
          </div>

          {/* ─── Extrait ─── */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              {...register('excerpt')}
              rows={2}
              disabled={isLoading}
              placeholder="Résumé de l’article (optionnel)"
            />
          </div>

          {/* ─── Contenu ─── */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-1">
              Contenu <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              {...register('content')}
              rows={10}
              className={errors.content ? 'border-destructive' : ''}
              disabled={isLoading}
              placeholder="Écrivez votre article en détail..."
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* ─── Options ─── */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="isFeatured"
                checked={watch('isFeatured')}
                onCheckedChange={(checked) => setValue('isFeatured', checked)}
                disabled={isLoading}
              />
              <Label htmlFor="isFeatured">Article en vedette</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={isPublished}
                onCheckedChange={(checked) => setValue('status', checked ? 'PUBLISHED' : 'DRAFT')}
                disabled={isLoading}
              />
              <Label htmlFor="status">Publier</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t bg-muted/10 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}