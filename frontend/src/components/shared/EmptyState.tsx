'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mb-4 rounded-full bg-secondary/10 p-4 text-secondary',
            iconClassName
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="font-ubuntu text-xl font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}