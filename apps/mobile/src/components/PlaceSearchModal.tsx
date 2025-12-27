/**
 * PlaceSearchModal Component
 * Uses Mapbox Geocoding API to search for places (POIs, venues, addresses)
 * Returns a Place object with name and address for CreateMoment flow
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  '';

export interface Place {
  name: string;
  address: string;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  properties?: {
    category?: string;
  };
  context?: Array<{ id: string; text: string }>;
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  category?: string;
}

interface PlaceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: Place) => void;
}

export const PlaceSearchModal: React.FC<PlaceSearchModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fallback places for when Mapbox is not available
  const FALLBACK_PLACES: PlaceResult[] = [
    { id: 'taksim', name: 'Taksim Square', address: 'Istanbul, Turkey', category: 'landmark' },
    { id: 'galata', name: 'Galata Tower', address: 'Istanbul, Turkey', category: 'landmark' },
    { id: 'hagia', name: 'Hagia Sophia', address: 'Istanbul, Turkey', category: 'landmark' },
    { id: 'blue', name: 'Blue Mosque', address: 'Istanbul, Turkey', category: 'landmark' },
    { id: 'grand', name: 'Grand Bazaar', address: 'Istanbul, Turkey', category: 'market' },
    { id: 'eiffel', name: 'Eiffel Tower', address: 'Paris, France', category: 'landmark' },
    { id: 'colosseum', name: 'Colosseum', address: 'Rome, Italy', category: 'landmark' },
    { id: 'times', name: 'Times Square', address: 'New York, United States', category: 'landmark' },
    { id: 'central', name: 'Central Park', address: 'New York, United States', category: 'park' },
    { id: 'bigben', name: 'Big Ben', address: 'London, United Kingdom', category: 'landmark' },
  ];

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Use fallback search if Mapbox token is not configured
    if (!MAPBOX_ACCESS_TOKEN) {
      logger.warn('PlaceSearchModal: Mapbox token not configured, using fallback places');
      const filtered = FALLBACK_PLACES.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setResults(filtered);
      return;
    }

    setIsLoading(true);
    try {
      // Use Mapbox Geocoding API with POI and place types
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?` +
          `types=poi,place,address&limit=10&language=en&access_token=${MAPBOX_ACCESS_TOKEN}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();

      const places: PlaceResult[] =
        data.features?.map((feature: MapboxFeature) => {
          // Extract city/region and country from context
          const cityContext = feature.context?.find((c) =>
            c.id.startsWith('place') || c.id.startsWith('region'),
          );
          const countryContext = feature.context?.find((c) =>
            c.id.startsWith('country'),
          );

          // Build address string
          const addressParts = [];
          if (cityContext?.text) addressParts.push(cityContext.text);
          if (countryContext?.text) addressParts.push(countryContext.text);
          const address = addressParts.join(', ') || feature.place_name;

          return {
            id: feature.id,
            name: feature.text,
            address,
            category: feature.properties?.category,
          };
        }) || [];

      setResults(places);
    } catch (err) {
      logger.error('PlaceSearchModal: Search error', err);
      // Fallback to local search on error
      const filtered = FALLBACK_PLACES.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.address.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setResults(filtered);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);

      // Debounce API calls
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchPlaces(text);
      }, 300);
    },
    [searchPlaces],
  );

  const handleSelectPlace = useCallback(
    (place: PlaceResult) => {
      onSelect({
        name: place.name,
        address: place.address,
      });
      setQuery('');
      setResults([]);
      Keyboard.dismiss();
      onClose();
    },
    [onSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  const getCategoryIcon = (category?: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (!category) return 'map-marker';
    if (category.includes('restaurant') || category.includes('food')) return 'silverware-fork-knife';
    if (category.includes('cafe') || category.includes('coffee')) return 'coffee';
    if (category.includes('hotel') || category.includes('lodging')) return 'bed';
    if (category.includes('park') || category.includes('garden')) return 'tree';
    if (category.includes('museum')) return 'bank';
    if (category.includes('bar') || category.includes('nightlife')) return 'glass-cocktail';
    if (category.includes('shop') || category.includes('store')) return 'shopping';
    if (category.includes('beach')) return 'beach';
    if (category.includes('airport')) return 'airplane';
    return 'map-marker';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Search Place</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={handleTextChange}
              placeholder="Search for a place, venue, or address"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
            {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
            {query.length > 0 && !isLoading && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setResults([]);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results List */}
        <View style={styles.resultsContainer}>
          {results.length > 0 ? (
            <FlashList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              estimatedItemSize={72}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectPlace(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultIcon}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(item.category)}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={COLORS.textTertiary}
                  />
                </TouchableOpacity>
              )}
            />
          ) : query.length > 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="map-search"
                size={48}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyStateText}>No places found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try a different search term
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={48}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyStateText}>Find a place</Text>
              <Text style={styles.emptyStateSubtext}>
                Search for restaurants, cafes, landmarks, or any location
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.filterPillActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  resultAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PlaceSearchModal;
