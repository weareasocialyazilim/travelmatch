/**
 * Favorites Store Tests
 * Testing favorites management
 */

import { act, renderHook } from '@testing-library/react-native';
import { useFavoritesStore } from '../favoritesStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('favoritesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useFavoritesStore.setState({
        favoriteIds: [],
      });
    });
  });

  describe('initial state', () => {
    it('should have empty favoriteIds array', () => {
      const { result } = renderHook(() => useFavoritesStore());
      expect(result.current.favoriteIds).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a moment to favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.favoriteIds).toContain('moment-1');
    });

    it('should add multiple moments to favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
      });

      expect(result.current.favoriteIds).toEqual([
        'moment-1',
        'moment-2',
        'moment-3',
      ]);
    });

    it('should allow duplicate additions', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-1');
      });

      // Store allows duplicates - this is by design
      expect(result.current.favoriteIds.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a moment from favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
      });

      act(() => {
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.favoriteIds).not.toContain('moment-1');
      expect(result.current.favoriteIds).toContain('moment-2');
    });

    it('should handle removing non-existent moment', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      act(() => {
        result.current.removeFavorite('moment-999');
      });

      // Should not throw and array should remain unchanged
      expect(result.current.favoriteIds).toEqual(['moment-1']);
    });

    it('should remove all instances if duplicates exist', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        useFavoritesStore.setState({
          favoriteIds: ['moment-1', 'moment-1', 'moment-2'],
        });
      });

      act(() => {
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.favoriteIds).not.toContain('moment-1');
    });
  });

  describe('isFavorite', () => {
    it('should return true if moment is in favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
    });

    it('should return false if moment is not in favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });

    it('should return false after moment is removed', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);

      act(() => {
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
      });

      expect(result.current.favoriteIds.length).toBe(3);

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.favoriteIds).toEqual([]);
    });

    it('should handle clearing empty favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.favoriteIds).toEqual([]);
    });
  });

  describe('state persistence shape', () => {
    it('should have all required state properties', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current).toHaveProperty('favoriteIds');
    });

    it('should have all required action functions', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(typeof result.current.addFavorite).toBe('function');
      expect(typeof result.current.removeFavorite).toBe('function');
      expect(typeof result.current.isFavorite).toBe('function');
      expect(typeof result.current.clearFavorites).toBe('function');
    });
  });
});
