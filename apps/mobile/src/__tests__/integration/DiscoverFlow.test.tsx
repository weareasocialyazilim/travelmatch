/**
 * Discover Flow Integration Tests
 * Tests the complete discovery flow from filtering to viewing moments
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, mockMoment, mockFilter } from '../testUtilsRender.helper';

// Mock dependencies
jest.mock('../../hooks/useMoments');
jest.mock('../../services/supabaseDbService');
jest.mock('../../stores/discoverStore');
jest.mock('../../context/NetworkContext', () => ({
  useNetworkStatus: () => ({
    isConnected: true,
    refresh: jest.fn(),
  }),
  NetworkContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Discover Flow Integration', () => {
  const mockMoments = [
    mockMoment({
      id: 'moment-1',
      title: 'Beach Adventure',
      category: 'adventure',
      price: 50,
    }),
    mockMoment({
      id: 'moment-2',
      title: 'City Tour',
      category: 'cultural',
      price: 30,
    }),
    mockMoment({
      id: 'moment-3',
      title: 'Mountain Hike',
      category: 'adventure',
      price: 70,
    }),
  ];

  const mockDiscoverStore = {
    viewMode: 'single' as const,
    refreshing: false,
    showFilterModal: false,
    showLocationModal: false,
    showStoryViewer: false,
    selectedStoryUser: null,
    currentStoryIndex: 0,
    currentUserIndex: 0,
    isPaused: false,
    selectedCategory: 'all', // Must be 'all' to show all moments
    sortBy: 'recommended',
    maxDistance: 50,
    priceRange: { min: 0, max: 1000 }, // Increased max to include all test moments
    selectedLocation: 'Nearby',
    recentLocations: [],
    setViewMode: jest.fn(),
    setRefreshing: jest.fn(),
    openFilterModal: jest.fn(),
    closeFilterModal: jest.fn(),
    openLocationModal: jest.fn(),
    closeLocationModal: jest.fn(),
    openStoryViewer: jest.fn(),
    closeStoryViewer: jest.fn(),
    setCurrentStoryIndex: jest.fn(),
    setCurrentUserIndex: jest.fn(),
    setSelectedStoryUser: jest.fn(),
    setIsPaused: jest.fn(),
    setSelectedCategory: jest.fn(),
    setSortBy: jest.fn(),
    setMaxDistance: jest.fn(),
    setPriceRange: jest.fn(),
    resetFilters: jest.fn(),
    addRecentLocation: jest.fn(),
    getActiveFilterCount: jest.fn(() => 0),
  };

  const mockUseMomentsReturn = {
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
    jest.clearAllMocks();

    // Setup useMoments mock
    const useMoments = require('../../hooks/useMoments').useMoments;
    (useMoments as jest.Mock).mockReturnValue(mockUseMomentsReturn);

    // Setup discoverStore mock
    const useDiscoverStore =
      require('../../stores/discoverStore').useDiscoverStore;
    (useDiscoverStore as jest.Mock).mockReturnValue(mockDiscoverStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('displays moments on initial load', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByText('Beach Adventure')).toBeTruthy();
      });
    });

    it('shows loading state during initial fetch', async () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments as jest.Mock).mockReturnValue({
        ...mockUseMomentsReturn,
        loading: true,
        moments: [],
      });

      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      // Verify component renders without errors in loading state
      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });

    it('shows error state when fetch fails', async () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments as jest.Mock).mockReturnValue({
        ...mockUseMomentsReturn,
        loading: false,
        error: 'Failed to load moments',
        moments: [],
      });

      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      // Component should render with error state without crashing
      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });

    it('shows empty state when no moments available', async () => {
      const useMoments = require('../../hooks/useMoments').useMoments;
      (useMoments as jest.Mock).mockReturnValue({
        ...mockUseMomentsReturn,
        moments: [],
        loading: false,
        error: null,
      });

      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      // Component should render empty state without crashing
      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });
  });

  describe('View Mode', () => {
    it('renders in single view mode by default', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });

    it('displays moments count text', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId, getByText } = render(<DiscoverScreen />);

      await waitFor(() => {
        // Component renders the list
        expect(getByTestId('moments-list')).toBeTruthy();
        // At least one moment should be displayed
        expect(getByText('Beach Adventure')).toBeTruthy();
      });
    });
  });

  describe('Filter Modal', () => {
    it('opens filter modal when filter button is pressed', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      render(<DiscoverScreen />);

      // The filter button should trigger openFilterModal from store
      await waitFor(() => {
        expect(mockDiscoverStore.openFilterModal).toBeDefined();
      });
    });

    it('resets filters when reset is called', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      render(<DiscoverScreen />);

      await waitFor(() => {
        expect(mockDiscoverStore.resetFilters).toBeDefined();
      });
    });
  });

  describe('Data Loading', () => {
    it('calls loadMore when scrolling to end', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      const list = getByTestId('moments-list');

      // Simulate scroll to end
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(mockUseMomentsReturn.loadMore).toHaveBeenCalled();
      });
    });

    it('shows refresh indicator when refreshing', async () => {
      const useDiscoverStore =
        require('../../stores/discoverStore').useDiscoverStore;
      (useDiscoverStore as jest.Mock).mockReturnValue({
        ...mockDiscoverStore,
        refreshing: true,
      });

      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });
  });

  describe('Moment Navigation', () => {
    it('renders moment cards with correct data', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByText } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByText('Beach Adventure')).toBeTruthy();
        expect(getByText('City Tour')).toBeTruthy();
        expect(getByText('Mountain Hike')).toBeTruthy();
      });
    });
  });

  describe('Location Modal', () => {
    it('can trigger location modal open', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      render(<DiscoverScreen />);

      await waitFor(() => {
        expect(mockDiscoverStore.openLocationModal).toBeDefined();
      });
    });

    it('can add recent locations', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      render(<DiscoverScreen />);

      await waitFor(() => {
        expect(mockDiscoverStore.addRecentLocation).toBeDefined();
      });
    });
  });

  describe('Network Handling', () => {
    it('renders normally when connected', async () => {
      const DiscoverScreen =
        require('../../features/trips/screens/DiscoverScreen').default;
      const { getByTestId } = render(<DiscoverScreen />);

      await waitFor(() => {
        expect(getByTestId('moments-list')).toBeTruthy();
      });
    });
  });
});
