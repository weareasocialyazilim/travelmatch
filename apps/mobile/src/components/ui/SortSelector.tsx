/**
 * Sort Options Selector
 * Quick sort menu for search results
 */

import React from 'react';
import type { ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchStore } from '../../stores/searchStore';
import type { SortOption } from '../../stores/searchStore';

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
            { backgroundColor: COLORS.utility.white, borderColor: COLORS.border.default },
          ]}
        >
          <Text style={[styles.title, { color: COLORS.text.primary }]}>Sort By</Text>

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
                  color={isSelected ? COLORS.brand.primary : COLORS.text.secondary}
                  style={styles.icon}
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? COLORS.brand.primary : COLORS.text.primary,
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
                    color={COLORS.brand.primary}
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
    backgroundColor: COLORS.overlay.heavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: radii.md,
    marginBottom: SPACING.xs,
  },
  optionSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  icon: {
    marginRight: SPACING.md,
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
