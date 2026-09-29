'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/api';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';

interface Category {
  name: string;
  count: number;
}

interface ArticleCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function ArticleCategories({ selectedCategory, onSelectCategory }: ArticleCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await articles.getPublished();
      const articlesArray = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? [];

      const categoryMap = new Map<string, number>();
      articlesArray.forEach((article: any) => {
        const category = article.category?.trim() || 'Non classé';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const sorted = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCategories(sorted);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      toast.error('Impossible de charger les catégories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const totalArticles = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/5">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg flex items-center gap-2">
          <Tag className="h-4 w-4 text-secondary" />
          Catégories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant={!selectedCategory ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start font-medium rounded-lg"
            onClick={() => onSelectCategory('')}
          >
            Tous les articles
            <span className="ml-auto text-xs bg-primary/10 px-2 py-0.5 rounded-full">
              {totalArticles}
            </span>
          </Button>
        </motion.div>

        {categories.map((cat) => (
          <motion.div
            key={cat.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={selectedCategory === cat.name ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start rounded-lg"
              onClick={() => onSelectCategory(cat.name)}
            >
              {cat.name}
              <span className="ml-auto text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                {cat.count}
              </span>
            </Button>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune catégorie disponible
          </p>
        )}
      </CardContent>
    </Card>
  );
}