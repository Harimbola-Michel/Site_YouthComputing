'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BulkAction {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActions({
  selectedIds,
  onClearSelection,
  actions,
  className,
}: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const count = selectedIds.length;

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg',
        className
      )}
    >
      <Badge variant="secondary" className="h-7 px-3">
        {count} sélectionné{count > 1 ? 's' : ''}
      </Badge>

      <span className="h-6 w-px bg-border" />

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Actions
            <span className="ml-1 text-xs">▼</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[180px]">
          <DropdownMenuLabel>Actions groupées</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.value}
              onClick={() => {
                action.onClick(selectedIds);
                setIsOpen(false);
              }}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-muted-foreground hover:text-foreground"
        onClick={onClearSelection}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}