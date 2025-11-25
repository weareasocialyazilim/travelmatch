import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Filter {
  id: string;
  label: string;
  icon?: string;
}

interface FilterPillProps {
  filter: Filter;
  isSelected: boolean;
  onPress: (filterId: string) => void;
}

export const FilterPill: React.FC<FilterPillProps> = React.memo(({ filter, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterPill, isSelected && styles.filterPillActive]}
      onPress={() => onPress(filter.id)}
      accessibilityRole="button"
      accessibilityLabel={filter.label}
      accessibilityState={{ selected: isSelected }}>
      {filter.icon && (
        <MaterialCommunityIcons
          name={filter.icon as IconName}
          size={16}
          color={isSelected ? COLORS.text : COLORS.textSecondary}
        />
      )}
      <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );
});

FilterPill.displayName = 'FilterPill';

const styles = StyleSheet.create({
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: LAYOUT.filterPill.paddingHorizontal,
    paddingVertical: LAYOUT.filterPill.paddingVertical,
    borderRadius: LAYOUT.borderRadius.full,
    backgroundColor: COLORS.glassBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginRight: LAYOUT.spacing.sm,
  },
  filterPillActive: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.filterPillActiveBorder,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
