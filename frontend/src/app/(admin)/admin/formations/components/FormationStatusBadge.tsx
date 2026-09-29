// src/app/(admin)/admin/formations/components/FormationStatusBadge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormationStatusBadgeProps {
  isPublished: boolean;
  className?: string;
}

export function FormationStatusBadge({ isPublished, className }: FormationStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        isPublished
          ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
          : 'border-gray-500/30 bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
        className
      )}
    >
      {isPublished ? 'Publiée' : 'Brouillon'}
    </Badge>
  );
}