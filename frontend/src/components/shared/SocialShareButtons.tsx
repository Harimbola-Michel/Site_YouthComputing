'use client';

import {
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Mail,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SocialShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function SocialShareButtons({
  url,
  title = 'Youth Computing',
  description = 'Découvrez Youth Computing',
  className,
  variant = 'ghost',
  size = 'default',
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    email: `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(description)}%0A%0A${encodeURIComponent(url)}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareButtons = [
    {
      key: 'facebook',
      icon: Facebook,
      href: shareLinks.facebook,
      label: 'Facebook',
      color: 'hover:text-[#1877F2]',
    },
    {
      key: 'twitter',
      icon: Twitter,
      href: shareLinks.twitter,
      label: 'Twitter',
      color: 'hover:text-[#000000] dark:hover:text-[#FFFFFF]',
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      href: shareLinks.linkedin,
      label: 'LinkedIn',
      color: 'hover:text-[#0A66C2]',
    },
    {
      key: 'email',
      icon: Mail,
      href: shareLinks.email,
      label: 'Email',
      color: 'hover:text-muted-foreground',
    },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TooltipProvider>
        {shareButtons.map(({ key, icon: Icon, href, label, color }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Button
                variant={variant}
                size={size}
                className={cn('rounded-full transition-colors', color)}
                asChild
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Partager sur ${label}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className="rounded-full transition-colors hover:text-primary"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copié !' : 'Copier le lien'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}