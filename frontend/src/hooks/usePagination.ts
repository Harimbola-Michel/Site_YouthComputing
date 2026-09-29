'use client';

import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetPagination: () => void;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  total = 0,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(total);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotalItems(0);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    total: totalItems,
    totalPages,
    setPage,
    setLimit,
    setTotal: setTotalItems,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
  };
}