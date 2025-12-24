/**
 * Search & Filter Store
 * Manage search history, filters, and sort options
 * Uses MMKV for 10-20x faster storage operations
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '../utils/storage';

// Handle __DEV__ being undefined in test environments
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  difficulty?: string;
}

export type SortOption =
  | 'recent'
  | 'popular'
  | 'price-low'
  | 'price-high'
  | 'rating';

interface SearchState {
  // Search history
  searchHistory: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;

  // Current search query
  currentQuery: string;
  setCurrentQuery: (query: string) => void;

  // Filters
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  removeFilter: (key: keyof SearchFilters) => void;
  hasActiveFilters: () => boolean;

  // Sort
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Suggestions
  recentSearches: string[];
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // Search history
        searchHistory: [] as string[],
        addToHistory: (query: string) => {
          if (!query.trim()) return;

          set(
            (state) => {
              const filtered = state.searchHistory.filter((q) => q !== query);
              return {
                searchHistory: [query, ...filtered].slice(0, 10), // Keep last 10
              };
            },
            false,
            'search/addToHistory',
          );
        },
        removeFromHistory: (query: string) => {
          set(
            (state) => ({
              searchHistory: state.searchHistory.filter((q) => q !== query),
            }),
            false,
            'search/removeFromHistory',
          );
        },
        clearHistory: () =>
          set({ searchHistory: [] }, false, 'search/clearHistory'),

        // Current query
        currentQuery: '',
        setCurrentQuery: (query: string) =>
          set({ currentQuery: query }, false, 'search/setQuery'),

        // Filters
        filters: {},
        setFilters: (filters: SearchFilters) =>
          set({ filters }, false, 'search/setFilters'),
        clearFilters: () => set({ filters: {} }, false, 'search/clearFilters'),
        removeFilter: (key: keyof SearchFilters) => {
          set(
            (state) => {
              const newFilters = { ...state.filters };
              delete newFilters[key];
              return { filters: newFilters };
            },
            false,
            'search/removeFilter',
          );
        },
        hasActiveFilters: () => {
          const filters = get().filters;
          return Object.keys(filters).length > 0;
        },

        // Sort
        sortBy: 'recent',
        setSortBy: (sortBy: SortOption) =>
          set({ sortBy }, false, 'search/setSortBy'),

        // Recent searches (alias for history)
        get recentSearches() {
          return get().searchHistory;
        },
      }),
      {
        name: 'search-storage',
        storage: createJSONStorage(() => Storage),
      },
    ),
    {
      name: 'SearchStore',
      enabled: isDev,
    },
  ),
);
