/**
 * Sort Options Selector
 * Quick sort menu for search results
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import type { SortOption } from '../../stores/searchStore';
import { useSearchStore } from '../../stores/searchStore';
import { spacing } from '../../constants/spacing';
import { radii } from '../../constants/radii';
import { TYPOGRAPHY } from '../../constants/typography';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SortSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (sort: SortOption) => void;
}

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  icon: IconName;
}> = [
  { value: 'recent', label: 'Most Recent', icon: 'clock-outline' },
  { value: 'popular', label: 'Most Popular', icon: 'fire' },
  { value: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
  { value: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
  { value: 'rating', label: 'Highest Rated', icon: 'star' },
];

export const SortSelector: React.FC<SortSelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { colors } = useTheme();
  const { t: _t } = useTranslation();
  const { sortBy, setSortBy } = useSearchStore();

  const handleSelect = (option: SortOption) => {
    setSortBy(option);
    onSelect?.(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Sort By</Text>

          {SORT_OPTIONS.map((option) => {
            const isSelected = sortBy === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(option.value)}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={22}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={styles.icon}
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? colors.primary : colors.text,
                    },
                    isSelected ? styles.selectedText : styles.normalText,
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  optionSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  icon: {
    marginRight: spacing.md,
  },
  optionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  selectedText: {
    fontWeight: '600',
  },
  normalText: {
    fontWeight: '400',
  },
});
