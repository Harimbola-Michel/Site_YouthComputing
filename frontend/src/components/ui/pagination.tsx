// src/components/ui/pagination.tsx
'use client';

import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  // Génération des numéros de page
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // 1 (first) + 2*sibling + 1 (current) + 1 (last)
    const totalBlocks = totalNumbers + 2; // +2 for dots

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Show first 5 numbers, then dots, then last
      const leftItems = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
      return [...leftItems, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Show first, dots, last 5 numbers
      const rightItems = Array.from(
        { length: 3 + 2 * siblingCount },
        (_, i) => totalPages - (3 + 2 * siblingCount - 1) + i
      );
      return [1, '...', ...rightItems];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleItems = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleItems, '...', totalPages];
    }

    return [];
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-2 text-muted-foreground">
              …
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'min-w-[36px]',
              isActive && 'pointer-events-none'
            )}
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}