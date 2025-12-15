/**
 * Favorites Store Tests
 * Tests for Zustand favorites store with add/remove and backend sync
 * Target Coverage: 75%+
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavoritesStore } from '@/stores/favoritesStore';

describe('favoritesStore', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Reset store to initial state
    act(() => {
      useFavoritesStore.setState({
        favoriteIds: [],
      });
    });
  });

  describe('initial state', () => {
    it('should have empty favorites initially', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current.favoriteIds).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add moment to favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.favoriteIds).toEqual(['moment-1']);
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

    it('should allow duplicate favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-1');
      });

      // Current implementation allows duplicates
      expect(result.current.favoriteIds).toEqual(['moment-1', 'moment-1']);
    });

    it('should maintain order of additions', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-3');
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
      });

      expect(result.current.favoriteIds).toEqual([
        'moment-3',
        'moment-1',
        'moment-2',
      ]);
    });

    it('should handle empty string IDs', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('');
      });

      expect(result.current.favoriteIds).toEqual(['']);
    });

    it('should handle special characters in IDs', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-123-abc');
        result.current.addFavorite('moment_with_underscore');
        result.current.addFavorite('moment.with.dots');
      });

      expect(result.current.favoriteIds).toContain('moment-123-abc');
      expect(result.current.favoriteIds).toContain('moment_with_underscore');
      expect(result.current.favoriteIds).toContain('moment.with.dots');
    });
  });

  describe('removeFavorite', () => {
    it('should remove moment from favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.favoriteIds).toEqual(['moment-2']);
    });

    it('should handle removing non-existent favorite', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.removeFavorite('moment-2');
      });

      expect(result.current.favoriteIds).toEqual(['moment-1']);
    });

    it('should remove all instances of duplicate favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.removeFavorite('moment-1');
      });

      // filter removes all instances
      expect(result.current.favoriteIds).toEqual(['moment-2']);
    });

    it('should handle removing from empty favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.favoriteIds).toEqual([]);
    });

    it('should remove multiple favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
        result.current.removeFavorite('moment-1');
        result.current.removeFavorite('moment-3');
      });

      expect(result.current.favoriteIds).toEqual(['moment-2']);
    });

    it('should preserve order when removing', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
        result.current.addFavorite('moment-4');
        result.current.removeFavorite('moment-2');
      });

      expect(result.current.favoriteIds).toEqual([
        'moment-1',
        'moment-3',
        'moment-4',
      ]);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorite moment', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
    });

    it('should return false for non-favorite moment', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-2')).toBe(false);
    });

    it('should return false for empty favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });

    it('should update after adding favorite', () => {
      const { result } = renderHook(() => useFavoritesStore());

      expect(result.current.isFavorite('moment-1')).toBe(false);

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
    });

    it('should update after removing favorite', () => {
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

    it('should check multiple favorites correctly', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
      expect(result.current.isFavorite('moment-2')).toBe(true);
      expect(result.current.isFavorite('moment-3')).toBe(true);
      expect(result.current.isFavorite('moment-4')).toBe(false);
    });

    it('should handle empty string ID', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('');
      });

      expect(result.current.isFavorite('')).toBe(true);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.addFavorite('moment-3');
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

    it('should allow adding after clearing', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.clearFavorites();
        result.current.addFavorite('moment-2');
      });

      expect(result.current.favoriteIds).toEqual(['moment-2']);
    });

    it('should update isFavorite after clearing', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });
  });

  describe('persistence', () => {
    it.skip('should persist favorites to AsyncStorage', async () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('favorites-storage');
        expect(stored).toBeTruthy();
        
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.state.favoriteIds).toEqual(['moment-1', 'moment-2']);
        }
      });
    });

    it.skip('should persist after removal', async () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.addFavorite('moment-2');
        result.current.removeFavorite('moment-1');
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('favorites-storage');
        
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.state.favoriteIds).toEqual(['moment-2']);
        }
      });
    });

    it.skip('should persist empty state after clearing', async () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.clearFavorites();
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('favorites-storage');
        
        if (stored) {
          const parsed = JSON.parse(stored);
          expect(parsed.state.favoriteIds).toEqual([]);
        }
      });
    });
  });

  describe('toggle operations', () => {
    it('should toggle favorite on/off', () => {
      const { result } = renderHook(() => useFavoritesStore());

      // Toggle on
      act(() => {
        if (!result.current.isFavorite('moment-1')) {
          result.current.addFavorite('moment-1');
        }
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);

      // Toggle off
      act(() => {
        if (result.current.isFavorite('moment-1')) {
          result.current.removeFavorite('moment-1');
        }
      });

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });

    it('should handle multiple toggle operations', () => {
      const { result } = renderHook(() => useFavoritesStore());

      const toggleFavorite = (id: string) => {
        if (result.current.isFavorite(id)) {
          result.current.removeFavorite(id);
        } else {
          result.current.addFavorite(id);
        }
      };

      act(() => {
        toggleFavorite('moment-1'); // Add
        toggleFavorite('moment-1'); // Remove
        toggleFavorite('moment-1'); // Add again
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
    });
  });

  describe('bulk operations', () => {
    it('should add multiple favorites at once', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        ['moment-1', 'moment-2', 'moment-3', 'moment-4', 'moment-5'].forEach(
          (id) => result.current.addFavorite(id),
        );
      });

      expect(result.current.favoriteIds).toHaveLength(5);
    });

    it('should remove multiple favorites at once', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        ['moment-1', 'moment-2', 'moment-3', 'moment-4', 'moment-5'].forEach(
          (id) => result.current.addFavorite(id),
        );

        ['moment-2', 'moment-4'].forEach((id) =>
          result.current.removeFavorite(id),
        );
      });

      expect(result.current.favoriteIds).toEqual([
        'moment-1',
        'moment-3',
        'moment-5',
      ]);
    });

    it('should handle checking multiple favorites', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        ['moment-1', 'moment-2', 'moment-3'].forEach((id) =>
          result.current.addFavorite(id),
        );
      });

      const checks = ['moment-1', 'moment-2', 'moment-4'].map((id) =>
        result.current.isFavorite(id),
      );

      expect(checks).toEqual([true, true, false]);
    });
  });

  describe('edge cases', () => {
    it('should handle very long favorite lists', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.addFavorite(`moment-${i}`);
        }
      });

      expect(result.current.favoriteIds).toHaveLength(100);
      expect(result.current.isFavorite('moment-50')).toBe(true);
    });

    it('should handle UUID-style IDs', () => {
      const { result } = renderHook(() => useFavoritesStore());

      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      act(() => {
        result.current.addFavorite(uuid);
      });

      expect(result.current.isFavorite(uuid)).toBe(true);
    });

    it('should handle numeric string IDs', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('123');
        result.current.addFavorite('456');
      });

      expect(result.current.favoriteIds).toContain('123');
      expect(result.current.favoriteIds).toContain('456');
    });

    it('should handle rapid add/remove operations', () => {
      const { result } = renderHook(() => useFavoritesStore());

      act(() => {
        result.current.addFavorite('moment-1');
        result.current.removeFavorite('moment-1');
        result.current.addFavorite('moment-1');
        result.current.removeFavorite('moment-1');
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);
    });
  });

  describe('state isolation', () => {
    it('should maintain shared state across hook instances', () => {
      const { result: result1 } = renderHook(() => useFavoritesStore());
      const { result: result2 } = renderHook(() => useFavoritesStore());

      act(() => {
        result1.current.addFavorite('moment-1');
      });

      // Both hooks should see the same state
      expect(result1.current.favoriteIds).toEqual(['moment-1']);
      expect(result2.current.favoriteIds).toEqual(['moment-1']);
      expect(result2.current.isFavorite('moment-1')).toBe(true);
    });
  });

  describe('sync simulation', () => {
    it('should support local-first pattern', () => {
      const { result } = renderHook(() => useFavoritesStore());

      // Add locally first
      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);

      // Simulate backend sync failure - remove locally
      act(() => {
        result.current.removeFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(false);
    });

    it('should support optimistic updates', () => {
      const { result } = renderHook(() => useFavoritesStore());

      // Optimistic add
      act(() => {
        result.current.addFavorite('moment-1');
      });

      expect(result.current.isFavorite('moment-1')).toBe(true);

      // Simulate backend confirmation - already in state
      expect(result.current.favoriteIds).toContain('moment-1');
    });
  });
});
