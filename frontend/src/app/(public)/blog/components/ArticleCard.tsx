'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, User, ArrowRight, Clock, Eye, Heart, MessageCircle, ImageOff } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { buildImageUrl } from '@/lib/imageUtils'; // ✅ Import

export interface Author {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

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
  author?: Author;
  readingTime?: number;
  views?: number;
  likes?: number;
  comments?: number;
}

interface ArticleCardProps {
  article: Article;
  index: number;
  className?: string;
}

export function ArticleCard({ article, index, className }: ArticleCardProps) {
  const {
    id,
    title,
    slug,
    featuredImage,
    publishedAt,
    createdAt,
    author,
    excerpt,
    content,
    tags = [],
    category,
    readingTime = 3,
    views = 0,
    likes = 0,
    comments = 0,
  } = article;

  const [imageError, setImageError] = useState(false);

  // ✅ Utilisation de buildImageUrl pour l'image de couverture
  const imageSrc = buildImageUrl(featuredImage, true);
  const showPlaceholder = !imageSrc || imageError;

  const displayExcerpt = excerpt
    ? excerpt
    : content
      ? content.replace(/<[^>]*>/g, '').slice(0, 140) + (content.length > 140 ? '...' : '')
      : 'Lire cet article...';

  const isNew = () => {
    if (!publishedAt && !createdAt) return false;
    const date = new Date(publishedAt || createdAt);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 7;
  };

  const authorName = author
    ? `${author.firstName || ''} ${author.lastName || ''}`.trim()
    : null;

  // Avatar de l'auteur (avec fallback)
  const authorAvatarSrc = author?.avatar ? buildImageUrl(author.avatar, true) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className={cn('h-full', className)}
    >
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-secondary/20 flex flex-col bg-card/50 backdrop-blur-sm">
        {/* ─── Image ────────────────────────────────────────────── */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
          {showPlaceholder ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
              <ImageOff className="h-12 w-12 text-gray-300" />
              <span className="mt-2 text-sm text-gray-400">Image non disponible</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges supérieurs */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {isNew() && (
              <Badge className="bg-secondary text-white shadow-lg border-0">
                Nouveau
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="border-white/20 bg-black/40 text-white backdrop-blur-sm">
                {category}
              </Badge>
            )}
          </div>

          {/* Métriques en bas à droite */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-white/80 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
            {views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {views}
              </span>
            )}
            {likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {likes}
              </span>
            )}
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {comments}
              </span>
            )}
          </div>
        </div>

        {/* ─── Contenu ──────────────────────────────────────────── */}
        <CardHeader className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(publishedAt || createdAt)}</span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} min</span>
            </div>
            {authorName && (
              <>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-1">
                  {authorAvatarSrc ? (
                    <img
                      src={authorAvatarSrc}
                      alt={authorName}
                      className="h-4 w-4 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate max-w-[100px]">{authorName}</span>
                </div>
              </>
            )}
          </div>
          <CardTitle className="font-ubuntu text-xl leading-tight group-hover:text-secondary transition-colors">
            <Link href={`/blog/${slug}`} className="line-clamp-2">
              {title}
            </Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {displayExcerpt}
          </p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal text-muted-foreground hover:text-secondary transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* ─── Pied de carte ───────────────────────────────────── */}
        <CardFooter className="border-t pt-4 flex items-center justify-between">
          <Button asChild variant="ghost" className="gap-2 group-hover:gap-3 transition-all text-secondary hover:text-secondary/80 hover:bg-secondary/10">
            <Link href={`/blog/${slug}`}>
              Lire la suite
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          {authorName && (
            <span className="text-xs text-muted-foreground/60 hidden sm:block">
              {authorName}
            </span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}