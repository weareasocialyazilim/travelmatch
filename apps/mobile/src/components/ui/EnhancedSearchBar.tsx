/**
 * Enhanced Search Bar
 * Search with autocomplete and recent searches
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchStore } from '../../stores/searchStore';
// FlashList doesn't need these optimizations - it handles them internally
import { useDebounce } from '../../utils/performance';

interface EnhancedSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  autoFocus?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder,
  onSearch,
  autoFocus = false,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  const {
    currentQuery,
    setCurrentQuery,
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useSearchStore();

  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(currentQuery);
  const debouncedQuery = useDebounce(localQuery, 300);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedQuery && isFocused) {
      setCurrentQuery(debouncedQuery);
    }
  }, [debouncedQuery, isFocused, setCurrentQuery]);

  const handleSearch = (query: string = localQuery) => {
    if (!query.trim()) return;

    addToHistory(query);
    setCurrentQuery(query);
    onSearch(query);
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setLocalQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setLocalQuery('');
    setCurrentQuery('');
    inputRef.current?.focus();
  };

  const showSuggestions = isFocused && searchHistory.length > 0 && !localQuery;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: COLORS.white,
            borderColor: isFocused ? COLORS.primary : COLORS.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={COLORS.textSecondary}
          style={styles.icon}
        />

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: COLORS.text }]}
          placeholder={placeholder || t('common.search')}
          placeholderTextColor={COLORS.textSecondary}
          value={localQuery}
          onChangeText={setLocalQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {localQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches Dropdown */}
      {showSuggestions && (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: COLORS.white, borderColor: COLORS.border },
          ]}
        >
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, { color: COLORS.text }]}>
              {t('common.search')} History
            </Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={[styles.clearText, { color: COLORS.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <FlashList
            data={searchHistory}
            keyExtractor={(item, index) => `${item}-${index}`}
            estimatedItemSize={48}
            renderItem={({ item }) => (
              <View style={styles.suggestionRow}>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(item)}
                  hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.suggestionIcon}
                  />
                  <Text style={[styles.suggestionText, { color: COLORS.text }]}>
                    {item}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeFromHistory(item)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radii.lg,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    ...TYPOGRAPHY.body,
    flex: 1,
    height: '100%',
  },
  clearButton: {
    padding: SPACING.xs,
  },
  suggestions: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: radii.md,
    maxHeight: 300,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blackTransparentDark,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  clearText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  suggestionIcon: {
    marginRight: SPACING.sm,
  },
  suggestionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  deleteButton: {
    padding: SPACING.md,
  },
});
