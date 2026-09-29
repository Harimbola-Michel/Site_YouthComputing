'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface FormationPricingProps {
  title: string;
  price: number;
  currency?: string;
  features: PricingFeature[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  recommended?: boolean;
  className?: string;
}

export function FormationPricing({
  title,
  price,
  currency = 'MGA',
  features,
  ctaLabel = 'S\'inscrire',
  onCtaClick,
  recommended = false,
  className,
}: FormationPricingProps) {
  const isFree = price === 0;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
        recommended && 'border-secondary shadow-md',
        className
      )}
    >
      {recommended && (
        <div className="absolute right-0 top-0">
          <Badge className="rounded-none rounded-bl-lg bg-secondary px-4 py-1.5 text-white">
            Recommandé
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="font-ubuntu text-2xl">{title}</CardTitle>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold text-primary">
            {isFree ? 'Gratuit' : formatCurrency(price)}
          </span>
          {!isFree && (
            <span className="ml-2 text-sm text-muted-foreground">
              / formation
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 text-sm',
              feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
            )}
          >
            <Check
              className={cn(
                'h-4 w-4',
                feature.included ? 'text-secondary' : 'text-muted-foreground'
              )}
            />
            <span>{feature.text}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={onCtaClick}
          className={cn(
            'w-full',
            recommended ? 'bg-secondary hover:bg-secondary/90' : ''
          )}
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}