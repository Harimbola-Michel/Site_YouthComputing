'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Clock,
  Eye,
  Star,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// ─── Configuration des statuts ──────────────────────────────
const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: 'En attente',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30',
    icon: Clock,
  },
  REVIEWED: {
    label: 'Examinée',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30',
    icon: Eye,
  },
  SHORTLISTED: {
    label: 'Présélectionnée',
    className:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/30',
    icon: Star,
  },
  INTERVIEWED: {
    label: 'Entretien effectué',
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/30',
    icon: UserCheck,
  },
  ACCEPTED: {
    label: 'Acceptée',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/30',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejetée',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/30',
    icon: XCircle,
  },
};

// ─── Configuration par défaut pour les statuts inconnus ────
const DEFAULT_CONFIG = {
  label: 'Inconnu',
  className:
    'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800/30',
  icon: AlertCircle,
};

// ─── Props ────────────────────────────────────────────────────
interface CandidatureStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function CandidatureStatusBadge({
  status,
  size = 'default',
  className,
  showIcon = true,
}: CandidatureStatusBadgeProps) {
  const config = statusConfig[status] || DEFAULT_CONFIG;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    default: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium transition-all hover:shadow-sm',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{config.label}</span>
    </Badge>
  );
}