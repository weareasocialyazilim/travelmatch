/**
 * Advanced Filter Panel
 * Comprehensive filtering UI with category, price, date, location
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useSearchStore } from '../../stores/searchStore';
import Button from '../Button';
import type { SearchFilters } from '../../stores/searchStore';

interface FilterPanelProps {
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'adventure', label: 'Adventure', icon: 'hiking' },
  { id: 'culture', label: 'Culture', icon: 'bank' },
  { id: 'food', label: 'Food & Drink', icon: 'food' },
  { id: 'nature', label: 'Nature', icon: 'tree' },
  { id: 'nightlife', label: 'Nightlife', icon: 'glass-cocktail' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping' },
  { id: 'sports', label: 'Sports', icon: 'basketball' },
  { id: 'wellness', label: 'Wellness', icon: 'spa' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'challenging', label: 'Challenging' },
  { id: 'expert', label: 'Expert' },
];

const PRICE_RANGES = [
  { id: 'budget', min: 0, max: 50, label: '$0 - $50' },
  { id: 'moderate', min: 50, max: 150, label: '$50 - $150' },
  { id: 'premium', min: 150, max: 300, label: '$150 - $300' },
  { id: 'luxury', min: 300, max: undefined, label: '$300+' },
];

export const AdvancedFilterPanel: React.FC<FilterPanelProps> = ({
  onApply,
  onClose,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters: _hasActiveFilters,
  } = useSearchStore();

  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    clearFilters();
  };

  const toggleCategory = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  };

  const toggleDifficulty = (difficulty: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty === difficulty ? undefined : difficulty,
    }));
  };

  const selectPriceRange = (min?: number, max?: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const activeCount = Object.keys(localFilters).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('common.filter')} ({activeCount})
        </Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Category
          </Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = localFilters.category === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={
                      category.icon as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={20}
                    color={isSelected ? colors.white : colors.text}
                    style={styles.chipIcon}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? colors.white : colors.text },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Price Range
          </Text>
          <View style={styles.priceGrid}>
            {PRICE_RANGES.map((range) => {
              const isSelected =
                localFilters.minPrice === range.min &&
                localFilters.maxPrice === range.max;
              return (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.priceChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => selectPriceRange(range.min, range.max)}
                >
                  <Text
                    style={[
                      styles.priceText,
                      { color: isSelected ? colors.white : colors.text },
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Difficulty Level
          </Text>
          <View style={styles.difficultyGrid}>
            {DIFFICULTY_LEVELS.map((level) => {
              const isSelected = localFilters.difficulty === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.difficultyChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleDifficulty(level.id)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: isSelected ? colors.white : colors.text },
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          title="Reset"
          onPress={handleReset}
          variant="outline"
          style={styles.footerButton}
          disabled={!activeCount}
        />
        <Button
          title={`Apply ${activeCount ? `(${activeCount})` : ''}`}
          onPress={handleApply}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  priceGrid: {
    gap: spacing.sm,
  },
  priceChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  priceText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  difficultyChip: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  difficultyText: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});
