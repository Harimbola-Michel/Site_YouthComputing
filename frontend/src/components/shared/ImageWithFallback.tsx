'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/brand/placeholder-avatar.svg',
  className,
  fallbackClassName,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={cn(hasError && fallbackClassName, className)}
      onError={handleError}
      {...props}
    />
  );
}