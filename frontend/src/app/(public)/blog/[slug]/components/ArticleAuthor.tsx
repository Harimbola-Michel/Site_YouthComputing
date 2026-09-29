'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildImageUrl } from '@/lib/imageUtils';

interface ArticleAuthorProps {
  article: any;
}

export function ArticleAuthor({ article }: ArticleAuthorProps) {
  const author = article.author;
  if (!author) return null;

  const initials = `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Card className="border-2 border-primary/5 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarImage src={author.avatar ? buildImageUrl(author.avatar, false) : undefined} alt={`${author.firstName} ${author.lastName}`} />
          <AvatarFallback className="bg-secondary/10 text-secondary font-semibold text-xl">
            {initials || 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-semibold text-lg">
              {`${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Auteur'}
            </p>
            {author.role && <p className="text-sm text-muted-foreground">{author.role}</p>}
          </div>
          {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            {author.email && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`mailto:${author.email}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
            {author.twitter && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={author.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </Button>
            )}
            {author.linkedin && (
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}