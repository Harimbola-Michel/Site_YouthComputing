import { create } from 'zustand';

interface AdminState {
  selectedItems: string[];
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  isBulkAction: boolean;

  // Actions
  setSelectedItems: (items: string[]) => void;
  toggleSelectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  setFilters: (filters: Record<string, any>) => void;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setBulkAction: (active: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedItems: [],
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
  page: 1,
  limit: 10,
  total: 0,
  isLoading: false,
  isBulkAction: false,
};

export const useAdminStore = create<AdminState>((set, get) => ({
  ...initialState,

  setSelectedItems: (items: string[]) => {
    set({ selectedItems: items });
  },

  toggleSelectItem: (id: string) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((item) => item !== id)
        : [...state.selectedItems, id],
    }));
  },

  selectAll: (ids: string[]) => {
    set({ selectedItems: ids });
  },

  deselectAll: () => {
    set({ selectedItems: [] });
  },

  setFilters: (filters: Record<string, any>) => {
    set({ filters, page: 1 });
  },

  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => {
    set({ sortBy, sortOrder });
  },

  setPage: (page: number) => {
    set({ page });
  },

  setLimit: (limit: number) => {
    set({ limit, page: 1 });
  },

  setTotal: (total: number) => {
    set({ total });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setBulkAction: (active: boolean) => {
    set({ isBulkAction: active });
  },

  reset: () => {
    set(initialState);
  },
}));