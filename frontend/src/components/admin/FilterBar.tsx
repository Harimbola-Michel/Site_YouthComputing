'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  filterOptions: FilterOption[];
  className?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  filterOptions,
  className,
}: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  const activeFilters = Object.keys(localFilters).filter(
    (key) => localFilters[key] !== '' && localFilters[key] !== undefined
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-ubuntu font-semibold">Filtres</span>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto px-2 text-xs text-muted-foreground"
                  >
                    Tout effacer
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {filterOptions.map((option) => {
                  const value = localFilters[option.key] || '';
                  return (
                    <div key={option.key} className="space-y-1">
                      <Label className="text-xs">{option.label}</Label>
                      {option.type === 'text' && (
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleFilterChange(option.key, e.target.value)
                          }
                          placeholder={option.placeholder || ''}
                          className="h-8 text-sm"
                        />
                      )}
                      {option.type === 'select' && option.options && (
                        <Select
                          value={value}
                          onValueChange={(val) =>
                            handleFilterChange(option.key, val)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder={option.placeholder || 'Tous'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Tous</SelectItem>
                            {option.options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {option.type === 'date' && (
                        <Input
                          type="date"
                          value={value}
                          onChange={(e) =>
                            handleFilterChange(option.key, e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <Button
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Appliquer
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtres actifs */}
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((key) => {
            const option = filterOptions.find((o) => o.key === key);
            if (!option) return null;
            const label = option.label;
            const value = localFilters[key];
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-xs"
              >
                {label}: {value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}