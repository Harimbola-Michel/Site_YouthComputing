// src/components/admin/y2c/MemberDetails.tsx

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  CalendarDays, 
  Clock, 
  CreditCard,
  User 
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
export type Y2CMemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING';

export interface Y2CMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  badgeNumber: string;
  institution?: string | null;
  status: Y2CMemberStatus;
  membershipFeePaid?: number | null;
  joinedAt: string;
  expiresAt?: string | null;
  createdAt: string;
}

interface MemberDetailsProps {
  member: Y2CMember | null;
  open: boolean;
  onClose: () => void;
}

// ─── Configuration des statuts ────────────────────────────
const statusConfig: Record<
  Y2CMemberStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Actif',
    className: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  },
  INACTIVE: {
    label: 'Inactif',
    className: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
  },
  EXPIRED: {
    label: 'Expiré',
    className: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
  PENDING: {
    label: 'En attente',
    className: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
  },
};

// ─── Composant ──────────────────────────────────────────────
export function MemberDetails({ member, open, onClose }: MemberDetailsProps) {
  if (!member) return null;

  const status = member.status as Y2CMemberStatus;
  const statusInfo = statusConfig[status] || statusConfig.PENDING;
  
  // Initiales pour l'avatar
  const initials = member.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Valeurs par défaut pour les champs optionnels
  const institution = member.institution || 'Non renseignée';
  const phone = member.phone || 'Non renseigné';
  const fee = member.membershipFeePaid ?? 0;
  const expiresAt = member.expiresAt ? formatDate(member.expiresAt) : 'Non définie';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-ubuntu text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-secondary" />
            Détails du membre
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ─── En-tête du profil ──────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarFallback className="bg-secondary/10 text-secondary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-ubuntu text-lg font-semibold leading-tight">
                  {member.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{member.email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'shrink-0 font-medium capitalize',
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </Badge>
          </div>

          <Separator />

          {/* ─── Informations ───────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Award className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">N° Badge</p>
                <p className="font-mono font-medium">{member.badgeNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="font-medium">{institution}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Cotisation</p>
                <p className="font-medium">{fee.toLocaleString()} Ar</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date d&apos;adhésion</p>
                <p className="font-medium">{formatDate(member.joinedAt)}</p>
              </div>
            </div>
          </div>

          {/* ─── Expiration ────────────────────────────── */}
          {member.expiresAt && (
            <div className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <Clock className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Expire le</p>
                <p className="font-medium text-destructive">{expiresAt}</p>
              </div>
            </div>
          )}

          {/* ─── Pied de dialogue ──────────────────────── */}
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            ID: <span className="font-mono">{member.id}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}