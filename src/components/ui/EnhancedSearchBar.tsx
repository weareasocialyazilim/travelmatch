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
  FlatList,
  Text,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchStore } from '../../stores/searchStore';
import { useDebounce } from '../../utils/performance';
import { spacing } from '../../constants/spacing';
import { radii } from '../../constants/radii';
import { TYPOGRAPHY } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
import {
  VERTICAL_LIST_CONFIG,
  ITEM_HEIGHTS,
  createGetItemLayout,
} from '../../utils/listOptimization';

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
  const { colors } = useTheme();
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
            backgroundColor: colors.surface,
            borderColor: isFocused ? colors.primary : colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={colors.textSecondary}
          style={styles.icon}
        />

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder || t('common.search')}
          placeholderTextColor={colors.textSecondary}
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
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches Dropdown */}
      {showSuggestions && (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
              {t('common.search')} History
            </Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList<string>
            data={searchHistory}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.suggestionRow}>
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.suggestionIcon}
                  />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {item}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeFromHistory(item)}
                  style={styles.deleteButton}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            {...VERTICAL_LIST_CONFIG}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            getItemLayout={createGetItemLayout(ITEM_HEIGHTS.SMALL)}
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
    paddingHorizontal: spacing.md,
    height: 50,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...TYPOGRAPHY.body,
    flex: 1,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
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
    padding: spacing.md,
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
    padding: spacing.md,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  deleteButton: {
    padding: spacing.md,
  },
});
