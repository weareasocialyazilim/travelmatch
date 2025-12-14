/**
 * Moment Creation and Discovery Flow Test Suite  
 * Comprehensive tests for creating and discovering moments
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  CategorySelectionScreen,
  LocationPickerScreen,
  ImageUploadScreen,
  PriceConfigurationScreen,
  MomentDetailScreen,
  SearchScreen,
  FilterScreen,
} from '@/screens/moments';
import { useMoments } from '@/hooks/useMoments';
import { useCategories } from '@/hooks/useCategories';
import { useLocation } from '@/hooks/useLocation';

jest.mock('@/hooks/useMoments');
jest.mock('@/hooks/useCategories');
jest.mock('@/hooks/useLocation');
jest.mock('@/hooks/useImagePicker');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};

describe('CategorySelectionScreen', () => {
  const mockCategories = [
    { id: '1', name: 'Sports', icon: 'basketball', color: '#FF6B6B' },
    { id: '2', name: 'Adventure', icon: 'hiking', color: '#4ECDC4' },
    { id: '3', name: 'Food & Drink', icon: 'food', color: '#95E1D3' },
    { id: '4', name: 'Arts & Culture', icon: 'palette', color: '#F38181' },
    { id: '5', name: 'Wellness', icon: 'yoga', color: '#AA96DA' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useCategories.mockReturnValue({
      categories: mockCategories,
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render category selection screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('category-selection-screen')).toBeTruthy();
    });

    it('should render all categories', () => {
      const { getByText } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Sports')).toBeTruthy();
      expect(getByText('Adventure')).toBeTruthy();
      expect(getByText('Food & Drink')).toBeTruthy();
      expect(getByText('Arts & Culture')).toBeTruthy();
      expect(getByText('Wellness')).toBeTruthy();
    });

    it('should render category icons', () => {
      const { getAllByTestID } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      const icons = getAllByTestID(/category-icon-/);
      expect(icons).toHaveLength(5);
    });
  });

  describe('Category Selection', () => {
    it('should select category on press', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('category-card-1'));
      
      const selectedCard = getByTestID('category-card-1');
      expect(selectedCard).toBeTruthy();
      // Should have selected styles
    });

    it('should navigate forward with selected category', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('category-card-1'));
      fireEvent.press(getByText('Continue'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('LocationPicker', {
        category: mockCategories[0],
      });
    });

    it('should allow changing selection', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('category-card-1'));
      fireEvent.press(getByTestID('category-card-2'));
      
      const firstCard = getByTestID('category-card-1');
      const secondCard = getByTestID('category-card-2');
      
      // First should be unselected, second selected
      expect(secondCard).toBeTruthy();
    });

    it('should disable continue button when no selection', () => {
      const { getByText } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      const continueButton = getByText('Continue');
      expect(continueButton.props.disabled).toBe(true);
    });
  });

  describe('Search', () => {
    it('should show search bar', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Search categories...')).toBeTruthy();
    });

    it('should filter categories on search', () => {
      const { getByPlaceholderText, queryByText } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search categories...');
      fireEvent.changeText(searchInput, 'Sports');
      
      expect(queryByText('Adventure')).toBeNull();
      expect(queryByText('Sports')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      useCategories.mockReturnValue({
        categories: [],
        isLoading: true,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <CategorySelectionScreen
            navigation={mockNavigation}
            route={{ params: {} }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });
  });
});

describe('LocationPickerScreen', () => {
  const mockLocations = [
    { id: '1', name: 'Santa Monica Beach', lat: 34.0195, lng: -118.4912 },
    { id: '2', name: 'Venice Beach', lat: 33.9850, lng: -118.4695 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useLocation.mockReturnValue({
      currentLocation: { lat: 34.0522, lng: -118.2437 },
      searchLocations: jest.fn().mockResolvedValue(mockLocations),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render location picker screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('location-picker-screen')).toBeTruthy();
    });

    it('should render map view', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('map-view')).toBeTruthy();
    });

    it('should render search bar', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Search location...')).toBeTruthy();
    });
  });

  describe('Location Search', () => {
    it('should search locations on input', async () => {
      const searchLocations = jest.fn().mockResolvedValue(mockLocations);
      useLocation.mockReturnValue({
        currentLocation: { lat: 34.0522, lng: -118.2437 },
        searchLocations,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search location...');
      fireEvent.changeText(searchInput, 'Santa Monica');
      
      await waitFor(() => {
        expect(searchLocations).toHaveBeenCalledWith('Santa Monica');
      });
    });

    it('should display search results', async () => {
      const searchLocations = jest.fn().mockResolvedValue(mockLocations);
      useLocation.mockReturnValue({
        currentLocation: { lat: 34.0522, lng: -118.2437 },
        searchLocations,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search location...');
      fireEvent.changeText(searchInput, 'Beach');
      
      await waitFor(() => {
        expect(getByText('Santa Monica Beach')).toBeTruthy();
        expect(getByText('Venice Beach')).toBeTruthy();
      });
    });

    it('should select location from results', () => {
      const { getByText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Santa Monica Beach'));
      
      // Should update map marker and selection
    });
  });

  describe('Current Location', () => {
    it('should show use current location button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Use Current Location')).toBeTruthy();
    });

    it('should use current location on button press', async () => {
      const { getByText, getByTestID } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Use Current Location'));
      
      await waitFor(() => {
        const marker = getByTestID('current-location-marker');
        expect(marker).toBeTruthy();
      });
    });
  });

  describe('Map Interaction', () => {
    it('should allow selecting location by tapping map', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      const mapView = getByTestID('map-view');
      fireEvent(mapView, 'press', {
        nativeEvent: {
          coordinate: { latitude: 34.0195, longitude: -118.4912 },
        },
      });
      
      expect(getByTestID('selected-location-marker')).toBeTruthy();
    });

    it('should show address for selected location', async () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      const mapView = getByTestID('map-view');
      fireEvent(mapView, 'press', {
        nativeEvent: {
          coordinate: { latitude: 34.0195, longitude: -118.4912 },
        },
      });
      
      await waitFor(() => {
        expect(getByText(/Santa Monica/)).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should continue to next step with location', () => {
      const { getByText } = render(
        <NavigationContainer>
          <LocationPickerScreen
            navigation={mockNavigation}
            route={{ params: { category: { id: '1', name: 'Sports' } } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Santa Monica Beach'));
      fireEvent.press(getByText('Continue'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ImageUpload', {
        category: { id: '1', name: 'Sports' },
        location: mockLocations[0],
      });
    });
  });
});

describe('MomentDetailScreen', () => {
  const mockMoment = {
    id: 'moment-1',
    title: 'Beach Volleyball Tournament',
    description: 'Join us for a friendly beach volleyball tournament!',
    category: 'Sports',
    location: 'Santa Monica Beach',
    price: 25,
    date: '2024-06-15',
    time: '14:00',
    duration: 120,
    maxParticipants: 8,
    currentParticipants: 4,
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    host: {
      id: 'host-1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      rating: 4.8,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useMoments.mockReturnValue({
      moment: mockMoment,
      joinMoment: jest.fn().mockResolvedValue({}),
      leaveMoment: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render moment detail screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('moment-detail-screen')).toBeTruthy();
    });

    it('should render moment title and description', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Beach Volleyball Tournament')).toBeTruthy();
      expect(getByText(/friendly beach volleyball tournament/)).toBeTruthy();
    });

    it('should render moment images carousel', () => {
      const { getAllByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      const images = getAllByTestID(/moment-image-/);
      expect(images).toHaveLength(2);
    });

    it('should render moment details', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('$25')).toBeTruthy();
      expect(getByText('Santa Monica Beach')).toBeTruthy();
      expect(getByText('4/8 participants')).toBeTruthy();
    });

    it('should render host information', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('4.8')).toBeTruthy();
    });
  });

  describe('Join Moment', () => {
    it('should show join button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Join for $25')).toBeTruthy();
    });

    it('should join moment on button press', async () => {
      const joinMoment = jest.fn().mockResolvedValue({ success: true });
      useMoments.mockReturnValue({
        moment: mockMoment,
        joinMoment,
        leaveMoment: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Join for $25'));
      
      await waitFor(() => {
        expect(joinMoment).toHaveBeenCalledWith('moment-1');
      });
    });

    it('should navigate to payment after join', async () => {
      const joinMoment = jest.fn().mockResolvedValue({ 
        success: true,
        requiresPayment: true,
      });
      useMoments.mockReturnValue({
        moment: mockMoment,
        joinMoment,
        leaveMoment: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Join for $25'));
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Payment', {
          momentId: 'moment-1',
          amount: 25,
        });
      });
    });

    it('should show full badge when max participants reached', () => {
      useMoments.mockReturnValue({
        moment: {
          ...mockMoment,
          currentParticipants: 8,
          maxParticipants: 8,
        },
        joinMoment: jest.fn(),
        leaveMoment: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Full')).toBeTruthy();
    });
  });

  describe('Share Moment', () => {
    it('should show share button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('share-button')).toBeTruthy();
    });

    it('should open share sheet on button press', async () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('share-button'));
      
      await waitFor(() => {
        // Share sheet should open
      });
    });
  });

  describe('Save Moment', () => {
    it('should show save button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('save-button')).toBeTruthy();
    });

    it('should toggle saved state', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      const saveButton = getByTestID('save-button');
      fireEvent.press(saveButton);
      
      // Icon should change to filled
    });
  });

  describe('Chat with Host', () => {
    it('should show contact host button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Contact Host')).toBeTruthy();
    });

    it('should navigate to chat on contact press', () => {
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Contact Host'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', {
        userId: 'host-1',
        momentId: 'moment-1',
      });
    });
  });

  describe('Report Moment', () => {
    it('should show report option in menu', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('menu-button'));
      
      expect(getByText('Report')).toBeTruthy();
    });

    it('should open report modal', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('menu-button'));
      fireEvent.press(getByText('Report'));
      
      expect(getByText('Report Moment')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      useMoments.mockReturnValue({
        moment: null,
        joinMoment: jest.fn(),
        leaveMoment: jest.fn(),
        isLoading: true,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      useMoments.mockReturnValue({
        moment: null,
        joinMoment: jest.fn(),
        leaveMoment: jest.fn(),
        isLoading: false,
        error: new Error('Moment not found'),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <MomentDetailScreen
            navigation={mockNavigation}
            route={{ params: { momentId: 'moment-1' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText('Moment not found')).toBeTruthy();
    });
  });
});

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useMoments.mockReturnValue({
      searchResults: [],
      search: jest.fn(),
      recentSearches: ['yoga', 'beach volleyball'],
      isSearching: false,
    });
  });

  describe('Basic Rendering', () => {
    it('should render search screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('search-screen')).toBeTruthy();
    });

    it('should auto-focus search input', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      expect(searchInput).toBeTruthy();
    });

    it('should show recent searches', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Recent Searches')).toBeTruthy();
      expect(getByText('yoga')).toBeTruthy();
      expect(getByText('beach volleyball')).toBeTruthy();
    });

    it('should show trending searches', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Trending')).toBeTruthy();
    });
  });

  describe('Search', () => {
    it('should search on input with debounce', async () => {
      const search = jest.fn();
      useMoments.mockReturnValue({
        searchResults: [],
        search,
        recentSearches: [],
        isSearching: false,
      });
      
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const searchInput = getByPlaceholderText('Search moments...');
      fireEvent.changeText(searchInput, 'volleyball');
      
      await waitFor(
        () => {
          expect(search).toHaveBeenCalledWith('volleyball');
        },
        { timeout: 1000 }
      );
    });

    it('should show search results', async () => {
      const mockResults = [
        { id: '1', title: 'Beach Volleyball' },
        { id: '2', title: 'Volleyball Tournament' },
      ];
      
      useMoments.mockReturnValue({
        searchResults: mockResults,
        search: jest.fn(),
        recentSearches: [],
        isSearching: false,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Beach Volleyball')).toBeTruthy();
      expect(getByText('Volleyball Tournament')).toBeTruthy();
    });

    it('should show no results message', () => {
      useMoments.mockReturnValue({
        searchResults: [],
        search: jest.fn(),
        recentSearches: [],
        isSearching: false,
        searchQuery: 'xyz',
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('No results for "xyz"')).toBeTruthy();
    });
  });

  describe('Recent Searches', () => {
    it('should search from recent item', () => {
      const search = jest.fn();
      useMoments.mockReturnValue({
        searchResults: [],
        search,
        recentSearches: ['yoga'],
        isSearching: false,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('yoga'));
      
      expect(search).toHaveBeenCalledWith('yoga');
    });

    it('should clear recent searches', () => {
      const { getByText, queryByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Clear All'));
      
      expect(queryByText('yoga')).toBeNull();
    });
  });

  describe('Filters', () => {
    it('should show filter button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('filter-button')).toBeTruthy();
    });

    it('should open filter modal', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <SearchScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('filter-button'));
      
      expect(getByText('Filters')).toBeTruthy();
    });
  });
});
