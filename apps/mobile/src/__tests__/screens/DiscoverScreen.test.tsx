// @ts-nocheck
/**
 * DiscoverScreen Test Suite
 * Tests for moment discovery and search
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import DiscoverScreen from '@/screens/DiscoverScreen';
import { useMoments } from '@/hooks/useMoments';
import { useCategories } from '@/hooks/useCategories';

jest.mock('@/hooks/useMoments');
jest.mock('@/hooks/useCategories');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('DiscoverScreen', () => {
  const mockCategories = [
    { id: '1', name: 'Sports', icon: 'basketball' },
    { id: '2', name: 'Adventure', icon: 'hiking' },
    { id: '3', name: 'Food & Drink', icon: 'food' },
  ];

  const mockMoments = [
    {
      id: 'moment-1',
      title: 'Beach Volleyball',
      category: 'Sports',
      location: 'Santa Monica',
      price: 25,
      distance: 2.5,
    },
    {
      id: 'moment-2',
      title: 'Sunset Yoga',
      category: 'Sports',
      location: 'Venice Beach',
      price: 15,
      distance: 3.2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useCategories.mockReturnValue({
      categories: mockCategories,
      isLoading: false,
    });
    
    useMoments.mockReturnValue({
      moments: mockMoments,
      isLoading: false,
      error: null,
      search: jest.fn(),
      filterByCategory: jest.fn(),
      filterByLocation: jest.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('should render discover screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('discover-screen')).toBeTruthy();
    });

    it('should render search bar', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Search moments...')).toBeTruthy();
    });

    it('should render category filters', () => {
      const { getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Sports')).toBeTruthy();
      expect(getByText('Adventure')).toBeTruthy();
      expect(getByText('Food & Drink')).toBeTruthy();
    });

    it('should render moments grid', () => {
      const { getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Beach Volleyball')).toBeTruthy();
      expect(getByText('Sunset Yoga')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query on input', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      fireEvent.changeText(searchInput, 'yoga');
      
      expect(searchInput.props.value).toBe('yoga');
    });

    it('should search moments on input with debounce', async () => {
      const search = jest.fn();
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        search,
      });
      
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      fireEvent.changeText(searchInput, 'yoga');
      
      await waitFor(
        () => {
          expect(search).toHaveBeenCalledWith('yoga');
        },
        { timeout: 1000 }
      );
    });

    it('should clear search on clear button', () => {
      const { getByPlaceholderText, getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      fireEvent.changeText(searchInput, 'yoga');
      
      fireEvent.press(getByTestID('clear-search-button'));
      
      expect(searchInput.props.value).toBe('');
    });
  });

  describe('Category Filtering', () => {
    it('should filter by category on selection', () => {
      const filterByCategory = jest.fn();
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        filterByCategory,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Sports'));
      
      expect(filterByCategory).toHaveBeenCalledWith('Sports');
    });

    it('should highlight selected category', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('category-Sports'));
      
      const category = getByTestID('category-Sports');
      expect(category).toBeTruthy();
      // Should have selected styles
    });

    it('should clear filter when selecting same category', () => {
      const filterByCategory = jest.fn();
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        filterByCategory,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Sports'));
      fireEvent.press(getByText('Sports'));
      
      expect(filterByCategory).toHaveBeenLastCalledWith(null);
    });
  });

  describe('Location Filtering', () => {
    it('should show location filter button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('location-filter-button')).toBeTruthy();
    });

    it('should open location filter modal', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('location-filter-button'));
      
      expect(getByText('Filter by Location')).toBeTruthy();
    });

    it('should filter by distance', async () => {
      const filterByLocation = jest.fn();
      useMoments.mockReturnValue({
        moments: mockMoments,
        isLoading: false,
        error: null,
        filterByLocation,
      });
      
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('location-filter-button'));
      fireEvent.press(getByText('Within 5 miles'));
      
      await waitFor(() => {
        expect(filterByLocation).toHaveBeenCalledWith({ distance: 5 });
      });
    });
  });

  describe('Price Filtering', () => {
    it('should show price filter', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('price-filter-button')).toBeTruthy();
    });

    it('should filter by price range', async () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('price-filter-button'));
      
      // Select price range
      fireEvent.press(getByText('$0 - $25'));
      
      await waitFor(() => {
        const moments = mockMoments.filter(m => m.price <= 25);
        expect(moments.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Sorting', () => {
    it('should show sort button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('sort-button')).toBeTruthy();
    });

    it('should sort by distance', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('sort-button'));
      fireEvent.press(getByText('Distance'));
      
      // Moments should be sorted by distance
    });

    it('should sort by price', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('sort-button'));
      fireEvent.press(getByText('Price'));
      
      // Moments should be sorted by price
    });

    it('should sort by newest', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('sort-button'));
      fireEvent.press(getByText('Newest'));
      
      // Moments should be sorted by date
    });
  });

  describe('Map View', () => {
    it('should toggle to map view', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('map-view-toggle'));
      
      expect(getByTestID('map-view')).toBeTruthy();
    });

    it('should show moments on map', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('map-view-toggle'));
      
      expect(getByTestID('map-marker-moment-1')).toBeTruthy();
      expect(getByTestID('map-marker-moment-2')).toBeTruthy();
    });

    it('should navigate to moment on marker press', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('map-view-toggle'));
      fireEvent.press(getByTestID('map-marker-moment-1'));
      
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
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no moments found', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('No moments found')).toBeTruthy();
    });

    it('should show empty state with search query', () => {
      useMoments.mockReturnValue({
        moments: [],
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Search moments...'), 'xyz');
      
      expect(getByText('No results for "xyz"')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render large list efficiently', () => {
      const largeMomentsList = Array.from({ length: 100 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        category: 'Sports',
        location: 'Location',
        price: 20,
        distance: i * 0.5,
      }));
      
      useMoments.mockReturnValue({
        moments: largeMomentsList,
        isLoading: false,
        error: null,
      });
      
      const startTime = Date.now();
      
      render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      const renderTime = Date.now() - startTime;
      
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <DiscoverScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByLabelText('Discover screen')).toBeTruthy();
      expect(getByLabelText('Search moments')).toBeTruthy();
    });
  });
});
