import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PropTypes from 'prop-types';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';

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

export const FilterPill: React.FC<FilterPillProps> = React.memo(
  ({ filter, isSelected, onPress }) => {
    return (
      <TouchableOpacity
        style={[styles.filterPill, isSelected && styles.filterPillActive]}
        onPress={() => onPress(filter.id)}
        accessibilityRole="button"
        accessibilityLabel={filter.label}
        accessibilityState={{ selected: isSelected }}
      >
        {filter.icon && (
          <MaterialCommunityIcons
            name={filter.icon as IconName}
            size={16}
            color={isSelected ? COLORS.text : COLORS.textSecondary}
          />
        )}
        <Text
          style={[styles.filterText, isSelected && styles.filterTextActive]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  },
);

FilterPill.propTypes = {
  filter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired,
};

FilterPill.displayName = 'FilterPill';

const styles = StyleSheet.create({
  filterPill: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.filterPillActiveBorder,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
});
