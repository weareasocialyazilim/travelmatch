/**
 * CategoryChips Component
 *
 * Horizontal scrollable category filter chips for the Discover screen.
 * Features gradient selection state and emoji icons.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../../constants/colors';

interface Category {
  id: string;
  emoji: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: 'all', emoji: '✨', label: 'Tümü' },
  { id: 'food', emoji: '☕', label: 'Yeme-İçme' },
  { id: 'culture', emoji: '🎭', label: 'Kültür' },
  { id: 'outdoor', emoji: '🌅', label: 'Outdoor' },
  { id: 'fun', emoji: '🎉', label: 'Eğlence' },
  { id: 'wellness', emoji: '💆', label: 'Wellness' },
  { id: 'workshop', emoji: '🎓', label: 'Workshop' },
  { id: 'music', emoji: '🎵', label: 'Müzik' },
  { id: 'shopping', emoji: '🛍️', label: 'Alışveriş' },
];

interface CategoryChipsProps {
  /** Currently selected category id */
  selected: string;
  /** Callback when a category is selected */
  onSelect: (categoryId: string) => void;
  /** Custom categories (optional, overrides default) */
  categories?: Category[];
  /** Whether to show "All" option */
  showAll?: boolean;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selected,
  onSelect,
  categories = CATEGORIES,
  showAll = true,
}) => {
  const displayCategories = showAll
    ? categories
    : categories.filter((c) => c.id !== 'all');

  const handleSelect = useCallback(
    (categoryId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(categoryId);
    },
    [onSelect]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      bounces={false}
    >
      {displayCategories.map((category) => {
        const isSelected = selected === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleSelect(category.id)}
            activeOpacity={0.7}
            style={styles.chipWrapper}
          >
            {isSelected ? (
              <LinearGradient
                colors={GRADIENTS.giftButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.chipSelected}
              >
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text style={styles.labelSelected}>{category.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.chip}>
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text style={styles.label}>{category.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

/**
 * TabChips - Tab selector variant (for Nearby/Explore/For You)
 */
interface Tab {
  id: string;
  label: string;
  description?: string;
}

const DEFAULT_TABS: Tab[] = [
  { id: 'nearby', label: 'Yakındakiler', description: 'Yerel olarak hediye ver' },
  { id: 'explore', label: 'Keşfet', description: 'Uzaktan hediye ver' },
  { id: 'foryou', label: 'Senin İçin', description: 'Sana özel' },
];

interface TabChipsProps {
  selected: string;
  onSelect: (tabId: string) => void;
  tabs?: Tab[];
}

export const TabChips: React.FC<TabChipsProps> = ({
  selected,
  onSelect,
  tabs = DEFAULT_TABS,
}) => {
  const handleSelect = useCallback(
    (tabId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(tabId);
    },
    [onSelect]
  );

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isSelected = selected === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleSelect(tab.id)}
            activeOpacity={0.7}
            style={[styles.tab, isSelected && styles.tabSelected]}
          >
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
              {tab.label}
            </Text>
            {isSelected && tab.description && (
              <Text style={styles.tabDescription}>{tab.description}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chipWrapper: {
    marginRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  labelSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabLabelSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default CategoryChips;
