/**
 * Search Store Tests
 * Testing search history, filters, and sort options
 */

import { act, renderHook } from '@testing-library/react-native';
import { useSearchStore } from '../searchStore';
import type { SearchFilters, SortOption } from '../searchStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('searchStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useSearchStore.setState({
        searchHistory: [],
        currentQuery: '',
        filters: {},
        sortBy: 'recent',
      });
    });
  });

  describe('initial state', () => {
    it('should have empty search history', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.searchHistory).toEqual([]);
    });

    it('should have empty current query', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.currentQuery).toBe('');
    });

    it('should have empty filters', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.filters).toEqual({});
    });

    it('should have default sort as recent', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.sortBy).toBe('recent');
    });
  });

  describe('search history', () => {
    describe('addToHistory', () => {
      it('should add query to history', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('coffee in paris');
        });

        expect(result.current.searchHistory).toContain('coffee in paris');
      });

      it('should add new queries to the beginning', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('first');
          result.current.addToHistory('second');
        });

        expect(result.current.searchHistory[0]).toBe('second');
        expect(result.current.searchHistory[1]).toBe('first');
      });

      it('should not add empty queries', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('');
          result.current.addToHistory('   ');
        });

        expect(result.current.searchHistory).toEqual([]);
      });

      it('should limit history to 10 items', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          for (let i = 1; i <= 15; i++) {
            result.current.addToHistory(`query-${i}`);
          }
        });

        expect(result.current.searchHistory.length).toBe(10);
      });

      it('should move duplicate to top instead of adding again', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('first');
          result.current.addToHistory('second');
          result.current.addToHistory('first');
        });

        expect(result.current.searchHistory[0]).toBe('first');
        expect(result.current.searchHistory.length).toBe(2);
      });
    });

    describe('removeFromHistory', () => {
      it('should remove query from history', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('first');
          result.current.addToHistory('second');
        });

        act(() => {
          result.current.removeFromHistory('first');
        });

        expect(result.current.searchHistory).not.toContain('first');
        expect(result.current.searchHistory).toContain('second');
      });

      it('should handle removing non-existent query', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('first');
        });

        act(() => {
          result.current.removeFromHistory('non-existent');
        });

        expect(result.current.searchHistory).toEqual(['first']);
      });
    });

    describe('clearHistory', () => {
      it('should clear all history', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.addToHistory('first');
          result.current.addToHistory('second');
        });

        act(() => {
          result.current.clearHistory();
        });

        expect(result.current.searchHistory).toEqual([]);
      });
    });
  });

  describe('current query', () => {
    it('should set current query', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setCurrentQuery('test query');
      });

      expect(result.current.currentQuery).toBe('test query');
    });

    it('should clear current query', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setCurrentQuery('test query');
        result.current.setCurrentQuery('');
      });

      expect(result.current.currentQuery).toBe('');
    });
  });

  describe('filters', () => {
    describe('setFilters', () => {
      it('should set filters', () => {
        const { result } = renderHook(() => useSearchStore());

        const filters: SearchFilters = {
          category: 'food',
          minPrice: 10,
          maxPrice: 50,
        };

        act(() => {
          result.current.setFilters(filters);
        });

        expect(result.current.filters).toEqual(filters);
      });

      it('should replace existing filters', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({ category: 'food' });
        });

        act(() => {
          result.current.setFilters({ location: 'Paris' });
        });

        expect(result.current.filters).toEqual({ location: 'Paris' });
      });
    });

    describe('removeFilter', () => {
      it('should remove specific filter', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({
            category: 'food',
            minPrice: 10,
            maxPrice: 50,
          });
        });

        act(() => {
          result.current.removeFilter('minPrice');
        });

        expect(result.current.filters).toEqual({
          category: 'food',
          maxPrice: 50,
        });
      });

      it('should handle removing non-existent filter', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({ category: 'food' });
        });

        act(() => {
          result.current.removeFilter('minPrice');
        });

        expect(result.current.filters).toEqual({ category: 'food' });
      });
    });

    describe('clearFilters', () => {
      it('should clear all filters', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({
            category: 'food',
            minPrice: 10,
            maxPrice: 50,
          });
        });

        act(() => {
          result.current.clearFilters();
        });

        expect(result.current.filters).toEqual({});
      });
    });

    describe('hasActiveFilters', () => {
      it('should return false when no filters', () => {
        const { result } = renderHook(() => useSearchStore());
        expect(result.current.hasActiveFilters()).toBe(false);
      });

      it('should return true when filters exist', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({ category: 'food' });
        });

        expect(result.current.hasActiveFilters()).toBe(true);
      });

      it('should return false after clearing filters', () => {
        const { result } = renderHook(() => useSearchStore());

        act(() => {
          result.current.setFilters({ category: 'food' });
        });

        act(() => {
          result.current.clearFilters();
        });

        expect(result.current.hasActiveFilters()).toBe(false);
      });
    });
  });

  describe('sort', () => {
    it('should set sort by option', () => {
      const { result } = renderHook(() => useSearchStore());

      const sortOptions: SortOption[] = [
        'recent',
        'popular',
        'price-low',
        'price-high',
        'rating',
      ];

      sortOptions.forEach((option) => {
        act(() => {
          result.current.setSortBy(option);
        });
        expect(result.current.sortBy).toBe(option);
      });
    });
  });

  describe('state persistence shape', () => {
    it('should have all required state properties', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current).toHaveProperty('searchHistory');
      expect(result.current).toHaveProperty('currentQuery');
      expect(result.current).toHaveProperty('filters');
      expect(result.current).toHaveProperty('sortBy');
    });

    it('should have all required action functions', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(typeof result.current.addToHistory).toBe('function');
      expect(typeof result.current.removeFromHistory).toBe('function');
      expect(typeof result.current.clearHistory).toBe('function');
      expect(typeof result.current.setCurrentQuery).toBe('function');
      expect(typeof result.current.setFilters).toBe('function');
      expect(typeof result.current.clearFilters).toBe('function');
      expect(typeof result.current.removeFilter).toBe('function');
      expect(typeof result.current.hasActiveFilters).toBe('function');
      expect(typeof result.current.setSortBy).toBe('function');
    });
  });
});
