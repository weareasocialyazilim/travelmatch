/**
 * Favorites Store
 * Favori moments ve bookmarks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

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
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        favoriteIds: [] as string[],

        // Add Favorite
        addFavorite: (momentId) =>
          set(
            (state) => ({
              favoriteIds: [...state.favoriteIds, momentId],
            }),
            false,
            'favorites/add',
          ),

        // Remove Favorite
        removeFavorite: (momentId) =>
          set(
            (state) => ({
              favoriteIds: state.favoriteIds.filter((id) => id !== momentId),
            }),
            false,
            'favorites/remove',
          ),

        // Check if Favorite
        isFavorite: (momentId) => {
          return get().favoriteIds.includes(momentId);
        },

        // Clear All
        clearFavorites: () =>
          set({ favoriteIds: [] }, false, 'favorites/clear'),
      }),
      {
        name: 'favorites-storage',
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
    {
      name: 'FavoritesStore',
      enabled: __DEV__,
    },
  ),
);
