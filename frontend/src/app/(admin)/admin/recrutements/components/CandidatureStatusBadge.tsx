'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
  },
  REVIEWED: {
    label: 'Examinée',
    className: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
  },
  SHORTLISTED: {
    label: 'Présélectionnée',
    className: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20',
  },
  INTERVIEWED: {
    label: 'Entretien effectué',
    className: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20',
  },
  ACCEPTED: {
    label: 'Acceptée',
    className: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20',
  },
  REJECTED: {
    label: 'Rejetée',
    className: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20',
  },
};

// Valeur par défaut pour les statuts non reconnus
const DEFAULT_CONFIG = {
  label: 'Inconnu',
  className: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20',
};

interface CandidatureStatusBadgeProps {
  status: string;
  className?: string;
}

export function CandidatureStatusBadge({ status, className }: CandidatureStatusBadgeProps) {
  const config = statusConfig[status] || DEFAULT_CONFIG;

  return (
    <Badge variant="outline" className={cn('font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
}