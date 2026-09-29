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

const evaluationSchema = z.object({
  criteria: z.string().min(1, 'Le critère est requis'),
  score: z.preprocess(
    (val) => Number(val),
    z.number().int('Le score doit être un nombre entier').min(1, 'Minimum 1').max(10, 'Maximum 10')
  ),
  comments: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface EvaluationFormProps {
  onSubmit: (data: EvaluationFormData) => Promise<void>;
  onCancel: () => void;
}

export function EvaluationForm({ onSubmit, onCancel }: EvaluationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
  });

  const submit = async (data: EvaluationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      // handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="criteria" className="font-medium">
          Critère <span className="text-destructive">*</span>
        </Label>
        <Input
          id="criteria"
          {...register('criteria')}
          placeholder="Ex: Compétences techniques, Communication, etc."
          disabled={isSubmitting}
          className={errors.criteria ? 'border-destructive' : ''}
        />
        {errors.criteria && <p className="text-xs text-destructive">{errors.criteria.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="score" className="font-medium">
          Score (1-10) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="score"
          type="number"
          step="1"
          min="1"
          max="10"
          {...register('score')}
          placeholder="8"
          disabled={isSubmitting}
          className={errors.score ? 'border-destructive' : ''}
        />
        {errors.score && <p className="text-xs text-destructive">{errors.score.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Commentaires (optionnel)</Label>
        <Textarea
          id="comments"
          {...register('comments')}
          rows={3}
          placeholder="Ajoutez des commentaires sur cette évaluation..."
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
              Enregistrement...
            </>
          ) : (
            'Ajouter'
          )}
        </Button>
      </div>
    </form>
  );
}