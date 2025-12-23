/**
 * HomeScreen Test Suite
 * Comprehensive tests for main home screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/screens/HomeScreen';
import { useAuth } from '@/hooks/useAuth';
import { useMoments } from '@/hooks/useMoments';
import { useNotifications } from '@/hooks/useNotifications';

// Mock hooks
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useMoments');
jest.mock('@/hooks/useNotifications');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {},
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      },
      isAuthenticated: true,
    });
    
    useMoments.mockReturnValue({
      moments: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchMore: jest.fn(),
    });
    
    useNotifications.mockReturnValue({
      unreadCount: 0,
    });
  });

  describe('Basic Rendering', () => {
    it('should render home screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByTestID('home-screen')).toBeTruthy();
    });

    it('should render header with user info', () => {
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Test User')).toBeTruthy();
    });

    it('should render notification badge when unread', () => {
      useNotifications.mockReturnValue({
        unreadCount: 5,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('5')).toBeTruthy();
    });

    it('should not render notification badge when no unread', () => {
      useNotifications.mockReturnValue({
        unreadCount: 0,
      });
      
      const { queryByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(queryByTestID('notification-badge')).toBeNull();
    });
  });

  describe('Moments Feed', () => {
    const mockMoments = [
      {
        id: 'moment-1',
        title: 'Beach Volleyball',
        description: 'Join us for beach volleyball',
        location: 'Santa Monica Beach',
        price: 25,
        images: ['https://example.com/image1.jpg'],
        host: {
          id: 'host-1',
          name: 'John Doe',
          avatar: 'https://example.com/host-avatar.jpg',
        },
      },
      {
        id: 'moment-2',
        title: 'Sunset Yoga',
        description: 'Relaxing yoga session',
        location: 'Venice Beach',
        price: 15,
        images: ['https://example.com/image2.jpg'],
        host: {
          id: 'host-2',
          name: 'Jane Smith',
          avatar: 'https://example.com/host-avatar2.jpg',
        },
      },
    ];

    it('should render moments list', () => {
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Beach Volleyball')).toBeTruthy();
      expect(getByText('Sunset Yoga')).toBeTruthy();
    });

    it('should render moment details', () => {
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Santa Monica Beach')).toBeTruthy();
      expect(getByText('$25')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should navigate to moment detail on press', () => {
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Beach Volleyball'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('MomentDetail', {
        momentId: 'moment-1',
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });

    it('should not show moments list while loading', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { queryByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(queryByTestID('moments-list')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: new Error('Failed to load moments'),
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Failed to load moments')).toBeTruthy();
    });

    it('should show retry button on error', () => {
      const refetch = jest.fn();
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: new Error('Error'),
        refetch,
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Retry'));
      expect(refetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no moments', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('No moments available')).toBeTruthy();
    });

    it('should show create moment button in empty state', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const createButton = getByText('Create Moment');
      expect(createButton).toBeTruthy();
      
      fireEvent.press(createButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateMoment');
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh moments on pull', async () => {
      const refetch = jest.fn().mockResolvedValue({});
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
        refetch,
        fetchMore: jest.fn(),
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const scrollView = getByTestID('moments-scroll-view');
      fireEvent(scrollView, 'refresh');
      
      await waitFor(() => {
        expect(refetch).toHaveBeenCalled();
      });
    });

    it('should show refreshing indicator', async () => {
      const refetch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
        refetch,
        fetchMore: jest.fn(),
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const scrollView = getByTestID('moments-scroll-view');
      fireEvent(scrollView, 'refresh');
      
      expect(getByTestID('refreshing-indicator')).toBeTruthy();
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more moments on scroll', async () => {
      const fetchMore = jest.fn();
      useMoments.mockReturnValue({
        moments: Array.from({ length: 20 }, (_, i) => ({
          id: `moment-${i}`,
          title: `Moment ${i}`,
        })),
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore,
        hasMore: true,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const scrollView = getByTestID('moments-scroll-view');
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 1000 },
          contentSize: { height: 1200 },
          layoutMeasurement: { height: 800 },
        },
      });
      
      await waitFor(() => {
        expect(fetchMore).toHaveBeenCalled();
      });
    });

    it('should not load more when already loading', () => {
      const fetchMore = jest.fn();
      useMoments.mockReturnValue({
        moments: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        fetchMore,
        hasMore: true,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const scrollView = getByTestID('moments-scroll-view');
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 1000 },
          contentSize: { height: 1200 },
          layoutMeasurement: { height: 800 },
        },
      });
      
      expect(fetchMore).not.toHaveBeenCalled();
    });
  });

  describe('Search and Filters', () => {
    it('should show search bar', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Search moments...')).toBeTruthy();
    });

    it('should update search query on input', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      fireEvent.changeText(searchInput, 'yoga');
      
      expect(searchInput.props.value).toBe('yoga');
    });

    it('should show filter button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByTestID('filter-button')).toBeTruthy();
    });

    it('should open filter modal on filter button press', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('filter-button'));
      
      expect(getByText('Filters')).toBeTruthy();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to notifications', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('notifications-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Notifications');
    });

    it('should navigate to profile', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('profile-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
    });

    it('should navigate to create moment', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('create-moment-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateMoment');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible screen title', () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByLabelText('Home screen')).toBeTruthy();
    });

    it('should have accessible moment cards', () => {
      const mockMoments = [
        {
          id: 'moment-1',
          title: 'Beach Volleyball',
          description: 'Join us',
          price: 25,
        },
      ];
      
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByLabelText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByLabelText('Beach Volleyball moment card')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render large list efficiently', () => {
      const largeMomentsList = Array.from({ length: 100 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        description: 'Description',
        price: 10 + i,
        images: [`https://example.com/image${i}.jpg`],
        host: {
          id: `host-${i}`,
          name: `Host ${i}`,
          avatar: `https://example.com/avatar${i}.jpg`,
        },
      }));
      
      useMoments.mockReturnValue({
        moments: largeMomentsList,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const startTime = Date.now();
      
      render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      const renderTime = Date.now() - startTime;
      
      // Should render large list in under 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unauthenticated user', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Please log in')).toBeTruthy();
    });

    it('should handle missing moment data', () => {
      useMoments.mockReturnValue({
        moments: [
          {
            id: 'moment-1',
            // Missing title, description, etc.
          },
        ],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByTestID('home-screen')).toBeTruthy();
    });

    it('should handle network timeout', async () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: new Error('Network timeout'),
        refetch: jest.fn(),
        fetchMore: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        </NavigationContainer>
      );
      
      expect(getByText('Network timeout')).toBeTruthy();
    });
  });
});
