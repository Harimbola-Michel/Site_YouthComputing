'use client';

import { Calendar, User, Tag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';

interface ArticleContentProps {
  article: any;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const readingTime = article.readingTime || 3;

  return (
    <div className="space-y-6">
      <h1 className="font-ubuntu text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min de lecture</span>
        </div>
        {article.author && (
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>
              {`${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() || 'Auteur'}
            </span>
          </div>
        )}
        {article.category && (
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
        )}
      </div>

      <Separator />

      {article.excerpt && (
        <p className="text-lg text-muted-foreground italic border-l-4 border-secondary/30 pl-4 py-1">
          {article.excerpt}
        </p>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-ubuntu prose-a:text-secondary prose-strong:text-foreground prose-img:rounded-xl prose-img:shadow-lg"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {article.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal hover:bg-secondary/10 transition-colors">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}