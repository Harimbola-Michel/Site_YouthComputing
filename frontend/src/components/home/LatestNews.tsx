// src/components/home/LatestNews.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ImageIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { useHomeArticles } from '@/hooks/Usehomedata';
import { buildImageUrl } from '@/lib/imageUtils';
import type { Article } from '@/types/article.types';

export function LatestNews() {
  const { data: articles, isLoading, isError, error, refetch } = useHomeArticles(3);

  // ─── État de chargement ──────────────────────────────────────
  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30" aria-labelledby="news-title">
        <div className="container-custom">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 id="news-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
                Dernières <span className="text-secondary">actualités</span>
              </h2>
              <p className="mt-2 text-muted-foreground">Chargement...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ─── Gestion d'erreur ────────────────────────────────────────
  if (isError) {
    console.error('❌ Erreur chargement articles:', error);
    return (
      <section className="py-20 bg-muted/30" aria-labelledby="news-title">
        <div className="container-custom text-center">
          <h2 id="news-title" className="font-ubuntu text-3xl font-bold">
            Dernières <span className="text-secondary">actualités</span>
          </h2>
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Impossible de charger les articles. Veuillez réessayer.
            </p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Réessayer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const displayArticles = Array.isArray(articles) ? articles.slice(0, 3) : [];

  if (displayArticles.length === 0) {
    return (
      <section className="py-20 bg-muted/30" aria-labelledby="news-title">
        <div className="container-custom text-center">
          <h2 id="news-title" className="font-ubuntu text-3xl font-bold">
            Dernières <span className="text-secondary">actualités</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Aucun article publié pour le moment.</p>
        </div>
      </section>
    );
  }

  // ─── Rendu principal ──────────────────────────────────────────
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background" aria-labelledby="news-title">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h2 id="news-title" className="font-ubuntu text-3xl font-bold md:text-4xl">
              Dernières <span className="text-secondary">actualités</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Restez informé des dernières nouvelles de Youth Computing
            </p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayArticles.map((article: Article, index: number) => {
            const imageUrl = article.featuredImage
              ? buildImageUrl(article.featuredImage, true)
              : null;

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl border-2 hover:border-secondary/20">
                  {/* ─── Image ────────────────────────────────── */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = document.getElementById(`fallback-${article.id}`);
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          id={`fallback-${article.id}`}
                          className="absolute inset-0 hidden flex-col items-center justify-center gap-2 text-muted-foreground bg-gray-50"
                        >
                          <ImageIcon className="h-12 w-12 opacity-20" />
                          <span className="text-xs uppercase tracking-wider opacity-50">Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 opacity-20" />
                        <span className="text-xs uppercase tracking-wider opacity-50">Image</span>
                      </div>
                    )}
                  </div>

                  {/* ─── Contenu ────────────────────────────── */}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {article.category || 'Non classé'}
                      </Badge>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      </div>
                    </div>
                    <CardTitle className="font-ubuntu text-lg leading-snug">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="transition-colors hover:text-secondary line-clamp-2"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt ||
                        article.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                    </p>
                  </CardContent>

                  <CardFooter>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
                    >
                      Lire la suite
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
