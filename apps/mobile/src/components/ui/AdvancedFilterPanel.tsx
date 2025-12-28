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
import { COLORS } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { useTranslation } from '@/hooks/useTranslation';
import { useSearchStore } from '@/stores/searchStore';
import { Button } from './Button';
import type { SearchFilters } from '@/stores/searchStore';

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
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: COLORS.border.default }]}>
        <Text style={[styles.title, { color: COLORS.text.primary }]}>
          {t('common.filter')} ({activeCount})
        </Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.text.primary }]}>
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
                        ? COLORS.brand.primary
                        : COLORS.utility.white,
                      borderColor: isSelected ? COLORS.brand.primary : COLORS.border.default,
                    },
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <MaterialCommunityIcons
                    name={
                      category.icon as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={20}
                    color={isSelected ? COLORS.utility.white : COLORS.text.primary}
                    style={styles.chipIcon}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? COLORS.utility.white : COLORS.text.primary },
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
          <Text style={[styles.sectionTitle, { color: COLORS.text.primary }]}>
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
                        ? COLORS.brand.primary
                        : COLORS.utility.white,
                      borderColor: isSelected ? COLORS.brand.primary : COLORS.border.default,
                    },
                  ]}
                  onPress={() => selectPriceRange(range.min, range.max)}
                >
                  <Text
                    style={[
                      styles.priceText,
                      { color: isSelected ? COLORS.utility.white : COLORS.text.primary },
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
          <Text style={[styles.sectionTitle, { color: COLORS.text.primary }]}>
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
                        ? COLORS.brand.primary
                        : COLORS.utility.white,
                      borderColor: isSelected ? COLORS.brand.primary : COLORS.border.default,
                    },
                  ]}
                  onPress={() => toggleDifficulty(level.id)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: isSelected ? COLORS.utility.white : COLORS.text.primary },
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
      <View style={[styles.footer, { borderTopColor: COLORS.border.default }]}>
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: SPACING.xs,
  },
  chipText: {
    ...TYPOGRAPHY.body,
    fontWeight: '500',
  },
  priceGrid: {
    gap: SPACING.sm,
  },
  priceChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    gap: SPACING.sm,
  },
  difficultyChip: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});
