/**
 * FilterSortBar Component
 * Provides filtering and sorting options for lists
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type SortField = 'date' | 'amount' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface FilterOption {
  key: string;
  label: string;
  active: boolean;
}

export interface FilterSortBarProps {
  filters: FilterOption[];
  sortField?: SortField;
  sortOrder?: SortOrder;
  onFilterChange: (filterKey: string) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  filters,
  sortField = 'date',
  sortOrder = 'desc',
  onFilterChange,
  onSortChange,
}) => {
  const handleSortPress = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortField, newOrder);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, filter.active && styles.filterChipActive]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter.active && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
        <MaterialCommunityIcons
          name={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'}
          size={20}
          color={COLORS.textPrimary}
        />
        <Text style={styles.sortText}>{sortField}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
});

export default FilterSortBar;
