// frontend/src/components/admin/AdminSearchOverlay.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, FileText, Users, Calendar, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSearchOverlay({ open, onOpenChange }: AdminSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  // Données de recherche (à remplacer par une vraie recherche)
  const searchData: SearchResult[] = [
    {
      id: '1',
      title: 'Formations',
      description: 'Gérer les formations',
      href: '/admin/formations',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: '2',
      title: 'Inscriptions',
      description: 'Voir les inscriptions',
      href: '/admin/inscriptions',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: '3',
      title: 'Événements Y2C',
      description: 'Gérer les événements',
      href: '/admin/y2c/evenements',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: '4',
      title: 'Paramètres',
      description: 'Configurer l\'application',
      href: '/admin/parametres',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const filtered = searchData.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        setQuery('');
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -20, opacity: 0 }}
          className="container max-w-2xl mx-auto mt-20 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans l'administration..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 text-lg"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {results.length > 0 && (
              <div className="p-2 space-y-1">
                {results.map((result) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left group"
                    onClick={() => {
                      router.push(result.href);
                      onOpenChange(false);
                    }}
                  >
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      {result.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground">{result.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </motion.button>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Aucun résultat trouvé pour "<strong>{query}</strong>"
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}