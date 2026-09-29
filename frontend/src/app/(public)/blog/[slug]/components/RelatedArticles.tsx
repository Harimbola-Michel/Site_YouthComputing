'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  articles: any[];
  loading?: boolean;
}

export function RelatedArticles({ articles, loading = false }: RelatedArticlesProps) {
  if (loading) {
    return (
      <Card className="border-2 border-primary/5">
        <CardHeader>
          <CardTitle className="font-ubuntu text-lg">Articles similaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <Card className="border-2 border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="font-ubuntu text-lg flex items-center justify-between">
          <span>Articles similaires</span>
          <Link href="/blog" className="text-sm font-normal text-secondary hover:underline">
            Voir tous
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              href={`/blog/${article.slug}`}
              className="group flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-all hover:pl-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-secondary transition-colors">
                  {article.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {article.excerpt || article.content?.replace(/<[^>]*>/g, '').slice(0, 80)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}