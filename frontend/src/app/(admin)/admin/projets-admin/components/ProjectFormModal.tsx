'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Tag,
  ListChecks,
  Loader2,
  X,
  Link2,
  Github,
  Image,
  Star,
  Code,
  Users,
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
import { projects } from '@/lib/api';
import toast from 'react-hot-toast';

const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planification' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminé' },
  { value: 'ON_HOLD', label: 'En pause' },
  { value: 'CANCELLED', label: 'Annulé' },
];

const projectSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  objectives: z.string().optional(),
  impact: z.string().optional(),
  technologies: z.string().optional(),
  images: z.string().optional(),
  year: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(1900, 'Année invalide').max(2100, 'Année invalide').optional()
  ),
  category: z.string().min(1, 'La catégorie est requise'),
  status: z.string().min(1, 'Le statut est requis'),
  isFeatured: z.boolean().default(false),
  client: z.string().optional(),
  projectUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  githubUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any; // pour l'édition
  onSuccess?: () => void;
}

export function ProjectFormModal({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      objectives: '',
      impact: '',
      technologies: '',
      images: '',
      year: undefined,
      category: '',
      status: 'PLANNING',
      isFeatured: false,
      client: '',
      projectUrl: '',
      githubUrl: '',
    },
  });

  // ─── Remplir le formulaire si édition ──────────────────
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title || '',
        description: project.description || '',
        objectives: project.objectives || '',
        impact: project.impact || '',
        technologies: project.technologies?.join(', ') || '',
        images: project.images?.join(', ') || '',
        year: project.year || new Date().getFullYear(),
        category: project.category || '',
        status: project.status || 'PLANNING',
        isFeatured: project.isFeatured || false,
        client: project.client || '',
        projectUrl: project.projectUrl || '',
        githubUrl: project.githubUrl || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        objectives: '',
        impact: '',
        technologies: '',
        images: '',
        year: new Date().getFullYear(),
        category: '',
        status: 'PLANNING',
        isFeatured: false,
        client: '',
        projectUrl: '',
        githubUrl: '',
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        technologies: data.technologies ? data.technologies.split(',').map(t => t.trim()) : [],
        images: data.images ? data.images.split(',').map(i => i.trim()).filter(Boolean) : [],
        year: data.year ?? new Date().getFullYear(),
      };

      if (isEditing) {
        await projects.update(project.id, payload);
        toast.success('Projet mis à jour avec succès');
      } else {
        await projects.create(payload);
        toast.success('Projet créé avec succès');
      }
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de l’enregistrement';
      toast.error(message);
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
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
          <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  {isEditing ? 'Modifier le projet' : 'Nouveau projet'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Modifiez les informations du projet.' : 'Ajoutez un nouveau projet à l’association.'}
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

          <div className="p-6 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Titre */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Plateforme d'apprentissage en ligne" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Décrivez le projet en quelques lignes..." rows={3} {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Objectifs */}
                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectifs</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ListChecks className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Objectifs du projet" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>Principaux objectifs du projet.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Impact */}
                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Impact du projet" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>Impact attendu ou mesuré.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Technologies */}
                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Code className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="React, Node.js, Docker" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>Séparez par des virgules.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images (URLs)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="https://exemple.com/image1.jpg, https://exemple.com/image2.jpg" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormDescription>URLs séparées par des virgules.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Année */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" placeholder="2025" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Catégorie */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Éducation, Santé, Technologie..." className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Statut */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut <span className="text-destructive">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Client */}
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Nom du client" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL projet */}
                <FormField
                  control={form.control}
                  name="projectUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du projet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="url" placeholder="https://exemple.com/projet" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* GitHub */}
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL GitHub</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="url" placeholder="https://github.com/organisation/projet" className="pl-9" {...field} disabled={isSubmitting} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Projet vedette */}
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Projet vedette</FormLabel>
                        <FormDescription>Mettre en avant ce projet sur la page d’accueil.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Boutons */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="sm:min-w-[100px]">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[140px] gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditing ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4" />
                        {isEditing ? 'Mettre à jour' : 'Créer le projet'}
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