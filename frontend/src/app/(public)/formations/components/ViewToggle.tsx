'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 w-8 p-0 transition-all',
          view === 'grid' && 'bg-background shadow-sm'
        )}
        onClick={() => onViewChange('grid')}
        aria-label="Vue grille"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 w-8 p-0 transition-all',
          view === 'list' && 'bg-background shadow-sm'
        )}
        onClick={() => onViewChange('list')}
        aria-label="Vue liste"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}