/**
 * Search & Filter Store
 * Manage search history, filters, and sort options
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  persist(
    (set, get) => ({
      // Search history
      searchHistory: [],
      addToHistory: (query: string) => {
        if (!query.trim()) return;

        set((state) => {
          const filtered = state.searchHistory.filter((q) => q !== query);
          return {
            searchHistory: [query, ...filtered].slice(0, 10), // Keep last 10
          };
        });
      },
      removeFromHistory: (query: string) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter((q) => q !== query),
        }));
      },
      clearHistory: () => set({ searchHistory: [] }),

      // Current query
      currentQuery: '',
      setCurrentQuery: (query: string) => set({ currentQuery: query }),

      // Filters
      filters: {},
      setFilters: (filters: SearchFilters) => set({ filters }),
      clearFilters: () => set({ filters: {} }),
      removeFilter: (key: keyof SearchFilters) => {
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        });
      },
      hasActiveFilters: () => {
        const filters = get().filters;
        return Object.keys(filters).length > 0;
      },

      // Sort
      sortBy: 'recent',
      setSortBy: (sortBy: SortOption) => set({ sortBy }),

      // Recent searches (alias for history)
      get recentSearches() {
        return get().searchHistory;
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
