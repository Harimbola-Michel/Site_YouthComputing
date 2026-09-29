'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, ImageIcon, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NewsFeedProps {
  articles: any[];
  loading: boolean;
  onRefresh?: () => void;
}

export function NewsFeed({ articles, loading, onRefresh }: NewsFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Skeleton className="h-24 w-full sm:w-32 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/30 p-6 mb-4">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Aucune actualité</h3>
        <p className="mt-2 text-muted-foreground max-w-md">
          Aucun article n'a été publié pour le moment. Revenez plus tard !
        </p>
        {onRefresh && (
          <Button variant="outline" className="mt-4 gap-2" onClick={onRefresh}>
            Actualiser
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article, index) => {
        const imageUrl = article.featuredImage ? buildImageUrl(article.featuredImage, true) : null;
        const authorName = article.author
          ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim()
          : null;

        return (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
          >
            <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-secondary/20 border border-border/50">
              <CardContent className="p-0">
                <Link href={`/blog/${article.slug}`} className="block">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 192px"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        </div>
                        {authorName && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{authorName}</span>
                            </div>
                          </>
                        )}
                        {article.category && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <Badge variant="secondary" className="text-xs font-medium">
                              {article.category}
                            </Badge>
                          </>
                        )}
                        {article.readingTime && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{article.readingTime} min</span>
                            </div>
                          </>
                        )}
                      </div>

                      <h3 className="mt-2 font-ubuntu text-xl font-semibold group-hover:text-secondary transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-muted-foreground">
                        {article.excerpt ||
                          article.content?.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}
                      </p>

                      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-secondary group-hover:gap-2 transition-all">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}