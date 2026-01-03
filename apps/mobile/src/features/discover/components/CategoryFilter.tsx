// Category Filter - Horizontal scrollable category pills
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import type { CategoryFilterProps } from './types';

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelect,
}) => (
  <View style={styles.categorySection}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryScroll}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryPill,
            selectedCategory === cat.id && styles.categoryPillActive,
          ]}
          onPress={() => onSelect(cat.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
          <Text
            style={[
              styles.categoryLabel,
              selectedCategory === cat.id && styles.categoryLabelActive,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  categorySection: {
    paddingVertical: 8,
    backgroundColor: COLORS.utility.white,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.mintTransparent,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  categoryLabelActive: {
    color: COLORS.mint,
    fontWeight: '600',
  },
});
