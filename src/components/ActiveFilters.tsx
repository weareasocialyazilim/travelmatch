/**
 * Active Filters Component
 * Shows applied filters with remove functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

type FilterTag = {
  key: string;
  label: string;
  value: string;
};

type ActiveFiltersProps = {
  filters: FilterTag[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
};

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <View key={filter.key} style={styles.filterTag}>
            <Text style={styles.filterText} numberOfLines={1}>
              {filter.label}: {filter.value}
            </Text>
            <TouchableOpacity
              onPress={() => onRemove(filter.key)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        ))}

        {filters.length > 1 && (
          <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
    maxWidth: 200,
  },
  filterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 16,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  clearAllText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
});
