'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Partner } from '@/types/partner.types';
import { Loader2 } from 'lucide-react';

const partnerSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
  logo: z.string().url('URL invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
  isActive: z.boolean().default(true),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  initialData?: Partner;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PartnerForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Enregistrer',
}: PartnerFormProps) {
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      logo: '',
      website: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        logo: initialData.logo || '',
        website: initialData.website || '',
        description: initialData.description || '',
        isActive: initialData.isActive,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom *</FormLabel>
              <FormControl>
                <Input placeholder="Nom du partenaire" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo (URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/logo.png" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site web</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com" {...field} disabled={isSubmitting} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description du partenaire..."
                  rows={3}
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Actif</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Le partenaire sera visible sur le site
                </p>
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

        <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}