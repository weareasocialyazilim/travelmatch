/**
 * PlaceAutocomplete - City and POI Search Component
 *
 * Supports two search modes:
 * - City search (types=place)
 * - POI/Venue search (types=poi) with proximity
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useRecentPlaces } from '@/hooks/useRecentPlaces';

interface PlaceResult {
  id: string;
  name: string;
  place_name: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'poi' | 'address';
  context?: string;
}

interface PlaceAutocompleteProps {
  onSelect: (place: PlaceResult) => void;
  onClose?: () => void;
  initialQuery?: string;
  placeholder?: string;
  searchType?: 'city' | 'poi' | 'both';
}

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  onSelect,
  onClose,
  initialQuery = '',
  placeholder = 'Search city or venue...',
  searchType = 'both',
}) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { searchPlaces, loading } = usePlaceSearch();
  const { recentPlaces, addRecentPlace, clearRecentPlaces } = useRecentPlaces();

  const performSearch = useCallback(async () => {
    if (!query.trim() || query.length < 2) {
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      await searchPlaces(query, searchType);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchType, searchPlaces]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = useCallback(
    (place: PlaceResult) => {
      Keyboard.dismiss();
      addRecentPlace(place);
      onSelect(place);
      setShowResults(false);
      onClose?.();
    },
    [onSelect, onClose, addRecentPlace],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor="#999"
            autoFocus
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Mode Tabs */}
      {searchType === 'both' && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            onPress={() => {}}
          >
            <Text style={styles.activeTabText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => {}}
          >
            <Text style={styles.tabText}>Cities</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => {}}
          >
            <Text style={styles.tabText}>Venues</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1a1a1a" />
            </View>
          ) : (
            <FlatList
              data={[]} // Results from usePlaceSearch hook
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <Ionicons
                    name={item.type === 'city' ? 'location' : 'business'}
                    size={20}
                    color="#666"
                    style={styles.resultIcon}
                  />
                  <View style={styles.resultText}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultPlaceName} numberOfLines={1}>
                      {item.place_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
              style={styles.resultsList}
            />
          )}
        </View>
      )}

      {/* Recent Searches (shown when no query) */}
      {!showResults && recentPlaces.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentPlaces}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentPlaces.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#999"
                  style={styles.resultIcon}
                />
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    outlineStyle: 'none',
  },
  clearButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#1a1a1a',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  resultPlaceName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  recentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
});

export default PlaceAutocomplete;
