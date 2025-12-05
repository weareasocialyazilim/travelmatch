/**
 * FilterModal Component
 * Filter and sort modal for Discover screen
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { CATEGORIES, SORT_OPTIONS } from './constants';

// Note: For production, install @react-native-community/slider
// For now, we'll use a simplified price/distance display

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  sortBy: string;
  maxDistance: number;
  priceRange: { min: number; max: number };
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onDistanceChange: (distance: number) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onApply: () => void;
  onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = memo(
  ({
    visible,
    onClose,
    selectedCategory,
    sortBy,
    maxDistance,
    priceRange,
    onCategoryChange,
    onSortChange,
    onDistanceChange,
    onPriceRangeChange,
    onApply,
    onClear,
  }) => {
    const [localCategory, setLocalCategory] = useState(selectedCategory);
    const [localSort, setLocalSort] = useState(sortBy);
    const [localDistance, setLocalDistance] = useState(maxDistance);
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);

    const handleApply = () => {
      onCategoryChange(localCategory);
      onSortChange(localSort);
      onDistanceChange(localDistance);
      onPriceRangeChange(localPriceRange);
      onApply();
      onClose();
    };

    const handleClear = () => {
      setLocalCategory('all');
      setLocalSort('nearest');
      setLocalDistance(50);
      setLocalPriceRange({ min: 0, max: 500 });
      onClear();
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModal}>
                {/* Header */}
                <View style={styles.filterHeader}>
                  <TouchableOpacity onPress={handleClear}>
                    <Text style={styles.filterClearText}>Clear</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterTitle}>Filters</Text>
                  <TouchableOpacity onPress={onClose}>
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Categories */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Category</Text>
                    <View style={styles.categoryGrid}>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryItem,
                            localCategory === cat.id &&
                              styles.categoryItemSelected,
                          ]}
                          onPress={() => setLocalCategory(cat.id)}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected: localCategory === cat.id,
                          }}
                        >
                          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                          <Text
                            style={[
                              styles.categoryLabel,
                              localCategory === cat.id &&
                                styles.categoryLabelSelected,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Sort Options */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Sort by</Text>
                    <View style={styles.sortOptions}>
                      {SORT_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.sortOption,
                            localSort === opt.id && styles.sortOptionSelected,
                          ]}
                          onPress={() => setLocalSort(opt.id)}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected: localSort === opt.id,
                          }}
                        >
                          <MaterialCommunityIcons
                            name={opt.icon}
                            size={18}
                            color={
                              localSort === opt.id
                                ? COLORS.text
                                : COLORS.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.sortLabel,
                              localSort === opt.id && styles.sortLabelSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Distance Slider */}
                  <View style={styles.filterSection}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.filterSectionTitle}>
                        Maximum Distance
                      </Text>
                      <Text style={styles.sliderValue}>{localDistance} km</Text>
                    </View>
                    {/* Simple distance buttons instead of slider */}
                    <View style={styles.distanceButtons}>
                      {[5, 10, 25, 50, 100].map((dist) => (
                        <TouchableOpacity
                          key={dist}
                          style={[
                            styles.distanceButton,
                            localDistance === dist &&
                              styles.distanceButtonActive,
                          ]}
                          onPress={() => setLocalDistance(dist)}
                        >
                          <Text
                            style={[
                              styles.distanceButtonText,
                              localDistance === dist &&
                                styles.distanceButtonTextActive,
                            ]}
                          >
                            {dist} km
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Price Range */}
                  <View style={styles.filterSection}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.filterSectionTitle}>Price Range</Text>
                      <Text style={styles.sliderValue}>
                        ${localPriceRange.min} - ${localPriceRange.max}
                      </Text>
                    </View>
                    {/* Simple price buttons instead of slider */}
                    <View style={styles.distanceButtons}>
                      {[50, 100, 200, 300, 500].map((price) => (
                        <TouchableOpacity
                          key={price}
                          style={[
                            styles.distanceButton,
                            localPriceRange.max === price &&
                              styles.distanceButtonActive,
                          ]}
                          onPress={() =>
                            setLocalPriceRange((prev) => ({
                              ...prev,
                              max: price,
                            }))
                          }
                        >
                          <Text
                            style={[
                              styles.distanceButtonText,
                              localPriceRange.max === price &&
                                styles.distanceButtonTextActive,
                            ]}
                          >
                            ${price}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.bottomSpacing} />
                </ScrollView>

                {/* Apply Button */}
                <View style={styles.filterFooter}>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApply}
                    accessibilityRole="button"
                    accessibilityLabel="Apply filters"
                  >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

FilterModal.displayName = 'FilterModal';

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: COLORS.overlay50,
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  filterHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterClearText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  filterTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sortOption: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sortOptionSelected: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  sortLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sortLabelSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  sliderHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  distanceButtonActive: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  distanceButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  distanceButtonTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  filterFooter: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.full,
    paddingVertical: 16,
  },
  applyButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default FilterModal;
