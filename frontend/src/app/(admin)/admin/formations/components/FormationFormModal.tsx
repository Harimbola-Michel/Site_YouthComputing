'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Users,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { FormationImageUpload } from './FormationImageUpload';

const LEVELS = [
  { value: 'DÉBUTANT', label: 'Débutant' },
  { value: 'INTERMÉDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCÉ', label: 'Avancé' },
  { value: 'EXPERT', label: 'Expert' },
];

const CATEGORIES = [
  'Programmation Web',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Design',
  'Marketing Digital',
  'DevOps',
  'Mobile',
];

const formationSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  objectives: z.string().optional(),
  prerequisites: z.string().optional(),
  duration: z.string().min(1, 'La durée est requise'),
  level: z.string().min(1, 'Le niveau est requis'),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Le prix ne peut pas être négatif').optional()
  ),
  category: z.string().min(1, 'La catégorie est requise'),
  imageUrl: z.string().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  maxParticipants: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(1, 'Le minimum est 1 participant').optional()
  ),
});

type FormationFormData = z.infer<typeof formationSchema>;

interface FormationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FormationFormModal({
  open,
  onOpenChange,
  onSuccess,
}: FormationFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: '',
      description: '',
      objectives: '',
      prerequisites: '',
      duration: '',
      level: '',
      price: undefined,
      category: '',
      imageUrl: '',
      isPublished: false,
      maxParticipants: undefined,
    },
  });

  const onSubmit = async (data: FormationFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        price: data.price ?? 0,
        maxParticipants: data.maxParticipants ?? undefined,
        imageUrl: data.imageUrl || null,
      };
      await formations.create(payload);
      toast.success('Formation créée 🎉');
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
        const message = error?.response?.data?.message || 'Erreur lors de la création';
        toast.error(message);
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
                  <GraduationCap className="h-5 w-5 text-secondary" />
                  Nouvelle formation
                </DialogTitle>
                <DialogDescription>
                  Créez une nouvelle formation pour l’association.
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
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FormationImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Développement Web avec Next.js"
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description complète de la formation..."
                          rows={4}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="8 semaines" className="pl-9" {...field} disabled={isSubmitting} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEVELS.map((lvl) => (
                              <SelectItem key={lvl.value} value={lvl.value}>
                                {lvl.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie <span className="text-destructive">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (Ar)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="150000"
                              className="pl-9"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>0 = formation gratuite.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participants max</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="20"
                              className="pl-9"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Laissez vide si illimité.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectifs</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Objectifs pédagogiques"
                            rows={2}
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
                    name="prerequisites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prérequis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Connaissances nécessaires"
                            rows={2}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publier la formation</FormLabel>
                        <FormDescription>Visible sur le site public.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                      <><Loader2 className="h-4 w-4 animate-spin" /> Création...</>
                    ) : (
                      <><GraduationCap className="h-4 w-4" /> Créer</>
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