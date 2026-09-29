'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Smartphone, CreditCard, Send, AlertCircle } from 'lucide-react';
import { payments } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const MOBILE_MONEY_OPERATORS = ['MVola', 'Airtel Money', 'Orange Money', 'Telma Money'];

const paymentSchema = z
  .object({
    paymentMethod: z.enum(['mobile_money', 'bank_transfer']),
    mobileMoneyOperator: z.string().optional(),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          return /^[+\d\s\-()]{8,}$/.test(val);
        },
        { message: 'Format de téléphone invalide' }
      ),
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

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  type: 'registration' | 'membership';
  entityId?: string | null;
  onSuccess: (payment: any) => void;
  onError?: (error: any) => void;
}

export function PaymentForm({ amount, type, entityId, onSuccess, onError }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedRef, setGeneratedRef] = useState<string>(
    `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'mobile_money',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Régénérer la référence pour chaque tentative
      const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setGeneratedRef(reference);

      const payload = {
        amount,
        currency: 'MGA',
        paymentMethod: data.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement bancaire',
        paymentReference: reference,
        ...(type === 'registration' && { registrationId: entityId }),
        ...(type === 'membership' && { y2cMemberId: entityId }),
        metadata: {
          mobileMoneyOperator: data.mobileMoneyOperator || null,
          phoneNumber: data.phoneNumber || null,
        },
      };

      const response = await payments.create(payload);
      const payment = response?.data?.data || response?.data;

      toast.success('Paiement initié avec succès ! 🎉');
      onSuccess(payment);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l\'initiation du paiement';
      setApiError(msg);
      toast.error(msg);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-secondary/5 overflow-hidden">
      <CardHeader>
        <CardTitle className="font-ubuntu text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-secondary" />
          Paiement sécurisé
        </CardTitle>
        <CardDescription>
          Montant à payer : <strong className="text-primary text-lg">{amount.toLocaleString()} Ar</strong>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Erreur API */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Méthode de paiement */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choisissez votre méthode</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setValue('paymentMethod', val as any)}
              className="flex flex-col gap-2 sm:flex-row sm:gap-4"
              disabled={isSubmitting}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mobile_money" id="mobile_money" />
                <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  Mobile Money
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Virement bancaire
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Détails Mobile Money */}
          <AnimatePresence>
            {paymentMethod === 'mobile_money' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden pt-1"
              >
                <div className="space-y-2">
                  <Label htmlFor="operator" className="text-sm">
                    Opérateur <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch('mobileMoneyOperator')}
                    onValueChange={(val) => setValue('mobileMoneyOperator', val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="operator"
                      className={cn(errors.mobileMoneyOperator && 'border-destructive')}
                    >
                      <SelectValue placeholder="Sélectionnez un opérateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOBILE_MONEY_OPERATORS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mobileMoneyOperator && (
                    <p className="text-sm text-destructive">{errors.mobileMoneyOperator.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm">
                    Numéro de téléphone <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="034 00 000 00"
                    {...register('phoneNumber')}
                    disabled={isSubmitting}
                    className={cn(errors.phoneNumber && 'border-destructive')}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm border border-blue-100 dark:border-blue-800/30">
                  <p className="font-medium text-blue-700 dark:text-blue-300">💡 Comment payer ?</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Vous allez recevoir une demande de paiement sur votre téléphone.
                    Confirmez le paiement via votre application Mobile Money.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Détails virement bancaire */}
          <AnimatePresence>
            {paymentMethod === 'bank_transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm border border-amber-100 dark:border-amber-800/30 space-y-1"
              >
                <p className="font-medium text-amber-700 dark:text-amber-300">🏦 Coordonnées bancaires</p>
                <div className="space-y-0.5 text-muted-foreground text-xs">
                  <p>
                    <span className="font-medium">Banque :</span> Bank of Africa
                  </p>
                  <p>
                    <span className="font-medium">Compte :</span> 1234 5678 9012 3456
                  </p>
                  <p>
                    <span className="font-medium">IBAN :</span> MG34 0000 1234 5678 9012
                  </p>
                  <p>
                    <span className="font-medium">Référence :</span>{' '}
                    <span className="font-mono">{generatedRef}</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Utilisez la référence ci-dessus pour nous identifier votre paiement.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            🔒 Paiement sécurisé via <strong className="text-secondary">Youth Computing</strong>
          </p>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Payer {amount.toLocaleString()} Ar
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}