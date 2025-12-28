/**
 * FilterModal Component
 * Category, sort, distance, and price filters
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';
import { CATEGORIES, SORT_OPTIONS } from './constants';
import type { PriceRange } from './types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
}

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];

const PRICE_OPTIONS = [
  { min: 0, max: 50, label: '$0-50' },
  { min: 50, max: 100, label: '$50-100' },
  { min: 100, max: 250, label: '$100-250' },
  { min: 0, max: 500, label: 'All' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  maxDistance,
  setMaxDistance,
  priceRange,
  setPriceRange,
}) => {
  const handleReset = () => {
    setSelectedCategory('all');
    setSortBy('nearest');
    setMaxDistance(50);
    setPriceRange({ min: 0, max: 500 });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryChipEmoji}>
                      {category.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category.id &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort by</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      sortBy === option.id && styles.sortOptionActive,
                    ]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={16}
                      color={
                        sortBy === option.id
                          ? COLORS.utility.white
                          : COLORS.text.primary
                      }
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option.id && styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Max Distance: {maxDistance} km
              </Text>
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.distanceChip,
                      maxDistance === d && styles.distanceChipActive,
                    ]}
                    onPress={() => setMaxDistance(d)}
                  >
                    <Text
                      style={[
                        styles.distanceChipText,
                        maxDistance === d && styles.distanceChipTextActive,
                      ]}
                    >
                      {d} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Price Range: ${priceRange.min} - ${priceRange.max}
              </Text>
              <View style={styles.priceOptions}>
                {PRICE_OPTIONS.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.priceChip,
                      priceRange.min === range.min &&
                        priceRange.max === range.max &&
                        styles.priceChipActive,
                    ]}
                    onPress={() => setPriceRange(range)}
                  >
                    <Text
                      style={[
                        styles.priceChipText,
                        priceRange.min === range.min &&
                          priceRange.max === range.max &&
                          styles.priceChipTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.heavy,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.mint,
  },
  categoryChipEmoji: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.utility.white,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    gap: 6,
  },
  sortOptionActive: {
    backgroundColor: COLORS.mint,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: COLORS.utility.white,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  distanceChipActive: {
    backgroundColor: COLORS.mint,
  },
  distanceChipText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  distanceChipTextActive: {
    color: COLORS.utility.white,
  },
  priceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
  },
  priceChipActive: {
    backgroundColor: COLORS.mint,
  },
  priceChipText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  priceChipTextActive: {
    color: COLORS.utility.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: primitives.stone[300],
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export default FilterModal;
