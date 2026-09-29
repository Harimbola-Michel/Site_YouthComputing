'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LEVELS = ['DÉBUTANT', 'INTERMÉDIAIRE', 'AVANCÉ', 'EXPERT'];
const CATEGORIES = [
  'Programmation Web',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Design',
  'Marketing Digital',
  'Autre',
];

interface FormationFiltersProps {
  className?: string;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export function FormationFilters({ className, onFilterChange }: FormationFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({
    category: 'all',
    level: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      level: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && key !== 'sortBy' && key !== 'sortOrder'
  ).length;

  // Fermer automatiquement après une sélection (sauf tri/ordre)
  const handleSelectChange = (key: string, value: string) => {
    handleFilterChange(key, value);
    if (key !== 'sortBy' && key !== 'sortOrder') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border bg-card p-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Niveau</Label>
                  <Select
                    value={filters.level || 'all'}
                    onValueChange={(value) => handleSelectChange('level', value)}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">Trier par</Label>
                  <Select
                    value={filters.sortBy || 'createdAt'}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger id="sortBy">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date de création</SelectItem>
                      <SelectItem value="title">Titre</SelectItem>
                      <SelectItem value="price">Prix</SelectItem>
                      <SelectItem value="duration">Durée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Ordre</Label>
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onValueChange={(value) => handleFilterChange('sortOrder', value)}
                  >
                    <SelectTrigger id="sortOrder">
                      <SelectValue placeholder="Décroissant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Décroissant</SelectItem>
                      <SelectItem value="asc">Croissant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === 'all' || key === 'sortBy' || key === 'sortOrder') return null;
                  const label = key === 'category' ? 'Catégorie' : key === 'level' ? 'Niveau' : key;
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs"
                    >
                      {label}: {value}
                      <button
                        onClick={() => handleFilterChange(key, 'all')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}