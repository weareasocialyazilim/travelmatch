import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { SPACING } from '../constants/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { usePressScale } from '../utils/animations';

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
    const { impact } = useHaptics();
    const { animatedStyle, onPressIn, onPressOut } = usePressScale();

    const handlePress = () => {
      void impact('light');
      onPress(filter.id);
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={filter.label}
        accessibilityState={{ selected: isSelected }}
      >
        <Animated.View
          style={[
            styles.filterPill,
            isSelected && styles.filterPillActive,
            animatedStyle,
          ]}
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
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

FilterPill.displayName = 'FilterPill';

const styles = StyleSheet.create({
  filterPill: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBackground,
    borderColor: COLORS.glassBorder,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
