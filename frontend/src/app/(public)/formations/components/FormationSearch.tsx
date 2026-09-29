'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  const [query, setQuery] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        onSearch?.(query);
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      onSearch?.('');
    }
  }, [query, onSearch]);

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
    onSearch?.('');
  };

  return (
    <div
      className={cn(
        'relative flex items-center rounded-lg border-2 transition-all duration-200 bg-background',
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
      />
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={clearQuery}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
        {isLoading && query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-3"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}