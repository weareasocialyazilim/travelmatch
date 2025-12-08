/**
 * CategorySelector Component
 * Horizontal category chips selector for CreateMoment screen
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

export interface Category {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const CATEGORIES: Category[] = [
  { id: 'coffee', label: 'Coffee', icon: 'coffee' },
  { id: 'meal', label: 'Meal', icon: 'food' },
  { id: 'ticket', label: 'Ticket', icon: 'ticket' },
  { id: 'transport', label: 'Transport', icon: 'bus' },
  { id: 'experience', label: 'Experience', icon: 'star' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export const getCategoryEmoji = (categoryId: string): string => {
  const emojiMap: Record<string, string> = {
    coffee: '☕',
    meal: '🍽️',
    ticket: '🎟️',
    transport: '🚗',
    experience: '⭐',
    other: '🎁',
  };
  return emojiMap[categoryId] || '🎁';
};

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = memo(
  ({ selectedCategory, onSelectCategory }) => {
    return (
      <View style={styles.categorySection}>
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipSelected,
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{
                selected: selectedCategory === category.id,
              }}
              accessibilityLabel={`${category.label} category`}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={20}
                color={
                  selectedCategory === category.id
                    ? COLORS.text
                    : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id &&
                    styles.categoryChipTextSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  },
);

CategorySelector.displayName = 'CategorySelector';

const styles = StyleSheet.create({
  categorySection: {
    backgroundColor: COLORS.background,
    paddingVertical: 16,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    gap: 8,
    paddingHorizontal: 20,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default CategorySelector;
