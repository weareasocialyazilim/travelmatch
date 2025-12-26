/**
 * City Autocomplete Component
 * Uses Mapbox Geocoding API to search for cities
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  '';

interface City {
  id: string;
  name: string;
  country: string;
  fullName: string;
}

interface CityAutocompleteProps {
  value: string;
  onSelect: (city: string) => void;
  placeholder?: string;
  error?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = 'City, Country',
  error,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync value prop with internal state
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fallback cities for when Mapbox is not available
  const FALLBACK_CITIES: City[] = [
    {
      id: 'istanbul',
      name: 'Istanbul',
      country: 'Turkey',
      fullName: 'Istanbul, Turkey',
    },
    {
      id: 'ankara',
      name: 'Ankara',
      country: 'Turkey',
      fullName: 'Ankara, Turkey',
    },
    {
      id: 'izmir',
      name: 'Izmir',
      country: 'Turkey',
      fullName: 'Izmir, Turkey',
    },
    {
      id: 'antalya',
      name: 'Antalya',
      country: 'Turkey',
      fullName: 'Antalya, Turkey',
    },
    {
      id: 'london',
      name: 'London',
      country: 'United Kingdom',
      fullName: 'London, United Kingdom',
    },
    {
      id: 'paris',
      name: 'Paris',
      country: 'France',
      fullName: 'Paris, France',
    },
    {
      id: 'new-york',
      name: 'New York',
      country: 'United States',
      fullName: 'New York, United States',
    },
    {
      id: 'los-angeles',
      name: 'Los Angeles',
      country: 'United States',
      fullName: 'Los Angeles, United States',
    },
    {
      id: 'san-francisco',
      name: 'San Francisco',
      country: 'United States',
      fullName: 'San Francisco, United States',
    },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', fullName: 'Tokyo, Japan' },
    {
      id: 'barcelona',
      name: 'Barcelona',
      country: 'Spain',
      fullName: 'Barcelona, Spain',
    },
    { id: 'rome', name: 'Rome', country: 'Italy', fullName: 'Rome, Italy' },
    {
      id: 'berlin',
      name: 'Berlin',
      country: 'Germany',
      fullName: 'Berlin, Germany',
    },
    {
      id: 'amsterdam',
      name: 'Amsterdam',
      country: 'Netherlands',
      fullName: 'Amsterdam, Netherlands',
    },
    {
      id: 'dubai',
      name: 'Dubai',
      country: 'United Arab Emirates',
      fullName: 'Dubai, United Arab Emirates',
    },
  ];

  const searchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Use fallback search if Mapbox token is not configured
    if (!MAPBOX_ACCESS_TOKEN) {
      console.warn(
        '[CityAutocomplete] Mapbox token not configured, using fallback cities',
      );
      const filtered = FALLBACK_CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSuggestions(filtered);
      return;
    }

    setIsLoading(true);
    try {
      // Use Mapbox Geocoding API with place type filter for cities
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?` +
          `types=place&limit=5&language=en&access_token=${MAPBOX_ACCESS_TOKEN}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await response.json();

      const cities: City[] =
        data.features?.map(
          (feature: {
            id: string;
            text: string;
            context?: Array<{ id: string; text: string }>;
            place_name: string;
          }) => {
            // Extract country from context
            const countryContext = feature.context?.find((c: { id: string }) =>
              c.id.startsWith('country'),
            );
            const country = countryContext?.text || '';

            return {
              id: feature.id,
              name: feature.text,
              country,
              fullName: country ? `${feature.text}, ${country}` : feature.text,
            };
          },
        ) || [];

      setSuggestions(cities);
    } catch (err) {
      console.error('[CityAutocomplete] Search error:', err);
      // Fallback to local search on error
      const filtered = FALLBACK_CITIES.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSuggestions(filtered);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- FALLBACK_CITIES is a module-level constant
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      setShowSuggestions(true);

      // Debounce API calls
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        searchCities(text);
      }, 300);
    },
    [searchCities],
  );

  const handleSelectCity = useCallback(
    (city: City) => {
      setQuery(city.fullName);
      onSelect(city.fullName);
      setSuggestions([]);
      setShowSuggestions(false);
      Keyboard.dismiss();
    },
    [onSelect],
  );

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow tap
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <MaterialCommunityIcons
          name="map-marker"
          size={18}
          color={COLORS.textSecondary}
        />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity
            onPress={() => {
              setQuery('');
              onSelect('');
              setSuggestions([]);
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

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectCity(item)}
              >
                <MaterialCommunityIcons
                  name="city"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.suggestionIcon}
                />
                <View style={styles.suggestionText}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  {item.country && (
                    <Text style={styles.countryName}>{item.country}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
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
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  countryName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default CityAutocomplete;
