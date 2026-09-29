'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { ArticleGrid } from './components/ArticleGrid';
import { ArticleCategories } from './components/ArticleCategories';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  author?: { firstName?: string; lastName?: string; avatar?: string };
  readingTime?: number;
}

// ─── Recherche récursive d’un tableau d’articles ──────────────
function findArticlesArray(obj: any, depth: number = 0): any[] | null {
  if (!obj || typeof obj !== 'object' || depth > 5) return null;

  if (Array.isArray(obj) && obj.length > 0 && obj.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
    return obj;
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      const result = findArticlesArray(value, depth + 1);
      if (result) return result;
    }
  }

  return null;
}

export default function BlogPage() {
  const [articlesData, setArticlesData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchArticles = useCallback(async (category?: string, search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { status: 'published' };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await articles.getPublished(params);
      console.log('📦 Réponse API articles :', response);

      let articlesArray: any[] = [];
      if (response?.data) {
        const found = findArticlesArray(response.data);
        if (found) {
          articlesArray = found;
        } else {
          const directPaths = [
            response.data.data,
            response.data.articles,
            response.data.items,
            response.data.results,
            response.data,
          ];
          for (const path of directPaths) {
            if (Array.isArray(path) && path.length > 0 && path.every(item => typeof item === 'object' && 'id' in item)) {
              articlesArray = path;
              break;
            }
          }
        }
      }

      console.log(`✅ ${articlesArray.length} articles extraits.`);
      setArticlesData(articlesArray);

      const uniqueCategories = Array.from(
        new Set(articlesArray.map((a: any) => a.category).filter(Boolean))
      );
      setCategories(uniqueCategories);

    } catch (err: any) {
      console.error('❌ Erreur chargement articles:', err);
      setError(err?.message || 'Impossible de charger les articles.');
      toast.error('Erreur de chargement des articles');
      setArticlesData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchArticles(selectedCategory, value);
    }, 400),
    [selectedCategory, fetchArticles]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchArticles(category, searchTerm);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchArticles(selectedCategory, searchTerm);
    setIsRefreshing(false);
    toast.success('Articles actualisés ✅');
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    fetchArticles('', '');
  };

  const hasFilters = selectedCategory || searchTerm;
  const articleCount = articlesData.length;

  // ─── Notification « S'abonner » ──────────────────────────────
  const handleSubscribe = () => {
    toast('Fonctionnalité à venir', {
      icon: '📬',
      duration: 4000,
      style: {
        background: '#363636',
        color: '#fff',
        borderRadius: '12px',
        padding: '12px 20px',
      },
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* ─── Hero Section ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4"
            >
              <Sparkles className="h-4 w-4" />
              Dernières actualités
            </motion.div>
            <h1 className="font-ubuntu text-4xl font-bold md:text-5xl lg:text-6xl">
              Blog <span className="text-secondary">Youth Computing</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Découvrez les dernières nouvelles, événements et projets de notre communauté.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="h-4 w-4" />
                Explorer
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSubscribe}
              >
                <Info className="h-4 w-4" />
                S'abonner
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ─── Contenu principal ────────────────────────────────── */}
        <div className="container mx-auto px-4 py-8 md:py-12" id="articles-section">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-64 flex-shrink-0">
              <ArticleCategories
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
                categories={categories}
                loading={loading}
              />
            </aside>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9 border-2 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-1.5"
                  >
                    <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                    <span className="hidden sm:inline">Actualiser</span>
                  </Button>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {loading ? 'Chargement...' : `${articleCount} article${articleCount > 1 ? 's' : ''} trouvé${articleCount > 1 ? 's' : ''}`}
                </span>
                {hasFilters && (
                  <span className="text-xs">
                    Filtres actifs : {selectedCategory && `Catégorie "${selectedCategory}"`}
                    {selectedCategory && searchTerm && ' • '}
                    {searchTerm && `Recherche "${searchTerm}"`}
                  </span>
                )}
              </div>

              <ArticleGrid
                articles={articlesData}
                loading={loading}
                error={error}
                onRetry={() => fetchArticles(selectedCategory, searchTerm)}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
