'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

const CATEGORIES = ['Éducation', 'Santé', 'Technologie', 'Environnement', 'Social', 'Autre'];
const STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'EVALUATING'];

interface ProjectFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

export function ProjectFilters({ onFilterChange, isLoading = false }: ProjectFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [year, setYear] = useState('');

  const hasFilters = search || category !== 'all' || status !== 'all' || year;

  const applyFilters = () => {
    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (category !== 'all') filters.category = category;
    if (status !== 'all') filters.status = status;
    if (year) filters.year = year;
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setYear('');
    onFilterChange({});
  };

  useEffect(() => {
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, year]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Select value={category} onValueChange={setCategory} disabled={isLoading}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Catégorie" />
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
        <Select value={status} onValueChange={setStatus} disabled={isLoading}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Année"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-[120px]"
          disabled={isLoading}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isLoading} className="gap-1">
            <X className="h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}