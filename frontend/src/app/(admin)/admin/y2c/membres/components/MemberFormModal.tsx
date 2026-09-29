'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, UserPlus, Mail, Phone, BadgeCheck, Building, CreditCard, X } from 'lucide-react';
import { Y2CMember } from './MembersTable';

// Schéma de validation
const memberSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  studentId: z.string().optional(),
  institution: z.string().optional(),
  membershipFeePaid: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'La cotisation ne peut pas être négative').optional()
  ),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Y2CMember;
  onSuccess: () => void;
}

export function MemberFormModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: MemberFormModalProps) {
  const isEditing = !!member;

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      studentId: '',
      institution: '',
      membershipFeePaid: undefined,
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        studentId: member.studentId || '',
        institution: member.institution || '',
        membershipFeePaid: member.membershipFeePaid || undefined,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        institution: '',
        membershipFeePaid: undefined,
      });
    }
  }, [member, form]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      const payload = {
        ...data,
        membershipFeePaid: data.membershipFeePaid ?? 0,
      };

      if (isEditing) {
        await api.put(`/y2c/members/${member!.id}`, payload);
        toast.success('Membre mis à jour');
      } else {
        await api.post('/y2c/members', payload);
        toast.success('Membre ajouté');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Erreur lors de l’opération';
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (!form.formState.isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-lg">
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 font-ubuntu text-xl">
                <UserPlus className="h-5 w-5 text-secondary" />
                {isEditing ? 'Modifier le membre' : 'Nouveau membre Y2C'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifiez les informations du membre.' : 'Ajoutez un nouveau membre à la communauté.'}
              </DialogDescription>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={handleClose}
              disabled={form.formState.isSubmitting}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Rakoto Jean" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="jean.rakoto@email.com" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="+261 34 12 345 67" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro étudiant</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BadgeCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="EX: 12345" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormDescription>Optionnel – permet de valider le statut étudiant.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Université de Fianarantsoa" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormDescription>Optionnelle – indiquez l’établissement d’origine.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="membershipFeePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cotisation (Ar)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" placeholder="25000" className="pl-9" {...field} disabled={form.formState.isSubmitting} />
                      </div>
                    </FormControl>
                    <FormDescription>Montant versé (par défaut 0 si non renseigné).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={form.formState.isSubmitting}
                  className="sm:min-w-[100px]"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="min-w-[140px] gap-2"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? 'Mise à jour...' : 'Ajout...'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {isEditing ? 'Mettre à jour' : 'Ajouter le membre'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}