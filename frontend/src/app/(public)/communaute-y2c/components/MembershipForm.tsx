'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle,
  Sparkles,
  CreditCard,
  Smartphone,
  Building2,
  Copy,
  Receipt,
  Banknote,
  Phone,
  Mail,
  User,
  Calendar,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { y2c, payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── Schéma de validation avec paiement ──────────────────────
const membershipSchema = z
  .object({
    name: z.string().min(2, 'Le nom est requis (minimum 2 caractères)'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(8, 'Numéro de téléphone invalide (minimum 8 chiffres)'),
    institution: z.string().optional(),
    motivation: z.string().optional(),
    // Paiement
    paymentMethod: z.enum(['mobile_money', 'bank_transfer']).default('mobile_money'),
    mobileMoneyOperator: z.string().optional(),
    paymentReference: z.string().min(6, 'La référence est requise (minimum 6 caractères)'),
    amountPaid: z.number({
      required_error: 'Veuillez saisir le montant payé',
      invalid_type_error: 'Le montant doit être un nombre',
    }),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'mobile_money' && !data.mobileMoneyOperator) {
        return false;
      }
      return true;
    },
    {
      message: 'Veuillez sélectionner un opérateur Mobile Money',
      path: ['mobileMoneyOperator'],
    }
  );

type MembershipFormData = z.infer<typeof membershipSchema>;

// ─── Opérateurs Mobile Money ──────────────────────────────────
const MOBILE_MONEY_OPERATORS = [
  {
    id: 'MVola',
    label: 'MVola',
    icon: '📱',
    phone: '034 05 123 45',
    instructions: 'Envoyez le montant exact via MVola en utilisant la référence ci‑dessous.',
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30',
  },
  {
    id: 'Airtel Money',
    label: 'Airtel Money',
    icon: '📶',
    phone: '034 05 678 90',
    instructions: 'Effectuez le paiement via Airtel Money avec la référence fournie.',
    color: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30',
  },
  {
    id: 'Orange Money',
    label: 'Orange Money',
    icon: '🟠',
    phone: '034 05 111 22',
    instructions: 'Utilisez Orange Money et indiquez la référence dans le motif du virement.',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30',
  },
  {
    id: 'Telma Money',
    label: 'Telma Money',
    icon: '🔵',
    phone: '034 05 333 44',
    instructions: 'Payez par Telma Money en mentionnant la référence unique.',
    color: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800/30',
  },
];

const MEMBERSHIP_FEE = 25000; // 25 000 Ar

export function MembershipForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      paymentMethod: 'mobile_money',
      mobileMoneyOperator: 'MVola',
      paymentReference: '',
      amountPaid: 0,
    },
  });

  const paymentMethod = watch('paymentMethod');
  const currentOperator = watch('mobileMoneyOperator');

  // ─── Générer une référence de paiement ──────────────────────
  const generatePaymentReference = () => {
    const prefix = 'Y2C';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${random}-${timestamp}`;
  };

  // ─── Générer la référence à l'ouverture ────────────────────
  useEffect(() => {
    const ref = generatePaymentReference();
    setValue('paymentReference', ref);
    setPaymentRef(ref);
  }, [setValue]);

  // ─── Copier la référence ──────────────────────────────────
  const copyReference = () => {
    const ref = watch('paymentReference');
    if (ref) {
      navigator.clipboard.writeText(ref);
      toast.success('Référence copiée !');
    }
  };

  // ─── Regénérer la référence ──────────────────────────────
  const regenerateReference = () => {
    const ref = generatePaymentReference();
    setValue('paymentReference', ref);
    setPaymentRef(ref);
    toast.success('Nouvelle référence générée');
  };

  // ─── Copier le numéro de téléphone de l'opérateur ──────────
  const copyOperatorPhone = () => {
    const operator = MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator);
    if (operator) {
      navigator.clipboard.writeText(operator.phone);
      toast.success('Numéro de téléphone copié !');
    }
  };

  // ─── Soumission ─────────────────────────────────────────────
  const onSubmit = async (data: MembershipFormData) => {
    // Vérification du montant payé
    if (data.amountPaid !== MEMBERSHIP_FEE) {
      toast.error(`Le montant doit être exactement ${MEMBERSHIP_FEE.toLocaleString()} Ar`);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Créer le membre Y2C
      const memberPayload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        institution: data.institution,
        membershipFeePaid: MEMBERSHIP_FEE,
      };
      const memberResponse = await y2c.createMember(memberPayload);
      const newMember = memberResponse?.data?.data || memberResponse?.data;
      const memberId = newMember?.id;

      // 2. Enregistrer le paiement (si l'API le permet)
      if (memberId) {
        try {
          const paymentPayload = {
            memberId,
            amount: MEMBERSHIP_FEE,
            currency: 'MGA',
            paymentMethod: data.paymentMethod,
            paymentReference: data.paymentReference,
            status: 'PENDING',
            metadata: {
              operator: data.mobileMoneyOperator,
              phone: data.phone,
              email: data.email,
            },
          };
          // Appel à l'API de paiement (à adapter selon votre backend)
          // await payments.create(paymentPayload);
          // Si l'API n'existe pas, on peut simplement continuer
          console.log('💳 Paiement à enregistrer:', paymentPayload);
        } catch (payErr) {
          console.warn('⚠️ Erreur enregistrement paiement:', payErr);
          // On continue, l'adhésion est déjà créée
        }
      }

      setIsSuccess(true);
      reset();
      toast.success('Adhésion enregistrée avec succès ! 🎉');
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erreur lors de l'adhésion";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Écran de succès ──────────────────────────────────────
  if (isSuccess) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="rounded-full bg-green-500/20 p-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </motion.div>
          <h3 className="font-ubuntu text-2xl font-bold text-foreground">
            Adhésion réussie !
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Vous recevrez un email de confirmation sous 48h. Bienvenue dans la communauté Y2C !
          </p>
          {paymentRef && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/30 px-4 py-2 text-sm">
              <span className="font-mono">{paymentRef}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(paymentRef);
                  toast.success('Référence copiée !');
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            <p>📧 Email : {watch('email')}</p>
            <p>📱 Téléphone : {watch('phone')}</p>
            <p>💰 Montant réglé : {MEMBERSHIP_FEE.toLocaleString()} Ar</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              reset();
              const newRef = generatePaymentReference();
              setValue('paymentReference', newRef);
              setPaymentRef(newRef);
            }}
            className="mt-2"
          >
            S'inscrire un autre membre
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Formulaire ──────────────────────────────────────────────
  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-secondary/5 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="font-ubuntu text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-secondary" />
          Devenir membre Y2C
        </CardTitle>
        <CardDescription>
          Rejoignez la communauté pour seulement{' '}
          <span className="font-semibold text-secondary">{MEMBERSHIP_FEE.toLocaleString()} Ar</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ─── Identité ──────────────────────────────────────── */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Informations personnelles
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-2 text-foreground/80">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className="h-12"
                disabled={isLoading}
                placeholder="Votre nom et prénom"
              />
              {errors.name && (
                <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground/80">
                <Mail className="h-4 w-4" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="h-12"
                disabled={isLoading}
                placeholder="vous@exemple.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-2 text-foreground/80">
                <Phone className="h-4 w-4" />
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                className="h-12"
                disabled={isLoading}
                placeholder="034 12 34 567"
              />
              {errors.phone && (
                <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="institution" className="flex items-center gap-2 text-foreground/80">
                <Building2 className="h-4 w-4" />
                Institution (optionnel)
              </Label>
              <Input
                id="institution"
                {...register('institution')}
                className="h-12"
                disabled={isLoading}
                placeholder="Université, école, entreprise..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivation" className="flex items-center gap-2 text-foreground/80">
                <Info className="h-4 w-4" />
                Motivation (optionnel)
              </Label>
              <Textarea
                id="motivation"
                {...register('motivation')}
                rows={3}
                className="resize-none"
                placeholder="Pourquoi voulez-vous rejoindre la communauté Y2C ?"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* ─── Paiement ────────────────────────────────────────── */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Paiement de l'adhésion
            </h4>

            {/* Mode de paiement */}
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setValue('paymentMethod', val as any)}
              className="flex flex-col gap-2 sm:flex-row sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mobile_money" id="mm" />
                <label htmlFor="mm" className="flex items-center gap-1 text-sm cursor-pointer">
                  <Smartphone className="h-4 w-4" />
                  Mobile Money
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bank_transfer" id="bt" />
                <label htmlFor="bt" className="flex items-center gap-1 text-sm cursor-pointer">
                  <Building2 className="h-4 w-4" />
                  Virement bancaire
                </label>
              </div>
            </RadioGroup>

            {/* Référence de paiement */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-foreground/80">
                <Receipt className="h-4 w-4" />
                Référence de paiement <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  {...register('paymentReference')}
                  disabled={isLoading}
                  className="font-mono pr-24"
                  placeholder="Y2C-XXXXXX-XXXXXX"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyReference}
                    title="Copier la référence"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={regenerateReference}
                    title="Regénérer la référence"
                  >
                    <Loader2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {errors.paymentReference && (
                <p className="text-sm text-destructive font-medium">
                  {errors.paymentReference.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Cette référence est à utiliser pour effectuer votre paiement.
              </p>
            </div>

            {/* Montant payé */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-foreground/80">
                <Banknote className="h-4 w-4" />
                Montant payé <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                {...register('amountPaid', { valueAsNumber: true })}
                disabled={isLoading}
                placeholder={MEMBERSHIP_FEE.toString()}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Saisissez le montant exact que vous avez envoyé (
                {MEMBERSHIP_FEE.toLocaleString()} Ar).
              </p>
              {errors.amountPaid && (
                <p className="text-sm text-destructive font-medium">
                  {errors.amountPaid.message}
                </p>
              )}
            </div>

            {/* Opérateur Mobile Money */}
            <AnimatePresence>
              {paymentMethod === 'mobile_money' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-foreground/80">
                      <Smartphone className="h-4 w-4" />
                      Opérateur Mobile Money <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={currentOperator}
                      onValueChange={(val) => setValue('mobileMoneyOperator', val)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un opérateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOBILE_MONEY_OPERATORS.map((op) => (
                          <SelectItem key={op.id} value={op.id}>
                            <span className="flex items-center gap-2">
                              <span>{op.icon}</span>
                              {op.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mobileMoneyOperator && (
                      <p className="text-sm text-destructive font-medium">
                        {errors.mobileMoneyOperator.message}
                      </p>
                    )}
                  </div>

                  {/* Coordonnées de l'opérateur */}
                  {currentOperator && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'rounded-lg border p-3 text-xs space-y-1',
                        MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.color
                      )}
                    >
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Coordonnées {currentOperator}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Numéro :</span>
                        <span className="font-mono font-medium">
                          {MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.phone}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={copyOperatorPhone}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground">
                        {MOBILE_MONEY_OPERATORS.find((op) => op.id === currentOperator)?.instructions}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Coordonnées bancaires */}
            {paymentMethod === 'bank_transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-xs space-y-1 border border-amber-100 dark:border-amber-800/30"
              >
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Coordonnées bancaires
                </p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    <span className="font-medium">Banque :</span> Bank of Africa
                  </p>
                  <p>
                    <span className="font-medium">Compte :</span> 1234 5678 9012 3456
                  </p>
                  <p>
                    <span className="font-medium">IBAN :</span> MG34 0000 1234 5678 9012
                  </p>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Virement à effectuer en utilisant la référence ci-dessus.
                </p>
              </motion.div>
            )}
          </div>

          {/* ─── Bouton de soumission ──────────────────────────── */}
          <Button
            type="submit"
            size="lg"
            className="relative w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 overflow-hidden group"
            disabled={isLoading || isSubmitting}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  En cours...
                </>
              ) : (
                <>
                  Adhérer ({MEMBERSHIP_FEE.toLocaleString()} Ar)
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}