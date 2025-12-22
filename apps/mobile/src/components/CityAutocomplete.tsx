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

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

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

  const searchCities = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    if (!MAPBOX_ACCESS_TOKEN) {
      console.warn('[CityAutocomplete] Mapbox token not configured');
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
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
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
