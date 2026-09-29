// app/(admin)/admin/articles/components/ArticleFormModal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Tag,
  Loader2,
  X,
  Star,
  Pencil,
  Image as ImageIcon,
  Upload,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
// ✅ Import de l'API principale
import { api, articles } from '@/lib/api';
import { buildImageUrl } from '@/lib/imageUtils';
import toast from 'react-hot-toast';
import { Article } from './ArticlesTable';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
const CATEGORIES = [
  'Actualités',
  'Formations',
  'Événements',
  'Projets',
  'Témoignages',
  'Technologie',
  'Autre',
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'PUBLISHED', label: 'Publié' },
  { value: 'ARCHIVED', label: 'Archivé' },
  { value: 'SCHEDULED', label: 'Programmé' },
];

// ─── Schéma de validation ──────────────────────────────────
const articleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  content: z.string().min(20, 'Le contenu doit contenir au moins 20 caractères'),
  excerpt: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  tags: z.string().optional(),
  status: z.string().default('DRAFT'),
  isFeatured: z.boolean().default(false),
  featuredImage: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
  onSuccess?: () => void;
}

// ─── Composant Modal ────────────────────────────────────────
export function ArticleFormModal({
  open,
  onOpenChange,
  article,
  onSuccess,
}: ArticleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!article;

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      status: 'DRAFT',
      isFeatured: false,
      featuredImage: '',
    },
  });

  // ─── Remplir le formulaire en mode édition ──────────────
  useEffect(() => {
    if (open && article) {
      const imageUrl = article.featuredImage || '';
      form.reset({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: article.tags?.join(', ') || '',
        status: article.status || 'DRAFT',
        isFeatured: article.isFeatured || false,
        featuredImage: imageUrl,
      });
      if (imageUrl) {
        setImagePreview(buildImageUrl(imageUrl, false));
        setImageError(false);
      } else {
        setImagePreview(null);
      }
    }
    if (open && !article) {
      form.reset({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        status: 'DRAFT',
        isFeatured: false,
        featuredImage: '',
      });
      setImagePreview(null);
      setImageError(false);
    }
  }, [open, article, form]);

  const isFeatured = form.watch('isFeatured');
  const status = form.watch('status');
  const isPublished = status === 'PUBLISHED';

  // ─── Upload d'image ──────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // ✅ Utilisation de api.post
      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = response.data?.data?.url || response.data?.url;
      if (imageUrl) {
        form.setValue('featuredImage', imageUrl);
        toast.success('Image uploadée ✅');
        setImageError(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload de l\'image');
      setImagePreview(null);
      form.setValue('featuredImage', '');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ─── Supprimer l'image ──────────────────────────────────
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(false);
    form.setValue('featuredImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── Soumission ──────────────────────────────────────────
  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
      };

      if (isEditing && article) {
        await articles.update(article.id, payload);
        toast.success('Article modifié avec succès ✅');
      } else {
        await articles.create(payload);
        toast.success('Article créé avec succès 🎉');
      }

      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de l\'opération';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setImagePreview(null);
      setImageError(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── En-tête ──────────────────────────────────── */}
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                  {isEditing ? (
                    <Pencil className="h-5 w-5 text-secondary" />
                  ) : (
                    <FileText className="h-5 w-5 text-secondary" />
                  )}
                  {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifiez les informations de l\'article existant.'
                    : 'Créez un nouvel article pour le blog.'}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </div>

          {/* ─── Formulaire ───────────────────────────────── */}
          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ── Image à la une ─────────────────────────── */}
                <div className="space-y-2">
                  <FormLabel className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-secondary" />
                    Image à la une
                  </FormLabel>
                  <div className="flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                      {(imagePreview && !imageError) ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative rounded-xl overflow-hidden border-2 border-secondary/20 bg-muted/10"
                        >
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="w-full h-48 object-cover"
                            onError={() => setImageError(true)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute bottom-3 right-3 flex gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={handleRemoveImage}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer
                            </Button>
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                              <Loader2 className="h-8 w-8 animate-spin text-white" />
                              <span className="ml-2 text-sm font-medium text-white">Upload...</span>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
                            isUploading
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-muted-foreground/25 hover:border-secondary/40 hover:bg-secondary/5 cursor-pointer'
                          )}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-muted-foreground/50" />
                              <p className="mt-2 text-sm font-medium text-muted-foreground">
                                Cliquez pour ajouter une image
                              </p>
                              <p className="text-xs text-muted-foreground/60">
                                JPEG, PNG, WEBP – Max 5 Mo
                              </p>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />

                    <p className="text-xs text-muted-foreground">
                      {isEditing && article?.featuredImage && !imagePreview
                        ? 'Image actuelle non disponible'
                        : 'Une image de couverture rend votre article plus attractif.'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* ── Titre ── */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Titre <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Titre de l’article..."
                            className="pl-9"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Catégorie + Tags ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Catégorie <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="React, Next.js, Formation"
                              className="pl-9"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Séparez par des virgules.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Extrait ── */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Résumé de l’article..."
                          rows={2}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Optionnel – utilisé pour les aperçus.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Contenu ── */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contenu <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contenu complet de l’article..."
                          rows={8}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* ── Options ── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isPublished
                            ? 'L’article sera visible sur le site.'
                            : 'L’article restera en brouillon.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end space-y-1.5">
                        <FormLabel>Article vedette</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 pt-1">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Star className="h-4 w-4 fill-amber-500" />
                                  Mis en avant
                                </span>
                              ) : (
                                'Standard'
                              )}
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Apparaîtra en première page du blog.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* ─── Boutons ─────────────────────────────── */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="sm:min-w-[100px]"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px] gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditing ? 'Modification...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {isEditing ? 'Modifier l\'article' : 'Créer l\'article'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}