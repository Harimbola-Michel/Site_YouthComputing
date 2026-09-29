'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePagination } from './usePagination';
import { useDebounce } from './useDebounce';

interface UseDataTableOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface UseDataTableReturn<T> {
  data: T[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setTotal: (total: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setFilters: (filters: Record<string, any>) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort: (field: string) => void;
  resetFilters: () => void;
  getQueryParams: () => Record<string, any>;
}

export function useDataTable<T = any>(
  options: UseDataTableOptions = {}
): UseDataTableReturn<T> {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc',
    filters: initialFilters = {},
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const debouncedSearch = useDebounce(search, 500);

  const {
    page,
    limit,
    total: totalItems,
    totalPages,
    setTotal,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination({
    initialPage,
    initialLimit,
  });

  const onPageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1);
    },
    [setLimit, setPage]
  );

  const onSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
    },
    [sortBy, sortOrder]
  );

  const resetFilters = useCallback(() => {
    setSearch(initialSearch);
    setFilters(initialFilters);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
    setPage(1);
  }, [initialSearch, initialFilters, initialSortBy, initialSortOrder, setPage]);

  const getQueryParams = useCallback(() => {
    return {
      page,
      limit,
      search: debouncedSearch,
      sortBy,
      sortOrder,
      ...filters,
    };
  }, [page, limit, debouncedSearch, sortBy, sortOrder, filters]);

  return {
    data,
    loading,
    total: totalItems,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    sortOrder,
    filters,
    setData,
    setLoading,
    setTotal,
    setSearch,
    setSortBy,
    setSortOrder,
    setFilters,
    onPageChange,
    onLimitChange,
    onSort,
    resetFilters,
    getQueryParams,
  };
}