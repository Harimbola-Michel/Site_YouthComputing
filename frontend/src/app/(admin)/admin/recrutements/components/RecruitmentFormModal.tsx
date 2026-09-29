'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  X,
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
import { Separator } from '@/components/ui/separator';
import { recruitments } from '@/lib/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Direction',
  'Ressources Humaines',
  'Technique',
  'Formation',
  'Communication',
  'Finances',
  'Marketing',
];

const POSITIONS = [
  'Responsable',
  'Coordinateur',
  'Chargé de mission',
  'Développeur',
  'Formateur',
  'Stagiaire',
  'Autre',
];

const recruitmentSchema = z.object({
  title: z.string().min(3, 'Le titre est requis (min 3 caractères)'),
  description: z.string().min(20, 'La description est trop courte (min 20 caractères)'),
  requirements: z.string().min(10, 'Les prérequis sont trop courts'),
  department: z.string().min(1, 'Le département est requis'),
  position: z.string().min(1, 'Le poste est requis'),
  isActive: z.boolean().default(true),
  deadline: z.string().optional(),
});

type RecruitmentFormData = z.infer<typeof recruitmentSchema>;

interface RecruitmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruitment?: any;
  onSuccess?: () => void;
}

export function RecruitmentFormModal({
  open,
  onOpenChange,
  recruitment,
  onSuccess,
}: RecruitmentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!recruitment;

  const form = useForm<RecruitmentFormData>({
    resolver: zodResolver(recruitmentSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      department: '',
      position: '',
      isActive: true,
      deadline: '',
    },
  });

  useEffect(() => {
    if (recruitment) {
      form.reset({
        title: recruitment.title || '',
        description: recruitment.description || '',
        requirements: recruitment.requirements || '',
        department: recruitment.department || '',
        position: recruitment.position || '',
        isActive: recruitment.isActive ?? true,
        deadline: recruitment.deadline ? recruitment.deadline.split('T')[0] : '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        requirements: '',
        department: '',
        position: '',
        isActive: true,
        deadline: '',
      });
    }
  }, [recruitment, form]);

  const onSubmit = async (data: RecruitmentFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      if (isEditing) {
        await recruitments.update(recruitment.id, payload);
        toast.success('Offre mise à jour ✅');
      } else {
        await recruitments.create(payload);
        toast.success('Offre créée 🎉');
      }
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errors = error?.formattedErrors || error?.response?.data?.errors;
      if (errors) {
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => form.setError(field as any, { message: msg }));
          }
        });
      } else {
        const msg = error?.response?.data?.message || 'Erreur lors de l’enregistrement';
        toast.error(msg);
      }
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
                  {isEditing ? 'Modifier l’offre' : 'Nouvelle offre'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifiez les informations de l’offre.'
                    : 'Créez une nouvelle offre d’emploi.'}
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
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Développeur Full Stack"
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département <span className="text-destructive">*</span></FormLabel>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="">Sélectionner</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste <span className="text-destructive">*</span></FormLabel>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="">Sélectionner</option>
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée du poste..."
                          rows={4}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prérequis <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Compétences, diplômes, expérience..."
                          rows={3}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date limite</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="date"
                              className="pl-9"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Laissez vide pour sans limite.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end space-y-1.5">
                        <FormLabel>Statut</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 pt-1">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? 'Active' : 'Fermée'}
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Les offres actives sont visibles sur le site public.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

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
                  <Button type="submit" disabled={isSubmitting} className="min-w-[140px] gap-2">
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</>
                    ) : (
                      <><Briefcase className="h-4 w-4" /> {isEditing ? 'Mettre à jour' : 'Créer'}</>
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