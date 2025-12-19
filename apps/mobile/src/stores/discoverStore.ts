/**
 * Discover Store
 * Manages all state for the Discover screen
 *
 * @note Uses MMKV - 10-20x faster than AsyncStorage
 * @security Filter preferences are persisted, UI state is not
 *
 * Performance Benefits:
 * - Reduces re-renders by separating state domains
 * - Eliminates prop drilling
 * - Provides fine-grained subscriptions
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '../utils/storage';
import type { ViewMode, UserStory, PriceRange } from '@/components/discover/types';

interface DiscoverState {
  // ========== UI State (not persisted) ==========
  viewMode: ViewMode;
  refreshing: boolean;

  // Modal State
  showFilterModal: boolean;
  showLocationModal: boolean;
  showStoryViewer: boolean;

  // Story Viewer State
  selectedStoryUser: UserStory | null;
  currentStoryIndex: number;
  currentUserIndex: number;
  isPaused: boolean;

  // ========== Filter State (persisted) ==========
  selectedCategory: string;
  sortBy: string;
  maxDistance: number;
  priceRange: PriceRange;

  // Location State (persisted)
  selectedLocation: string;
  recentLocations: string[];

  // ========== UI Actions ==========
  setViewMode: (mode: ViewMode) => void;
  setRefreshing: (value: boolean) => void;

  // Modal Actions
  openFilterModal: () => void;
  closeFilterModal: () => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;

  // Story Viewer Actions
  openStoryViewer: (user: UserStory, userIndex: number) => void;
  closeStoryViewer: () => void;
  setCurrentStoryIndex: (index: number) => void;
  setCurrentUserIndex: (index: number) => void;
  setSelectedStoryUser: (user: UserStory | null) => void;
  setIsPaused: (value: boolean) => void;

  // ========== Filter Actions ==========
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: string) => void;
  setMaxDistance: (distance: number) => void;
  setPriceRange: (range: PriceRange) => void;
  resetFilters: () => void;

  // Location Actions
  setSelectedLocation: (location: string) => void;
  addRecentLocation: (location: string) => void;

  // ========== Computed ==========
  getActiveFilterCount: () => number;
}

// Default values
const DEFAULT_CATEGORY = 'all';
const DEFAULT_SORT = 'nearest';
const DEFAULT_MAX_DISTANCE = 50;
const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 500 };
const DEFAULT_LOCATION = 'San Francisco, CA';
const DEFAULT_RECENT_LOCATIONS = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL'];

export const useDiscoverStore = create<DiscoverState>()(
  devtools(
    persist(
      (set, get) => ({
        // ========== Initial State ==========
        // UI State (not persisted)
        viewMode: 'single',
        refreshing: false,

        // Modal State
        showFilterModal: false,
        showLocationModal: false,
        showStoryViewer: false,

        // Story Viewer State
        selectedStoryUser: null,
        currentStoryIndex: 0,
        currentUserIndex: 0,
        isPaused: false,

        // Filter State (persisted)
        selectedCategory: DEFAULT_CATEGORY,
        sortBy: DEFAULT_SORT,
        maxDistance: DEFAULT_MAX_DISTANCE,
        priceRange: DEFAULT_PRICE_RANGE,

        // Location State (persisted)
        selectedLocation: DEFAULT_LOCATION,
        recentLocations: DEFAULT_RECENT_LOCATIONS,

        // ========== UI Actions ==========
        setViewMode: (mode) =>
          set({ viewMode: mode }, false, 'discover/setViewMode'),

        setRefreshing: (value) =>
          set({ refreshing: value }, false, 'discover/setRefreshing'),

        // Modal Actions
        openFilterModal: () =>
          set({ showFilterModal: true }, false, 'discover/openFilterModal'),

        closeFilterModal: () =>
          set({ showFilterModal: false }, false, 'discover/closeFilterModal'),

        openLocationModal: () =>
          set({ showLocationModal: true }, false, 'discover/openLocationModal'),

        closeLocationModal: () =>
          set({ showLocationModal: false }, false, 'discover/closeLocationModal'),

        // Story Viewer Actions
        openStoryViewer: (user, userIndex) =>
          set(
            {
              showStoryViewer: true,
              selectedStoryUser: user,
              currentUserIndex: userIndex,
              currentStoryIndex: 0,
              isPaused: false,
            },
            false,
            'discover/openStoryViewer',
          ),

        closeStoryViewer: () =>
          set(
            {
              showStoryViewer: false,
              selectedStoryUser: null,
              currentStoryIndex: 0,
              currentUserIndex: 0,
              isPaused: false,
            },
            false,
            'discover/closeStoryViewer',
          ),

        setCurrentStoryIndex: (index) =>
          set({ currentStoryIndex: index }, false, 'discover/setCurrentStoryIndex'),

        setCurrentUserIndex: (index) =>
          set({ currentUserIndex: index }, false, 'discover/setCurrentUserIndex'),

        setSelectedStoryUser: (user) =>
          set({ selectedStoryUser: user }, false, 'discover/setSelectedStoryUser'),

        setIsPaused: (value) =>
          set({ isPaused: value }, false, 'discover/setIsPaused'),

        // ========== Filter Actions ==========
        setSelectedCategory: (category) =>
          set({ selectedCategory: category }, false, 'discover/setSelectedCategory'),

        setSortBy: (sort) =>
          set({ sortBy: sort }, false, 'discover/setSortBy'),

        setMaxDistance: (distance) =>
          set({ maxDistance: distance }, false, 'discover/setMaxDistance'),

        setPriceRange: (range) =>
          set({ priceRange: range }, false, 'discover/setPriceRange'),

        resetFilters: () =>
          set(
            {
              selectedCategory: DEFAULT_CATEGORY,
              sortBy: DEFAULT_SORT,
              maxDistance: DEFAULT_MAX_DISTANCE,
              priceRange: DEFAULT_PRICE_RANGE,
            },
            false,
            'discover/resetFilters',
          ),

        // Location Actions
        setSelectedLocation: (location) =>
          set({ selectedLocation: location }, false, 'discover/setSelectedLocation'),

        addRecentLocation: (location) =>
          set((state) => {
            const currentLocation = state.selectedLocation;
            // Add current location to recent if it's different from new location and not already in recents
            if (currentLocation !== location && !state.recentLocations.includes(currentLocation)) {
              return {
                selectedLocation: location,
                recentLocations: [currentLocation, ...state.recentLocations.slice(0, 2)],
              };
            }
            return { selectedLocation: location };
          }, false, 'discover/addRecentLocation'),

        // ========== Computed ==========
        getActiveFilterCount: () => {
          const state = get();
          let count = 0;
          if (state.selectedCategory !== DEFAULT_CATEGORY) count++;
          if (state.sortBy !== DEFAULT_SORT) count++;
          if (state.maxDistance !== DEFAULT_MAX_DISTANCE) count++;
          if (state.priceRange.min !== DEFAULT_PRICE_RANGE.min ||
              state.priceRange.max !== DEFAULT_PRICE_RANGE.max) count++;
          return count;
        },
      }),
      {
        name: 'discover-storage',
        storage: createJSONStorage(() => Storage),
        // Only persist filter and location preferences
        partialize: (state) => ({
          selectedCategory: state.selectedCategory,
          sortBy: state.sortBy,
          maxDistance: state.maxDistance,
          priceRange: state.priceRange,
          selectedLocation: state.selectedLocation,
          recentLocations: state.recentLocations,
        }),
      },
    ),
    {
      name: 'DiscoverStore',
      enabled: __DEV__,
    },
  ),
);
