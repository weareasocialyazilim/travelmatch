import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
}

interface FilterOptions {
  category: string;
  priceRange: { min: number; max: number };
  timing: 'today' | 'next3days' | 'thisweek';
}

const CATEGORIES = ['All', 'Coffee', 'Meals', 'Tickets', 'Experiences'];
const TIMING_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'next3days', label: 'Next 3 days' },
  { value: 'thisweek', label: 'This week' },
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceMin, setPriceMin] = useState(5);
  const [priceMax, setPriceMax] = useState(200);
  const [selectedTiming, setSelectedTiming] = useState<
    'today' | 'next3days' | 'thisweek'
  >('today');

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      priceRange: { min: priceMin, max: priceMax },
      timing: selectedTiming,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedCategory('All');
    setPriceMin(5);
    setPriceMax(200);
    setSelectedTiming('today');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headline}>Filters</Text>
            <Text style={styles.subtitle}>Narrow down moments</Text>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    selectedCategory === category && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === category && styles.chipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Price</Text>
              <Text style={styles.priceRange}>
                ${priceMin} - ${priceMax}
              </Text>
            </View>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeTrack} />
              <View
                style={[
                  styles.rangeProgress,
                  {
                    left: `${(priceMin / 300) * 100}%`,
                    width: `${((priceMax - priceMin) / 300) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Timing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When</Text>
            <View style={styles.segmentedControl}>
              {TIMING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segmentButton,
                    selectedTiming === option.value &&
                      styles.segmentButtonSelected,
                  ]}
                  onPress={() =>
                    setSelectedTiming(
                      option.value as 'today' | 'next3days' | 'thisweek',
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      selectedTiming === option.value &&
                        styles.segmentButtonTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Show 15 results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  scrollView: {
    maxHeight: '70%',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: `${COLORS.primary}20`,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  rangeContainer: {
    height: 8,
    position: 'relative',
  },
  rangeTrack: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  rangeProgress: {
    position: 'absolute',
    top: '50%',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentButtonSelected: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  segmentButtonTextSelected: {
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
