'use client';

import { ReactNode } from 'react';
import { Check, Shield, UserCog, PenTool, Eye, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/types/user.types';
import { cn } from '@/lib/utils';

// ─── Configuration des rôles ──────────────────────────────
export interface RoleConfig {
  label: string;
  icon: ReactNode;
  color: string;
  description: string;
}

export const ROLES_CONFIG: Record<Role, RoleConfig> = {
  [Role.SUPER_ADMIN]: {
    label: 'Super Administrateur',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    description: 'Accès total à toutes les fonctionnalités',
  },
  [Role.ADMIN]: {
    label: 'Administrateur',
    icon: <UserCog className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    description: 'Gestion avancée des utilisateurs et contenus',
  },
  [Role.EDITOR]: {
    label: 'Éditeur',
    icon: <PenTool className="h-4 w-4" />,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    description: 'Gestion des articles et publications',
  },
  [Role.VIEWER]: {
    label: 'Contributeur',
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    description: 'Consultation et propositions de contenu',
  },
  [Role.MEMBER]: {
    label: 'Membre',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    description: 'Accès aux fonctionnalités de base',
  },
};

/**
 * Récupère la configuration d'un rôle donné.
 */
export function getRoleConfig(role: Role): RoleConfig {
  return ROLES_CONFIG[role];
}

// ─── Props du sélecteur ─────────────────────────────────────
export interface RoleSelectorProps {
  /** Rôle actuellement sélectionné */
  value: Role;
  /** Fonction appelée lors du changement */
  onChange: (role: Role) => void;
  /** Classes CSS supplémentaires pour le trigger */
  className?: string;
  /** Désactiver le sélecteur */
  disabled?: boolean;
  /** Ajouter une option "Tous les rôles" (pour les filtres) */
  includeAll?: boolean;
  /** ID pour l'accessibilité */
  id?: string;
  /** Placeholder personnalisé */
  placeholder?: string;
}

export function RoleSelector({
  value,
  onChange,
  className,
  disabled = false,
  includeAll = false,
  id,
  placeholder = 'Sélectionner un rôle',
}: RoleSelectorProps) {
  // Construction des options
  const options = includeAll
    ? [
        { value: 'all' as Role, label: 'Tous les rôles' },
        ...Object.entries(ROLES_CONFIG).map(([key, config]) => ({
          value: key as Role,
          label: config.label,
        })),
      ]
    : Object.entries(ROLES_CONFIG).map(([key, config]) => ({
        value: key as Role,
        label: config.label,
      }));

  const currentConfig = value && value !== 'all' ? ROLES_CONFIG[value] : null;

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as Role)}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)} id={id}>
        <div className="flex items-center gap-2">
          {currentConfig && (
            <span className={cn('rounded-full p-1', currentConfig.color)}>
              {currentConfig.icon}
            </span>
          )}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const isAll = option.value === 'all';
          const config = isAll ? null : ROLES_CONFIG[option.value];
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2 py-1">
                {config && (
                  <span className={cn('rounded-full p-1', config.color)}>
                    {config.icon}
                  </span>
                )}
                <span className="flex-1 font-medium">{option.label}</span>
                {!isAll && (
                  <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                    {config?.description}
                  </span>
                )}
                {value === option.value && (
                  <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}