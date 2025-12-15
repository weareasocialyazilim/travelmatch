/**
 * Discover Flow Integration Tests
 * Tests the complete discovery flow from filtering to viewing moments
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, mockMoment, mockFilter } from '../testUtils';

// Mock dependencies
jest.mock('../../hooks/useMoments');
jest.mock('../../services/supabaseDbService');

describe('Discover Flow Integration', () => {
  const mockMoments = [
    mockMoment({ id: 'moment-1', title: 'Beach Adventure', category: 'adventure', price: 50 }),
    mockMoment({ id: 'moment-2', title: 'City Tour', category: 'cultural', price: 30 }),
    mockMoment({ id: 'moment-3', title: 'Mountain Hike', category: 'adventure', price: 70 }),
  ];

  const mockUseMoments = {
    moments: mockMoments,
    loading: false,
    error: null,
    filters: mockFilter(),
    setFilters: jest.fn(),
    refresh: jest.fn(),
    loadMore: jest.fn(),
    hasMore: true,
  };

  beforeEach(() => {
    const useMoments = require('../../hooks/useMoments').useMoments;
    (useMoments ).mockReturnValue(mockUseMoments);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('displays all moments on initial load', () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      expect(getByText('Beach Adventure')).toBeTruthy();
      expect(getByText('City Tour')).toBeTruthy();
      expect(getByText('Mountain Hike')).toBeTruthy();
    });

    it('shows loading state during initial fetch', () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments ).mockReturnValue({
        ...mockUseMoments,
        loading: true,
        moments: [],
      });

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('shows error state when fetch fails', () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments ).mockReturnValue({
        ...mockUseMoments,
        loading: false,
        error: 'Failed to load moments',
        moments: [],
      });

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      expect(getByText(/failed/i)).toBeTruthy();
    });

    it('shows empty state when no moments available', () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments ).mockReturnValue({
        ...mockUseMoments,
        moments: [],
      });

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      expect(getByText(/no moments/i)).toBeTruthy();
    });
  });

  describe('Filtering', () => {
    it('filters moments by category', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText, queryByText } = render(<DiscoverScreen />);

      // Open filter
      fireEvent.press(getByText('Filter'));

      // Select adventure category
      fireEvent.press(getByText('Adventure'));

      // Apply filter
      fireEvent.press(getByText('Apply'));

      await waitFor(() => {
        expect(mockUseMoments.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({ category: 'adventure' })
        );
      });
    });

    it('filters moments by price range', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText, getByPlaceholderText } = render(<DiscoverScreen />);

      fireEvent.press(getByText('Filter'));

      const minPrice = getByPlaceholderText('Min price');
      const maxPrice = getByPlaceholderText('Max price');

      fireEvent.changeText(minPrice, '40');
      fireEvent.changeText(maxPrice, '80');

      fireEvent.press(getByText('Apply'));

      await waitFor(() => {
        expect(mockUseMoments.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({ 
            minPrice: 40,
            maxPrice: 80,
          })
        );
      });
    });

    it('clears filters', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      fireEvent.press(getByText('Filter'));
      fireEvent.press(getByText('Clear All'));

      await waitFor(() => {
        expect(mockUseMoments.setFilters).toHaveBeenCalledWith(
          mockFilter()
        );
      });
    });
  });

  describe('Pagination', () => {
    it('loads more moments on scroll', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      const flatList = getByTestId('moments-list');
      
      fireEvent.scroll(flatList, {
        nativeEvent: {
          contentOffset: { y: 500 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 600 },
        },
      });

      await waitFor(() => {
        expect(mockUseMoments.loadMore).toHaveBeenCalled();
      });
    });

    it('does not load more when hasMore is false', async () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments ).mockReturnValue({
        ...mockUseMoments,
        hasMore: false,
      });

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      const flatList = getByTestId('moments-list');
      
      fireEvent.scroll(flatList, {
        nativeEvent: {
          contentOffset: { y: 500 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 600 },
        },
      });

      await waitFor(() => {
        expect(mockUseMoments.loadMore).not.toHaveBeenCalled();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('refreshes moments on pull down', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      const flatList = getByTestId('moments-list');
      
      fireEvent(flatList, 'refresh');

      await waitFor(() => {
        expect(mockUseMoments.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('Moment Navigation', () => {
    it('navigates to moment detail on card press', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(
        <DiscoverScreen navigation={mockNavigation} />
      );

      fireEvent.press(getByText('Beach Adventure'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        'MomentDetail',
        expect.objectContaining({
          moment: expect.objectContaining({ id: 'moment-1' }),
        })
      );
    });
  });

  describe('View Toggle', () => {
    it('switches between list and grid view', () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      const viewToggle = getByTestId('view-toggle');
      
      // Start in list view
      expect(getByTestId('list-view')).toBeTruthy();

      // Switch to grid view
      fireEvent.press(viewToggle);
      expect(getByTestId('grid-view')).toBeTruthy();

      // Switch back to list view
      fireEvent.press(viewToggle);
      expect(getByTestId('list-view')).toBeTruthy();
    });
  });

  describe('Search Integration', () => {
    it('searches moments by keyword', async () => {
      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByPlaceholderText } = render(<DiscoverScreen />);

      const searchInput = getByPlaceholderText('Search moments...');
      
      fireEvent.changeText(searchInput, 'beach');

      await waitFor(() => {
        expect(mockUseMoments.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({ 
            search: 'beach',
          })
        );
      }, { timeout: 500 }); // Debounce delay
    });

    it('debounces search input', async () => {
      jest.useFakeTimers();

      const DiscoverScreen = require('../../features/trips/screens/DiscoverScreen').default;
      const { getByPlaceholderText } = render(<DiscoverScreen />);

      const searchInput = getByPlaceholderText('Search moments...');
      
      fireEvent.changeText(searchInput, 'b');
      fireEvent.changeText(searchInput, 'be');
      fireEvent.changeText(searchInput, 'bea');
      fireEvent.changeText(searchInput, 'beac');
      fireEvent.changeText(searchInput, 'beach');

      // Should not call setFilters yet
      expect(mockUseMoments.setFilters).not.toHaveBeenCalled();

      // Fast-forward debounce delay
      jest.advanceTimersByTime(300);

      // Should call setFilters once with final value
      expect(mockUseMoments.setFilters).toHaveBeenCalledTimes(1);
      expect(mockUseMoments.setFilters).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'beach' })
      );

      jest.useRealTimers();
    });
  });
});
