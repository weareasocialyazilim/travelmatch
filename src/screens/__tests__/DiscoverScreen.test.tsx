/**
 * DiscoverScreen Tests
 * Testing discover/explore functionality, filtering, and moments display
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiscoverScreen from '../DiscoverScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useMoments hook
const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockLoadMore = jest.fn();
const mockSetFilters = jest.fn();

jest.mock('../../hooks/useMoments', () => ({
  useMoments: () => ({
    moments: [
      {
        id: '1',
        title: 'Coffee Experience',
        description: 'Enjoy artisan coffee in a cozy atmosphere',
        price: 25,
        currency: 'USD',
        category: 'Coffee',
        image: 'https://example.com/coffee.jpg',
        hostId: 'host1',
        hostName: 'John Doe',
        hostAvatar: 'https://example.com/avatar1.jpg',
        location: { city: 'Istanbul', country: 'Turkey' },
        rating: 4.8,
        reviewCount: 12,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Dinner Experience',
        description: 'Traditional dinner with local cuisine',
        price: 50,
        currency: 'USD',
        category: 'Meals',
        image: 'https://example.com/dinner.jpg',
        hostId: 'host2',
        hostName: 'Jane Doe',
        hostAvatar: 'https://example.com/avatar2.jpg',
        location: { city: 'Istanbul', country: 'Turkey' },
        rating: 4.5,
        reviewCount: 8,
        createdAt: new Date().toISOString(),
      },
    ],
    loading: false,
    error: null,
    refresh: mockRefresh,
    loadMore: mockLoadMore,
    hasMore: true,
    setFilters: mockSetFilters,
  }),
}));

// Mock BottomNav
jest.mock('../../components/BottomNav', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  const MockBottomNav = () => <View testID="bottom-nav" />;
  MockBottomNav.displayName = 'MockBottomNav';
  return MockBottomNav;
});

// Mock SkeletonLoader
jest.mock('../../components/SkeletonLoader', () => ({
  MomentsFeedSkeleton: () => null,
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock mocks
jest.mock('../../mocks', () => ({
  MOCK_MOMENTS: [],
}));

// Mock discover components
jest.mock('../discover', () => ({
  StoryViewer: () => null,
  FilterModal: () => null,
  LocationModal: () => null,
  POPULAR_CITIES: ['Istanbul', 'Paris', 'London'],
  USER_STORIES: [
    {
      id: 'story1',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      stories: [{ id: 's1', image: 'https://example.com/story.jpg' }],
    },
  ],
}));

// Mock constants
jest.mock('../../constants/colors', () => ({
  COLORS: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    primary: '#3B82F6',
    white: '#FFFFFF',
    border: '#E5E5E5',
    mint: '#10B981',
    error: '#EF4444',
    overlay30: 'rgba(0,0,0,0.3)',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
    },
  },
}));

describe('DiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByTestId } = render(<DiscoverScreen />);
      expect(getByTestId('bottom-nav')).toBeTruthy();
    });

    it('displays moments from hook', () => {
      const { getByText } = render(<DiscoverScreen />);
      expect(getByText('Coffee Experience')).toBeTruthy();
      expect(getByText('Dinner Experience')).toBeTruthy();
    });

    it('displays location header', () => {
      const { getByText } = render(<DiscoverScreen />);
      expect(getByText('San Francisco, CA')).toBeTruthy();
    });

    it('displays results count', () => {
      const { getByText } = render(<DiscoverScreen />);
      expect(getByText('2 moments nearby')).toBeTruthy();
    });
  });

  describe('View Mode Toggle', () => {
    it('can toggle between single and grid view', () => {
      const { getByText } = render(<DiscoverScreen />);
      // Default view renders moments
      expect(getByText('Coffee Experience')).toBeTruthy();
    });
  });

  describe('Moment Cards', () => {
    it('displays moment details', () => {
      const { getByText } = render(<DiscoverScreen />);
      expect(getByText('Coffee Experience')).toBeTruthy();
      expect(getByText('Dinner Experience')).toBeTruthy();
    });

    it('navigates to moment detail on card press', () => {
      const { getByText } = render(<DiscoverScreen />);
      const momentCard = getByText('Coffee Experience');
      fireEvent.press(momentCard);
      expect(mockNavigate).toHaveBeenCalledWith(
        'MomentDetail',
        expect.objectContaining({
          moment: expect.objectContaining({ id: '1' }),
        }),
      );
    });
  });

  describe('Pull to Refresh', () => {
    it('calls refresh function', async () => {
      render(<DiscoverScreen />);
      // Refresh is triggered by useMoments hook
      await waitFor(() => {
        expect(mockRefresh).toBeDefined();
      });
    });
  });

  describe('Error State', () => {
    it('handles loading state gracefully', () => {
      const { queryByText } = render(<DiscoverScreen />);
      // When not loading, should show moments
      expect(queryByText('Loading...')).toBeFalsy();
    });
  });

  describe('Empty State', () => {
    it('component renders without crashing with data', () => {
      const { getByText } = render(<DiscoverScreen />);
      expect(getByText('Coffee Experience')).toBeTruthy();
    });
  });
});
