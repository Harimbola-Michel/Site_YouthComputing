'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  CheckCircle,
  Upload,
  X,
  FileText,
  FileCheck,
  AlertCircle,
  User,
  Mail,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { recruitments } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── Schéma ──────────────────────────────────────────────────
const candidatureSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (minimum 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
  coverLetter: z.string().optional(),
});

type CandidatureFormData = z.infer<typeof candidatureSchema>;

interface CandidatureFormProps {
  recruitmentId: string;
  onSuccess?: () => void;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CandidatureForm({ recruitmentId, onSuccess }: CandidatureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CandidatureFormData>({
    resolver: zodResolver(candidatureSchema),
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF, DOC ou DOCX.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier ne doit pas dépasser 5 Mo.');
      e.target.value = '';
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCvFile(file);
    setError(null);
    setUploadProgress(0);

    intervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  }, []);

  const removeFile = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCvFile(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  const onSubmit = async (data: CandidatureFormData) => {
    if (!cvFile) {
      toast.error('Veuillez télécharger votre CV');
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
      formData.append('recruitmentId', recruitmentId);
      formData.append('cv', cvFile);

      await recruitments.apply(formData);

      setIsSuccess(true);
      reset();
      setCvFile(null);
      setUploadProgress(0);
      toast.success('Candidature envoyée avec succès ! 🎉');
      onSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l\'envoi de la candidature';
      setError(msg);
      toast.error(msg);
      console.error('Erreur candidature:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8"
      >
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30 shadow-lg shadow-green-500/20">
          <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mt-4 font-ubuntu text-2xl font-semibold text-green-700 dark:text-green-400">
          Candidature envoyée !
        </h3>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Nous avons bien reçu votre candidature. Notre équipe l'examinera et vous
          contactera prochainement.
        </p>
        <Button
          variant="outline"
          className="mt-6 gap-2 border-green-200 hover:bg-green-50"
          onClick={() => {
            setIsSuccess(false);
            reset();
          }}
        >
          Postuler à une autre offre
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="font-medium flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-secondary" />
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            className={cn(
              'rounded-xl border-2 focus:border-secondary transition-colors',
              errors.fullName && 'border-destructive'
            )}
            disabled={isSubmitting}
            placeholder="Jean Dupont"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-secondary" />
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={cn(
              'rounded-xl border-2 focus:border-secondary transition-colors',
              errors.email && 'border-destructive'
            )}
            disabled={isSubmitting}
            placeholder="jean.dupont@email.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="font-medium flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-secondary" />
          Téléphone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          {...register('phone')}
          className={cn(
            'rounded-xl border-2 focus:border-secondary transition-colors',
            errors.phone && 'border-destructive'
          )}
          disabled={isSubmitting}
          placeholder="+261 34 12 345 67"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter" className="font-medium flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-secondary" />
          Lettre de motivation <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="coverLetter"
          {...register('coverLetter')}
          rows={4}
          disabled={isSubmitting}
          placeholder="Expliquez pourquoi vous êtes le/la candidat(e) idéal(e) pour ce poste..."
          className="resize-none rounded-xl border-2 focus:border-secondary transition-colors"
        />
      </div>

      {/* ─── Upload CV ────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="font-medium flex items-center gap-2 text-sm">
          <Upload className="h-4 w-4 text-secondary" />
          CV <span className="text-destructive">*</span>
          <span className="text-xs text-muted-foreground font-normal">
            (PDF, DOC, DOCX – Max 5 Mo)
          </span>
        </Label>

        <AnimatePresence>
          {cvFile ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative rounded-xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5 p-5 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-secondary/10 p-3">
                  <FileText className="h-7 w-7 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cvFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(cvFile.size / 1024).toFixed(0)} Ko
                  </p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                  {uploadProgress === 100 && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      Prêt
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                  onClick={removeFile}
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-10 transition-all hover:border-secondary/40 hover:bg-secondary/5 cursor-pointer group"
              onClick={() => document.getElementById('cv-upload')?.click()}
            >
              <div className="rounded-full bg-secondary/10 p-4 group-hover:bg-secondary/20 transition-colors">
                <Upload className="h-8 w-8 text-secondary/60 group-hover:text-secondary transition-colors" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Glissez votre CV ici ou{' '}
                <span className="text-secondary font-medium hover:underline">
                  parcourez
                </span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                PDF, DOC, DOCX jusqu'à 5 Mo
              </p>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-13 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300 gap-2"
        disabled={isSubmitting || !cvFile}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Envoyer ma candidature
            <Sparkles className="h-4 w-4 opacity-70" />
          </>
        )}
      </Button>

      <p className="text-center text-[10px] text-muted-foreground/60">
        En postulant, vous acceptez le traitement de vos données pour la gestion de votre candidature.
      </p>
    </form>
  );
}