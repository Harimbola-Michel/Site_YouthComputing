'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const queryString = params.toString();
    const url = queryString ? `/formations?${queryString}` : '/formations';
    router.push(url, { scroll: false });
    onFilterChange?.(filters);
  }, [filters, router, onFilterChange]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre de recherche et filtres rapides */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Rechercher une formation..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pr-8"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

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

      {/* Panel de filtres */}
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
                {/* Catégorie */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Niveau */}
                <div className="space-y-2">
                  <Label htmlFor="level">Niveau</Label>
                  <Select
                    value={filters.level}
                    onValueChange={(value) => handleFilterChange('level', value)}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les niveaux</SelectItem>
                      {LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trier par */}
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Trier par</Label>
                  <Select
                    value={filters.sortBy}
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

                {/* Ordre */}
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Ordre</Label>
                  <Select
                    value={filters.sortOrder}
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

              {/* Filtres actifs */}
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === 'search') return null;
                  const label =
                    key === 'category'
                      ? 'Catégorie'
                      : key === 'level'
                      ? 'Niveau'
                      : key === 'sortBy'
                      ? 'Trier par'
                      : key === 'sortOrder'
                      ? 'Ordre'
                      : key;
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs"
                    >
                      {label}: {value}
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}