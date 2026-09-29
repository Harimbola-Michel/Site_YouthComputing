'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const interviewSchema = z.object({
  scheduledAt: z.string().min(1, 'La date et l\'heure sont requises'),
  interviewer: z.string().min(2, 'Le nom de l\'intervieweur est requis'),
  notes: z.string().optional(),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

interface InterviewFormProps {
  onSubmit: (data: InterviewFormData) => Promise<void>;
  onCancel: () => void;
}

export function InterviewForm({ onSubmit, onCancel }: InterviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
  });

  const submit = async (data: InterviewFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      });
    } catch (error) {
      // handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduledAt" className="font-medium">
            Date et heure <span className="text-destructive">*</span>
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            {...register('scheduledAt')}
            disabled={isSubmitting}
            className={errors.scheduledAt ? 'border-destructive' : ''}
          />
          {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interviewer" className="font-medium">
            Intervieweur <span className="text-destructive">*</span>
          </Label>
          <Input
            id="interviewer"
            {...register('interviewer')}
            placeholder="Nom de l'intervieweur"
            disabled={isSubmitting}
            className={errors.interviewer ? 'border-destructive' : ''}
          />
          {errors.interviewer && <p className="text-xs text-destructive">{errors.interviewer.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          rows={3}
          placeholder="Informations supplémentaires sur l'entretien..."
          disabled={isSubmitting}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[100px]">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Planification...
            </>
          ) : (
            'Planifier'
          )}
        </Button>
      </div>
    </form>
  );
}