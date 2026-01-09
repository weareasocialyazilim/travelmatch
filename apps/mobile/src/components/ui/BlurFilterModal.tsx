/**
 * BlurFilterModal Component
 * A stylish filter modal with blur background effect
 * Used for filtering vibes with price range, category, distance, age, and gender options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');

export interface FilterValues {
  priceRange?: number;
  price?: [number, number];
  category?: string;
  distance?: number;
  ageRange?: [number, number];
  age?: [number, number];
  gender?: string;
}

interface BlurFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterValues) => void;
  initialPriceRange?: number;
  initialCategory?: string;
  initialDistance?: number;
  initialAgeRange?: [number, number];
  initialGender?: string;
  resultCount?: number;
}

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$'];
const CATEGORIES = [
  'All',
  'Dining',
  'Nightlife',
  'Adventure',
  'Culture',
  'Relax',
];
const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Any', value: 100 },
];
const AGE_RANGES: { label: string; value: [number, number] }[] = [
  { label: '18-25', value: [18, 25] },
  { label: '26-35', value: [26, 35] },
  { label: '36-45', value: [36, 45] },
  { label: '46+', value: [46, 99] },
  { label: 'Any', value: [18, 99] },
];
const GENDER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
];

export const BlurFilterModal: React.FC<BlurFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialPriceRange = 2,
  initialCategory = 'All',
  initialDistance = 25,
  initialAgeRange = [18, 99],
  initialGender = 'all',
  resultCount = 24,
}) => {
  const insets = useSafeAreaInsets();
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [distance, setDistance] = useState(initialDistance);
  const [ageRange, setAgeRange] = useState<[number, number]>(initialAgeRange);
  const [gender, setGender] = useState(initialGender);

  const handleReset = () => {
    setPriceRange(2);
    setSelectedCategory('All');
    setDistance(25);
    setAgeRange([18, 99]);
    setGender('all');
  };

  const handleApply = () => {
    onApply?.({
      priceRange,
      category: selectedCategory,
      distance,
      ageRange,
      gender,
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <BlurView intensity={90} tint="dark" style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Vibes</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            {/* Distance */}
            <Text style={styles.sectionLabel}>Distance</Text>
            <View style={styles.optionRow}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionBtn,
                    distance === opt.value && styles.optionBtnActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDistance(opt.value);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      distance === opt.value && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Age Range */}
            <Text style={styles.sectionLabel}>Age Range</Text>
            <View style={styles.optionRow}>
              {AGE_RANGES.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.optionBtn,
                    ageRange[0] === opt.value[0] &&
                      ageRange[1] === opt.value[1] &&
                      styles.optionBtnActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAgeRange(opt.value);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageRange[0] === opt.value[0] &&
                        ageRange[1] === opt.value[1] &&
                        styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gender */}
            <Text style={styles.sectionLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.genderBtn,
                    gender === opt.value && styles.genderBtnActive,
                  ]}
                  onPress={() => setGender(opt.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === opt.value && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <Text style={styles.sectionLabel}>Price Range</Text>
            <View style={styles.priceRow}>
              {PRICE_LABELS.map((label, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.priceBtn,
                    priceRange === index + 1 && styles.priceBtnActive,
                  ]}
                  onPress={() => setPriceRange(index + 1)}
                >
                  <Text
                    style={[
                      styles.priceText,
                      priceRange === index + 1 && styles.priceTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.tagsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.tag,
                    selectedCategory === cat && styles.tagActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedCategory === cat && styles.tagTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Show {resultCount} Vibes</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingBottom: 8,
    backgroundColor: 'rgba(10,10,10,0.95)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  resetText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: COLORS.brand.primary,
  },
  optionText: {
    color: 'white',
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.brand.primary,
    fontWeight: 'bold',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: COLORS.brand.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceBtn: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priceBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: COLORS.brand.primary,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceTextActive: {
    color: COLORS.brand.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagActive: {
    backgroundColor: COLORS.brand.secondary,
    borderColor: COLORS.brand.secondary,
  },
  tagText: {
    color: 'white',
  },
  tagTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  applyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default BlurFilterModal;
