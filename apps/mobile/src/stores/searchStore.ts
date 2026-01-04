/**
 * Search & Filter Store
 * Dating & Gifting Platform - Single Source of Truth
 * Uses MMKV for 10-20x faster storage operations
 *
 * MASTER Revizyonu:
 * - Seyahat filtreleri kaldırıldı
 * - Dating filtreleri eklendi (yaş, cinsiyet, mesafe)
 * - Gift value range entegre edildi
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '../utils/storage';

// Handle __DEV__ being undefined in test environments
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

// Moment Categories - "Seyahat" değil, "Deneyim Paylaşımı"
export type MomentCategory =
  | 'gastronomy' // Gastronomi
  | 'nightlife' // Gece Hayatı
  | 'culture' // Kültür & Sanat
  | 'adventure' // Macera
  | 'wellness' // Sağlık & Wellness
  | 'photography' // Fotoğraf Turu
  | 'local_secrets' // Yerel Sırlar
  | 'vip_access'; // VIP Erişim

// Gender options for dating filters
export type GenderOption = 'male' | 'female' | 'non-binary' | 'all';

// Subscription tiers (REFACTOR: vip/starter → Basic/Premium/Platinum)
export type SubscriptionTier = 'basic' | 'premium' | 'platinum';

export interface SearchFilters {
  // Moment kategorisi (Seyahat değil, Deneyim)
  momentCategory?: MomentCategory;

  // DATING FILTERS - Yeni eklenen alanlar
  ageRange?: [number, number]; // 18-99 arası çift slider
  gender?: GenderOption[]; // Çoklu seçim desteği
  maxDistance?: number; // 1km - 500km/Global arası yarıçap

  // Gifting Range (Hediye Aralığı) - 0-30-100+ baremine uygun
  giftValueRange?: [number, number];

  // Konum & Tarih
  location?: string;
  dateFrom?: string;
  dateTo?: string;

  // Abonelik bazlı görünürlük (REFACTOR: vip/starter → Basic/Premium/Platinum)
  showExclusiveMoments?: boolean; // Premium/Platinum only
  hostTier?: SubscriptionTier;
}

// Default dating filter values
export const DEFAULT_FILTERS: SearchFilters = {
  ageRange: [18, 99],
  gender: ['all'],
  maxDistance: 500, // Global by default
  giftValueRange: [0, 999999], // All gift ranges
  momentCategory: undefined,
  showExclusiveMoments: false,
};

export type SortOption =
  | 'recent'
  | 'popular'
  | 'price-low'
  | 'price-high'
  | 'nearest'
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
  updateFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
  removeFilter: (key: keyof SearchFilters) => void;
  hasActiveFilters: () => boolean;

  // Sort
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Suggestions
  recentSearches: string[];

  // Filter change callback for re-fetch trigger
  filterVersion: number;
  incrementFilterVersion: () => void;
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

        // Filters with dating support
        filters: { ...DEFAULT_FILTERS },
        setFilters: (filters: SearchFilters) => {
          set({ filters }, false, 'search/setFilters');
          // Trigger re-fetch on filter change
          get().incrementFilterVersion();
        },
        updateFilter: <K extends keyof SearchFilters>(
          key: K,
          value: SearchFilters[K],
        ) => {
          set(
            (state) => ({
              filters: { ...state.filters, [key]: value },
            }),
            false,
            'search/updateFilter',
          );
          get().incrementFilterVersion();
        },
        clearFilters: () => {
          set({ filters: {} }, false, 'search/clearFilters');
          get().incrementFilterVersion();
        },
        resetToDefaults: () => {
          set(
            { filters: { ...DEFAULT_FILTERS } },
            false,
            'search/resetToDefaults',
          );
          get().incrementFilterVersion();
        },
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
          get().incrementFilterVersion();
        },
        hasActiveFilters: () => {
          const { filters } = get();
          // Check if any filter differs from default
          return (
            filters.momentCategory !== undefined ||
            (filters.ageRange &&
              (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 99)) ||
            (filters.gender && !filters.gender.includes('all')) ||
            (filters.maxDistance !== undefined &&
              filters.maxDistance !== 500) ||
            (filters.giftValueRange &&
              (filters.giftValueRange[0] !== 0 ||
                filters.giftValueRange[1] !== 999999)) ||
            filters.location !== undefined ||
            filters.showExclusiveMoments === true
          );
        },

        // Sort
        sortBy: 'recent',
        setSortBy: (sortBy: SortOption) =>
          set({ sortBy }, false, 'search/setSortBy'),

        // Recent searches (alias for history)
        get recentSearches() {
          return get().searchHistory;
        },

        // Filter version for triggering re-fetch
        filterVersion: 0,
        incrementFilterVersion: () => {
          set(
            (state) => ({ filterVersion: state.filterVersion + 1 }),
            false,
            'search/incrementFilterVersion',
          );
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
