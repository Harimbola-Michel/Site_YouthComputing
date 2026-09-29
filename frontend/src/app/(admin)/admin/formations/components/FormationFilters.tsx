// src/app/(admin)/admin/formations/components/FormationFilters.tsx
'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/admin/FilterBar';

const filterOptions = [
  {
    key: 'category',
    label: 'Catégorie',
    type: 'select' as const,
    options: [
      { label: 'Programmation Web', value: 'Programmation Web' },
      { label: 'Intelligence Artificielle', value: 'Intelligence Artificielle' },
      { label: 'Data Science', value: 'Data Science' },
      { label: 'Cybersécurité', value: 'Cybersécurité' },
      { label: 'Design', value: 'Design' },
      { label: 'Marketing Digital', value: 'Marketing Digital' },
      { label: 'DevOps', value: 'DevOps' },
      { label: 'Mobile', value: 'Mobile' },
    ],
    placeholder: 'Toutes',
  },
  {
    key: 'level',
    label: 'Niveau',
    type: 'select' as const,
    options: [
      { label: 'Débutant', value: 'BEGINNER' },
      { label: 'Intermédiaire', value: 'INTERMEDIATE' },
      { label: 'Avancé', value: 'ADVANCED' },
      { label: 'Expert', value: 'EXPERT' },
    ],
    placeholder: 'Tous',
  },
  {
    key: 'isPublished',
    label: 'Statut',
    type: 'select' as const,
    options: [
      { label: 'Publiée', value: 'true' },
      { label: 'Brouillon', value: 'false' },
    ],
    placeholder: 'Tous',
  },
];

export function FormationFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <FilterBar
      filters={filters}
      onFilterChange={handleFilterChange}
      filterOptions={filterOptions}
    />
  );
}