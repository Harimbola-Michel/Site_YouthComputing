'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserPlus, Users, Upload, X } from 'lucide-react';
import { team, users } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/types/team.types';

// ─── Schéma de validation ──────────────────────────────────────
const schema = z.object({
  userId: z.string().min(1, 'L’utilisateur est requis'),
  role: z.string().min(2, 'Le rôle est requis'),
  department: z.string().min(1, 'Le département est requis'),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  linkedin: z.string().url('URL invalide').optional().or(z.literal('')),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  'Directeur',
  'Développeur',
  'Designer',
  'Chef de projet',
  'Community Manager',
  'Chargé de communication',
  'Data Analyst',
  'Stagiaire',
  'Bénévole',
];

const DEPARTMENTS = [
  'Technique',
  'Communication',
  'RH',
  'Pédagogie',
  'Administration',
  'Marketing',
  'Projets',
];

interface TeamMemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
  onSuccess: () => void;
}

export function TeamMemberFormModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: TeamMemberFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string; email: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true,
      displayOrder: 0,
      photoUrl: '',
      linkedin: '',
      department: '',
      bio: '',
      role: '',
      userId: '',
    },
  });

  const currentPhotoUrl = watch('photoUrl');

  useEffect(() => {
    if (currentPhotoUrl) {
      setPreview(currentPhotoUrl);
    }
  }, [currentPhotoUrl]);

  // ─── Chargement des utilisateurs ────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await users.getAll({ limit: 100 });
        const data = res?.data?.data?.data ?? res?.data?.data ?? [];
        setUserOptions(
          Array.isArray(data)
            ? data.map((u: any) => ({
                id: u.id,
                name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                email: u.email,
              }))
            : []
        );
      } catch {
        toast.error('Impossible de charger les utilisateurs');
      } finally {
        setUsersLoading(false);
      }
    };
    if (open) fetchUsers();
  }, [open]);

  // ─── Remplir le formulaire ──────────────────────────────────
  useEffect(() => {
    if (member) {
      reset({
        userId: member.userId,
        role: member.role,
        department: member.department || '',
        bio: member.bio || '',
        photoUrl: member.photoUrl || '',
        linkedin: member.linkedin || '',
        displayOrder: member.displayOrder || 0,
        isActive: member.isActive,
      });
      setPreview(member.photoUrl || null);
    } else {
      reset({
        userId: '',
        role: '',
        department: '',
        bio: '',
        photoUrl: '',
        linkedin: '',
        displayOrder: 0,
        isActive: true,
      });
      setPreview(null);
    }
  }, [member, reset]);

  // ─── Upload de photo ────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aperçu local
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // ⚠️ Adaptez la méthode d’upload selon votre API (upload.teamPhoto ou upload.single)
      const res = await upload.single(file, 'team');
      const url = res?.data?.data?.url;
      if (url) {
        setValue('photoUrl', url);
        setPreview(url);
        toast.success('Image uploadée avec succès');
      } else {
        throw new Error('URL manquante');
      }
    } catch (error) {
      toast.error('Échec de l’upload de l’image');
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setValue('photoUrl', '');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── Soumission ──────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const cleanData = {
        ...data,
        photoUrl: data.photoUrl || undefined,
        linkedin: data.linkedin || undefined,
        bio: data.bio || undefined,
      };
      if (member) {
        await team.update(member.id, cleanData);
      } else {
        await team.create(cleanData);
      }
      toast.success(member ? 'Membre modifié avec succès' : 'Membre ajouté avec succès');
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {member ? (
              <>
                <Users className="h-5 w-5 text-secondary" />
                Modifier un membre
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-secondary" />
                Ajouter un membre
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {member
              ? 'Modifiez les informations du membre de l’équipe.'
              : 'Ajoutez un nouveau membre à l’équipe.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Utilisateur */}
          <div className="space-y-1.5">
            <Label htmlFor="userId" className="flex items-center gap-1">
              Utilisateur <span className="text-destructive">*</span>
            </Label>
            <select
              id="userId"
              {...register('userId')}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.userId && 'border-destructive'
              )}
              disabled={!!member || usersLoading}
            >
              <option value="">Sélectionner un utilisateur</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
          </div>

          {/* Rôle */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="flex items-center gap-1">
              Rôle <span className="text-destructive">*</span>
            </Label>
            <select
              id="role"
              {...register('role')}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.role && 'border-destructive'
              )}
            >
              <option value="">Sélectionner un rôle</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          {/* Département */}
          <div className="space-y-1.5">
            <Label htmlFor="department" className="flex items-center gap-1">
              Département <span className="text-destructive">*</span>
            </Label>
            <select
              id="department"
              {...register('department')}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.department && 'border-destructive'
              )}
            >
              <option value="">Sélectionner un département</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
          </div>

          {/* Biographie */}
          <div className="space-y-1.5">
            <Label htmlFor="bio">Biographie (optionnel)</Label>
            <Textarea id="bio" {...register('bio')} rows={3} placeholder="Présentation du membre..." />
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <Label>Photo du membre</Label>
            <div className="flex items-center gap-4">
              {preview ? (
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-secondary/20">
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                  <Upload className="h-6 w-6" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Upload...' : 'Choisir une image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP (max 5 Mo)
                </p>
              </div>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn (URL)</Label>
            <Input
              id="linkedin"
              {...register('linkedin')}
              placeholder="https://linkedin.com/in/..."
              className={errors.linkedin && 'border-destructive'}
            />
            {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin.message}</p>}
          </div>

          {/* Actif */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">
                Actif
              </Label>
              <p className="text-xs text-muted-foreground">Le membre sera visible sur le site</p>
            </div>
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || isSubmitting || uploading} className="gap-2">
              {(loading || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />}
              {member ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}