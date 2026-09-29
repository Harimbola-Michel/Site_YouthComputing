'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { formations } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const formationSchema = z.object({
  title: z.string().min(3, 'Le titre est requis'),
  description: z.string().min(10, 'La description est trop courte'),
  objectives: z.string().optional(),
  prerequisites: z.string().optional(),
  duration: z.string().min(1, 'La durée est requise'),
  level: z.string().min(1, 'Le niveau est requis'),
  price: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  isPublished: z.boolean().default(false),
  maxParticipants: z.string().optional(),
});

type FormationFormData = z.infer<typeof formationSchema>;

interface FormationFormProps {
  initialData?: any;
  formationId?: string;
}

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const CATEGORIES = [
  'Programmation Web',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Design',
  'Marketing Digital',
];

export function FormationForm({ initialData, formationId }: FormationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!formationId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      objectives: initialData?.objectives || '',
      prerequisites: initialData?.prerequisites || '',
      duration: initialData?.duration || '',
      level: initialData?.level || '',
      price: initialData?.price?.toString() || '',
      category: initialData?.category || '',
      isPublished: initialData?.isPublished || false,
      maxParticipants: initialData?.maxParticipants?.toString() || '',
    },
  });

  const isPublished = watch('isPublished');

  const onSubmit = async (data: FormationFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : 0,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
      };

      if (isEditing) {
        await formations.update(formationId, payload);
        toast.success('Formation mise à jour avec succès');
      } else {
        await formations.create(payload);
        toast.success('Formation créée avec succès');
      }
      router.push('/admin/formations');
    } catch (error) {
      toast.error(isEditing ? 'Erreur lors de la mise à jour' : "Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="font-ubuntu text-xl">
            {isEditing ? 'Modifier la formation' : 'Nouvelle formation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger id="category">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objectifs</Label>
            <Textarea id="objectives" {...register('objectives')} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prérequis</Label>
            <Textarea id="prerequisites" {...register('prerequisites')} rows={2} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée *</Label>
              <Input
                id="duration"
                {...register('duration')}
                placeholder="8 semaines"
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <Select
                value={watch('level')}
                onValueChange={(value) => setValue('level', value)}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (Ar)</Label>
              <Input
                id="price"
                type="number"
                {...register('price')}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Participants max</Label>
              <Input
                id="maxParticipants"
                type="number"
                {...register('maxParticipants')}
                placeholder="Illimité"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setValue('isPublished', checked)}
              />
              <Label htmlFor="isPublished">Publiée</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/formations')}
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