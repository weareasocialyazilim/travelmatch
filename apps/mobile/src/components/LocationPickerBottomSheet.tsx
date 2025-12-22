import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';

// Initialize Mapbox - access token should be set in env
const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  '';
Mapbox.setAccessToken(MAPBOX_TOKEN);

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  categoryIcon: IconName;
}

interface LocationPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
  initialLocation?: Location;
}

// Category icon mapping
const getCategoryIcon = (categories: string[]): IconName => {
  const categoryString = categories.join(' ').toLowerCase();

  if (
    categoryString.includes('restaurant') ||
    categoryString.includes('food')
  ) {
    return 'silverware-fork-knife';
  }
  if (categoryString.includes('cafe') || categoryString.includes('coffee')) {
    return 'coffee';
  }
  if (
    categoryString.includes('bar') ||
    categoryString.includes('pub') ||
    categoryString.includes('nightclub')
  ) {
    return 'glass-cocktail';
  }
  if (categoryString.includes('hotel') || categoryString.includes('lodging')) {
    return 'bed';
  }
  if (categoryString.includes('museum') || categoryString.includes('gallery')) {
    return 'bank';
  }
  if (categoryString.includes('park') || categoryString.includes('garden')) {
    return 'tree';
  }
  if (
    categoryString.includes('shop') ||
    categoryString.includes('store') ||
    categoryString.includes('mall')
  ) {
    return 'shopping';
  }
  if (
    categoryString.includes('gym') ||
    categoryString.includes('fitness') ||
    categoryString.includes('sport')
  ) {
    return 'dumbbell';
  }
  if (
    categoryString.includes('hospital') ||
    categoryString.includes('clinic') ||
    categoryString.includes('pharmacy')
  ) {
    return 'hospital-box';
  }
  if (
    categoryString.includes('school') ||
    categoryString.includes('university') ||
    categoryString.includes('college')
  ) {
    return 'school';
  }
  if (
    categoryString.includes('airport') ||
    categoryString.includes('station') ||
    categoryString.includes('terminal')
  ) {
    return 'airplane';
  }
  if (categoryString.includes('beach')) {
    return 'beach';
  }
  if (categoryString.includes('theater') || categoryString.includes('cinema')) {
    return 'theater';
  }
  if (
    categoryString.includes('landmark') ||
    categoryString.includes('monument')
  ) {
    return 'star';
  }

  return 'map-marker';
};

// Format category for display
const formatCategory = (categories: string[]): string => {
  if (categories.length === 0) return 'Place';
  const mainCategory = categories[0] ?? 'place';
  return (
    mainCategory.charAt(0).toUpperCase() +
    mainCategory.slice(1).replace(/_/g, ' ')
  );
};

export const LocationPickerBottomSheet: React.FC<
  LocationPickerBottomSheetProps
> = ({ visible, onClose, onSelectLocation, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation || {
      name: '',
      address: '',
      latitude: 41.0082, // Istanbul default
      longitude: 28.9784,
    },
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
      if (initialLocation) {
        setSelectedLocation(initialLocation);
      }
    }
  }, [visible, initialLocation]);

  // Search places using Mapbox Search Box API (better POI results)
  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (!MAPBOX_TOKEN) {
      logger.warn('[LocationPicker] Mapbox token not configured');
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Try Mapbox Search Box API first (better for POIs like restaurants, museums, etc.)
      // This API returns richer results including businesses, landmarks, and addresses
      const searchBoxResponse = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
          `q=${encodeURIComponent(query)}&` +
          `language=en,tr&` +
          `limit=10&` +
          `session_token=${Date.now()}&` +
          `types=poi,address,place,neighborhood,locality,region,country&` +
          `access_token=${MAPBOX_TOKEN}`,
      );

      if (searchBoxResponse.ok) {
        const searchBoxData = await searchBoxResponse.json();

        if (searchBoxData.suggestions && searchBoxData.suggestions.length > 0) {
          // Map suggestions directly - coordinates will be fetched when user selects
          const results: SearchResult[] = searchBoxData.suggestions
            .slice(0, 10)
            .map(
              (suggestion: {
                mapbox_id: string;
                name: string;
                full_address?: string;
                address?: string;
                place_formatted?: string;
                feature_type: string;
                maki?: string;
                poi_category?: string[];
                poi_category_ids?: string[];
              }) => {
                const categories = suggestion.poi_category || [];

                return {
                  id: suggestion.mapbox_id,
                  name: suggestion.name,
                  address:
                    suggestion.full_address ||
                    suggestion.place_formatted ||
                    suggestion.address ||
                    '',
                  latitude: 0, // Will be fetched on selection
                  longitude: 0,
                  category: formatCategory(categories),
                  categoryIcon: getCategoryIcon(categories),
                };
              },
            );

          setSearchResults(results);
          return;
        }
      }

      // Fallback to Geocoding API if Search Box fails or returns no results
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?` +
          `types=poi,poi.landmark,address,place&` +
          `limit=10&` +
          `language=en,tr&` +
          `access_token=${MAPBOX_TOKEN}`,
      );

      if (!response.ok) {
        throw new Error('Failed to search places');
      }

      const data = await response.json();

      const results: SearchResult[] =
        data.features?.map(
          (feature: {
            id: string;
            text: string;
            place_name: string;
            center: [number, number];
            properties?: { category?: string; maki?: string };
            context?: Array<{ id: string; text: string }>;
          }) => {
            // Extract categories from properties
            const categories = feature.properties?.category?.split(',') || [];

            return {
              id: feature.id,
              name: feature.text,
              address: feature.place_name,
              longitude: feature.center[0],
              latitude: feature.center[1],
              category: formatCategory(categories),
              categoryIcon: getCategoryIcon(categories),
            };
          },
        ) || [];

      setSearchResults(results);
    } catch (error) {
      logger.error('[LocationPicker] Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchPlaces(text);
      }, 300);
    },
    [searchPlaces],
  );

  // Select a search result - fetch coordinates if needed (for Search Box API results)
  const handleSelectResult = useCallback(async (result: SearchResult) => {
    let latitude = result.latitude;
    let longitude = result.longitude;

    // If coordinates are 0, fetch them from Mapbox retrieve endpoint
    if (latitude === 0 && longitude === 0 && result.id.startsWith('dXJu')) {
      try {
        const retrieveResponse = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.id}?` +
            `session_token=${Date.now()}&` +
            `access_token=${MAPBOX_TOKEN}`,
        );

        if (retrieveResponse.ok) {
          const retrieveData = await retrieveResponse.json();
          if (retrieveData.features && retrieveData.features.length > 0) {
            const coords = retrieveData.features[0].geometry?.coordinates;
            if (coords) {
              longitude = coords[0];
              latitude = coords[1];
            }
          }
        }
      } catch {
        // Use default Istanbul coordinates if retrieve fails
        latitude = 41.0082;
        longitude = 28.9784;
      }
    }

    const location: Location = {
      name: result.name,
      address: result.address,
      latitude,
      longitude,
      category: result.category,
    };

    setSelectedLocation(location);
    setShowResults(false);
    setSearchQuery(result.name);
    Keyboard.dismiss();

    // Animate camera to selected location
    if (latitude !== 0 && longitude !== 0) {
      cameraRef.current?.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 16,
        animationDuration: 500,
      });
    }
  }, []);

  // Confirm selection
  const handleConfirmLocation = useCallback(() => {
    if (selectedLocation.name) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onSelectLocation, onClose]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  // Render search result item
  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleSelectResult(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resultIconContainer}>
          <MaterialCommunityIcons
            name={item.categoryIcon}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.resultCategory}>{item.category}</Text>
          <Text style={styles.resultAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [handleSelectResult],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={'close' as IconName}
              size={28}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a place</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleConfirmLocation}
            activeOpacity={0.7}
            disabled={!selectedLocation.name}
          >
            <Text
              style={[
                styles.doneText,
                !selectedLocation.name && styles.doneTextDisabled,
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons
              name={'magnify' as IconName}
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants, cafes, bars, museums..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              autoCorrect={false}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name={'close-circle' as IconName}
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {showResults && (
          <View style={styles.resultsContainer}>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            ) : !isSearching && searchQuery.length >= 2 ? (
              <View style={styles.noResultsContainer}>
                <MaterialCommunityIcons
                  name="map-search-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.noResultsText}>No places found</Text>
                <Text style={styles.noResultsHint}>
                  Try searching for a restaurant, cafe, or landmark
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Map */}
        {!showResults && (
          <View style={styles.mapContainer}>
            <MapView style={styles.map}>
              <Camera
                ref={cameraRef}
                zoomLevel={selectedLocation.name ? 16 : 12}
                centerCoordinate={[
                  selectedLocation.longitude,
                  selectedLocation.latitude,
                ]}
                animationDuration={500}
              />
              {selectedLocation.name && (
                <PointAnnotation
                  id="selected-location"
                  coordinate={[
                    selectedLocation.longitude,
                    selectedLocation.latitude,
                  ]}
                  title={selectedLocation.name}
                >
                  <View style={styles.markerContainer}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={40}
                      color={COLORS.primary}
                    />
                  </View>
                </PointAnnotation>
              )}
            </MapView>
          </View>
        )}

        {/* Location Info Bottom Sheet */}
        {selectedLocation.name && !showResults && (
          <View style={styles.locationInfo}>
            <View style={styles.handle} />
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <MaterialCommunityIcons
                  name={getCategoryIcon([selectedLocation.category || ''])}
                  size={28}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationName}>{selectedLocation.name}</Text>
                {selectedLocation.category && (
                  <Text style={styles.locationCategory}>
                    {selectedLocation.category}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.locationAddress}>
              {selectedLocation.address}
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleConfirmLocation}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="check"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.selectButtonText}>Select this place</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state when no location selected */}
        {!selectedLocation.name && !showResults && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="map-search"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyStateText}>Search for a place</Text>
            <Text style={styles.emptyStateHint}>
              Find restaurants, cafes, bars, museums and more
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
  },
  doneTextDisabled: {
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultCategory: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  noResultsHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationCategory: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  selectButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
