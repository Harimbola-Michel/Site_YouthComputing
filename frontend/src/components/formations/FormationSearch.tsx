'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Hook personnalisé pour débouncer une valeur
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface FormationSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
}

export function FormationSearch({
  className,
  placeholder = 'Rechercher une formation...',
  onSearch,
  initialValue = '',
}: FormationSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 400);

  // Effet pour déclencher la recherche par debounce
  useEffect(() => {
    // Ne pas déclencher si la requête est vide et que c'est la valeur initiale
    if (debouncedQuery === initialValue && debouncedQuery === '') return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      onSearch?.(debouncedQuery);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [debouncedQuery, onSearch, initialValue]);

  // Soumission du formulaire → redirection vers la page de recherche
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/formations?search=${encodeURIComponent(trimmed)}`);
    }
  };

  // Effacer la requête
  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
    onSearch?.('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative flex items-center rounded-lg border-2 transition-all duration-200',
        isFocused ? 'border-secondary shadow-md' : 'border-input',
        className
      )}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="border-0 bg-transparent pl-9 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
        aria-label="Rechercher une formation"
      />
      <AnimatePresence mode="wait">
        {isLoading && query && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-3"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </motion.div>
        )}
        {!isLoading && query && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={clearQuery}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </form>
  );
}