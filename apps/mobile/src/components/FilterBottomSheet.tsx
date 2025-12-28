import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Props for FilterBottomSheet component
 */
interface FilterBottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when the sheet is closed */
  onClose: () => void;
  /** Callback when filters are applied with selected options */
  onApply: (filters: FilterOptions) => void;
}

/**
 * Filter options for moments discovery
 */
interface FilterOptions {
  /** Selected category (e.g., 'Coffee', 'Meals') */
  category: string;
  /** Price range filter */
  priceRange: { min: number; max: number };
  /** Timing filter for availability */
  timing: 'today' | 'next3days' | 'thisweek';
}

// Move static arrays outside component to prevent recreation
const CATEGORIES = ['All', 'Coffee', 'Meals', 'Tickets', 'Experiences'];
const TIMING_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'next3days', label: 'Next 3 days' },
  { value: 'thisweek', label: 'This week' },
];

/**
 * Bottom sheet for filtering moments by category, price, and timing.
 * Provides interactive controls for setting filter criteria.
 *
 * @example
 * ```tsx
 * <FilterBottomSheet
 *   visible={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   onApply={(filters) => applyFilters(filters)}
 * />
 * ```
 */
export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = memo(
  ({ visible, onClose, onApply }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceMin, setPriceMin] = useState(5);
    const [priceMax, setPriceMax] = useState(200);
    const [selectedTiming, setSelectedTiming] = useState<
      'today' | 'next3days' | 'thisweek'
    >('today');

    // Memoize price range display
    const priceRangeText = useMemo(
      () => `$${priceMin} - $${priceMax}`,
      [priceMin, priceMax],
    );

    // Memoize range progress styles
    const rangeProgressStyle = useMemo(
      () => ({
        left: `${(priceMin / 300) * 100}%`,
        width: `${((priceMax - priceMin) / 300) * 100}%`,
      }),
      [priceMin, priceMax],
    );

    // Memoize handlers
    const handleApply = useCallback(() => {
      onApply({
        category: selectedCategory,
        priceRange: { min: priceMin, max: priceMax },
        timing: selectedTiming,
      });
      onClose();
    }, [
      selectedCategory,
      priceMin,
      priceMax,
      selectedTiming,
      onApply,
      onClose,
    ]);

    const handleClear = useCallback(() => {
      setSelectedCategory('All');
      setPriceMin(5);
      setPriceMax(200);
      setSelectedTiming('today');
    }, []);

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
                        selectedCategory === category &&
                          styles.chipTextSelected,
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
                <Text style={styles.priceRange}>{priceRangeText}</Text>
              </View>
              <View style={styles.rangeContainer}>
                <View style={styles.rangeTrack} />
                <View
                  style={[
                    styles.rangeProgress,
                    rangeProgressStyle as ViewStyle,
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
  },
  (prevProps, nextProps) =>
    prevProps.visible === nextProps.visible &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.onApply === nextProps.onApply,
);

FilterBottomSheet.displayName = 'FilterBottomSheet';

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay.heavy,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.utility.white,
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
    backgroundColor: COLORS.border.default,
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
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  chipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: `${COLORS.brand.primary}20`,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  chipTextSelected: {
    color: COLORS.brand.primary,
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
    backgroundColor: COLORS.bg.primary,
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  rangeProgress: {
    position: 'absolute',
    top: '50%',
    height: 4,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg.primary,
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
    backgroundColor: COLORS.utility.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  segmentButtonTextSelected: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
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
    color: COLORS.text.primary,
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});
