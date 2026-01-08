import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import * as ExpoLocation from 'expo-location';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';

// Initialize Mapbox - use correct EAS env var name
const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  '';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'place' | 'poi' | 'address' | 'city';
  category?: string;
}

interface LocationPickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
  initialLocation?: Location;
}

export const LocationPickerBottomSheet: React.FC<
  LocationPickerBottomSheetProps
> = ({ visible, onClose, onSelectLocation, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraRef = useRef<Camera>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation || {
      name: '',
      address: '',
      latitude: 41.0082,
      longitude: 28.9784, // Istanbul as default
    },
  );

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  }, [visible]);

  // Search for places using Mapbox Geocoding API
  const searchPlaces = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      if (!MAPBOX_ACCESS_TOKEN) {
        logger.warn('LocationPicker: Mapbox token not configured');
        return;
      }

      setIsSearching(true);
      try {
        // Use proximity parameter to sort results by distance from selected location
        const proximityParam = `&proximity=${selectedLocation.longitude},${selectedLocation.latitude}`;

        // Search for POIs (restaurants, cafes, bars, hotels) and places
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
            `types=poi,place,address,locality&limit=10&language=tr,en${proximityParam}&access_token=${MAPBOX_ACCESS_TOKEN}`,
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
              place_type: string[];
              properties?: { category?: string };
            }) => ({
              id: feature.id,
              name: feature.text,
              address: feature.place_name,
              latitude: feature.center[1],
              longitude: feature.center[0],
              type: feature.place_type[0] as SearchResult['type'],
              category: feature.properties?.category,
            }),
          ) || [];

        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        logger.error('LocationPicker: Search error', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedLocation.longitude, selectedLocation.latitude],
  );

  // Debounced search handler
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

  // Get current location
  const handleCurrentLocation = useCallback(async () => {
    setIsLoadingCurrentLocation(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission denied');
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const [address] = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationName = address?.name || address?.street || 'Mevcut Konum';
      const fullAddress = [
        address?.street,
        address?.district,
        address?.city,
        address?.country,
      ]
        .filter(Boolean)
        .join(', ');

      const newLocation: Location = {
        name: locationName,
        address: fullAddress || 'Mevcut Konum',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);
      setShowResults(false);
      setSearchQuery('');

      // Move camera to current location
      cameraRef.current?.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 15,
        animationDuration: 500,
      });
    } catch (err) {
      logger.error('LocationPicker: Current location error', err);
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, []);

  // Select a search result
  const handleSelectResult = useCallback((result: SearchResult) => {
    const newLocation: Location = {
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
    };

    setSelectedLocation(newLocation);
    setShowResults(false);
    setSearchQuery('');
    Keyboard.dismiss();

    // Move camera to selected location
    cameraRef.current?.setCamera({
      centerCoordinate: [result.longitude, result.latitude],
      zoomLevel: 15,
      animationDuration: 500,
    });
  }, []);

  // Get icon for result type
  const getResultIcon = (
    type: SearchResult['type'],
    category?: string,
  ): IconName => {
    if (category?.includes('restaurant') || category?.includes('food'))
      return 'silverware-fork-knife';
    if (category?.includes('cafe') || category?.includes('coffee'))
      return 'coffee';
    if (category?.includes('bar') || category?.includes('nightlife'))
      return 'glass-cocktail';
    if (category?.includes('hotel') || category?.includes('lodging'))
      return 'bed';
    if (type === 'poi') return 'map-marker';
    if (type === 'city' || type === 'place') return 'city';
    return 'map-marker-outline';
  };

  const handleSelectLocation = () => {
    if (selectedLocation.name) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  const handleDone = () => {
    handleSelectLocation();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectResult(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIconContainer}>
        <MaterialCommunityIcons
          name={getResultIcon(item.type, item.category)}
          size={20}
          color={COLORS.brand.primary}
        />
      </View>
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultAddress} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
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
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Konum Seç</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDone}
            activeOpacity={0.7}
            disabled={!selectedLocation.name}
          >
            <Text
              style={[
                styles.doneText,
                !selectedLocation.name && styles.doneTextDisabled,
              ]}
            >
              Tamam
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons
              name={'magnify' as IconName}
              size={20}
              color={COLORS.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Restoran, kafe, bar, otel, şehir ara..."
              placeholderTextColor={COLORS.text.secondary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color={COLORS.brand.primary}
                style={styles.searchLoader}
              />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name={'close-circle' as IconName}
                  size={18}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleCurrentLocation}
            disabled={isLoadingCurrentLocation}
            activeOpacity={0.7}
          >
            {isLoadingCurrentLocation ? (
              <ActivityIndicator size="small" color={COLORS.brand.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={20}
                  color={COLORS.brand.primary}
                />
                <Text style={styles.currentLocationText}>
                  Mevcut Konumumu Kullan
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map}>
            <Camera
              ref={cameraRef}
              zoomLevel={14}
              centerCoordinate={[
                selectedLocation.longitude,
                selectedLocation.latitude,
              ]}
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
                    size={32}
                    color={COLORS.brand.primary}
                  />
                </View>
              </PointAnnotation>
            )}
          </MapView>
        </View>

        {/* Location Info Bottom Sheet */}
        {selectedLocation.name && (
          <View style={styles.locationInfo}>
            <View style={styles.handle} />
            <Text style={styles.locationName}>{selectedLocation.name}</Text>
            <Text style={styles.locationAddress}>
              {selectedLocation.address}
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleSelectLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.selectButtonText}>Bu Konumu Seç</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.utility.white,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.blue,
    textAlign: 'right',
  },
  doneTextDisabled: {
    color: COLORS.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  searchLoader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.brand.primary,
  },
  resultsContainer: {
    maxHeight: 250,
    backgroundColor: COLORS.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    gap: 12,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(191, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border.default,
    alignSelf: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  selectButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.onLight,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
