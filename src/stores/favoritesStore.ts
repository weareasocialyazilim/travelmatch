/**
 * Favorites Store
 * Favori moments ve bookmarks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  // State
  favoriteIds: string[];

  // Actions
  addFavorite: (momentId: string) => void;
  removeFavorite: (momentId: string) => void;
  isFavorite: (momentId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial State
      favoriteIds: [],

      // Add Favorite
      addFavorite: (momentId) =>
        set((state) => ({
          favoriteIds: [...state.favoriteIds, momentId],
        })),

      // Remove Favorite
      removeFavorite: (momentId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== momentId),
        })),

      // Check if Favorite
      isFavorite: (momentId) => {
        return get().favoriteIds.includes(momentId);
      },

      // Clear All
      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
