/**
 * Recent Searches Component
 * Displays recent search history with clear functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

type RecentSearchesProps = {
  items: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClearAll: () => void;
};

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  items,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="history"
              size={20}
              color={COLORS.textSecondary}
              style={styles.icon}
            />
            <Text style={styles.itemText} numberOfLines={1}>
              {item}
            </Text>
            <TouchableOpacity
              onPress={() => onRemove(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  clearButton: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  itemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
});
