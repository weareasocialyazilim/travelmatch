/**
 * FilterModal Component
 * Dating & Gifting Platform Filters
 *
 * MASTER Revizyonu:
 * - Seyahat filtreleri (Otel, Uçuş) kaldırıldı
 * - Dating filtreleri eklendi (Yaş, Cinsiyet, Mesafe)
 * - searchStore ile Single Source of Truth entegrasyonu
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticManager } from '@/services/HapticManager';
import { COLORS, primitives } from '@/constants/colors';
import type { PriceRange } from './types';

// Moment-specific categories (no travel filters)
const MOMENT_CATEGORIES = [
  { id: 'all', label: 'Tümü', emoji: '✨', icon: 'star-outline' },
  {
    id: 'gastronomy',
    label: 'Gastronomi',
    emoji: '🍽️',
    icon: 'food-fork-drink',
  },
  { id: 'art', label: 'Sanat', emoji: '🎨', icon: 'palette' },
  { id: 'music', label: 'Müzik', emoji: '🎵', icon: 'music-note' },
  { id: 'nature', label: 'Doğa', emoji: '🌿', icon: 'tree' },
  {
    id: 'nightlife',
    label: 'Gece Hayatı',
    emoji: '🌙',
    icon: 'moon-waning-crescent',
  },
  { id: 'culture', label: 'Kültür', emoji: '🏛️', icon: 'bank' },
  { id: 'adventure', label: 'Macera', emoji: '🧗', icon: 'hiking' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘', icon: 'meditation' },
];

// Gift range options aligned with Chat Lock tiers (0-30-100)
const GIFT_RANGE_OPTIONS = [
  { min: 0, max: 30, label: '₺0-30', tier: 'support', description: 'Destek' },
  {
    min: 30,
    max: 100,
    label: '₺30-100',
    tier: 'candidate',
    description: 'Chat Adayı',
  },
  {
    min: 100,
    max: 999999,
    label: '₺100+',
    tier: 'premium',
    description: 'Premium',
  },
  {
    min: 0,
    max: 999999,
    label: 'Tümü',
    tier: 'all',
    description: 'Tüm Hediyeler',
  },
];

// Gender options for dating
const GENDER_OPTIONS = [
  { id: 'all', label: 'Herkes', icon: 'account-group' },
  { id: 'female', label: 'Kadın', icon: 'gender-female' },
  { id: 'male', label: 'Erkek', icon: 'gender-male' },
  { id: 'non-binary', label: 'Diğer', icon: 'gender-non-binary' },
];

const SORT_OPTIONS = [
  { id: 'nearest', label: 'En Yakın', icon: 'map-marker' },
  { id: 'newest', label: 'En Yeni', icon: 'clock-outline' },
  { id: 'gift_low', label: 'Hediye ↑', icon: 'arrow-up' },
  { id: 'gift_high', label: 'Hediye ↓', icon: 'arrow-down' },
  { id: 'popular', label: 'Popüler', icon: 'fire' },
];

// Distance options with Global
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 500];

// Age range limits
const AGE_MIN = 18;
const AGE_MAX = 99;

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
  selectedGender?: string;
  setSelectedGender?: (gender: string) => void;
  ageRange?: [number, number];
  setAgeRange?: (range: [number, number]) => void;
}

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
  selectedGender = 'all',
  setSelectedGender,
  ageRange = [18, 99],
  setAgeRange,
}) => {
  // Local state for age slider
  const [localAgeMin, setLocalAgeMin] = useState(ageRange[0]);
  const [localAgeMax, setLocalAgeMax] = useState(ageRange[1]);

  useEffect(() => {
    setLocalAgeMin(ageRange[0]);
    setLocalAgeMax(ageRange[1]);
  }, [ageRange]);

  const handleReset = () => {
    setSelectedCategory('all');
    setSortBy('nearest');
    setMaxDistance(500); // Global by default
    setPriceRange({ min: 0, max: 999999 }); // Default: all gift ranges
    setSelectedGender?.('all');
    setAgeRange?.([18, 99]);
    setLocalAgeMin(18);
    setLocalAgeMax(99);
    HapticManager.buttonPress();
  };

  const handleApply = () => {
    // Apply age range
    if (setAgeRange) {
      setAgeRange([localAgeMin, localAgeMax]);
    }
    HapticManager.filterApplied();
    onClose();
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender?.(gender);
    HapticManager.buttonPress();
  };

  const handleDistanceSelect = (distance: number) => {
    setMaxDistance(distance);
    HapticManager.buttonPress();
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
            <Text style={styles.title}>Filtreler</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Gender Selection - Dating Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Kimlerle Tanışmak İstiyorsun?
              </Text>
              <View style={styles.genderOptions}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.genderChip,
                      selectedGender === option.id && styles.genderChipActive,
                    ]}
                    onPress={() => handleGenderSelect(option.id)}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={18}
                      color={
                        selectedGender === option.id
                          ? COLORS.utility.white
                          : COLORS.text.primary
                      }
                    />
                    <Text
                      style={[
                        styles.genderChipText,
                        selectedGender === option.id &&
                          styles.genderChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Yaş Aralığı: {localAgeMin} -{' '}
                {localAgeMax === 99 ? '99+' : localAgeMax}
              </Text>
              <View style={styles.ageInputRow}>
                <View style={styles.ageInputContainer}>
                  <Text style={styles.ageInputLabel}>Min</Text>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      const newMin = Math.max(AGE_MIN, localAgeMin - 1);
                      setLocalAgeMin(newMin);
                      HapticManager.buttonPress();
                    }}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={20}
                      color={COLORS.text.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.ageValue}>{localAgeMin}</Text>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      const newMin = Math.min(localAgeMax - 1, localAgeMin + 1);
                      setLocalAgeMin(newMin);
                      HapticManager.buttonPress();
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={COLORS.text.primary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.ageSeparator}>
                  <Text style={styles.ageSeparatorText}>—</Text>
                </View>
                <View style={styles.ageInputContainer}>
                  <Text style={styles.ageInputLabel}>Max</Text>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      const newMax = Math.max(localAgeMin + 1, localAgeMax - 1);
                      setLocalAgeMax(newMax);
                      HapticManager.buttonPress();
                    }}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={20}
                      color={COLORS.text.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.ageValue}>
                    {localAgeMax === 99 ? '99+' : localAgeMax}
                  </Text>
                  <TouchableOpacity
                    style={styles.ageButton}
                    onPress={() => {
                      const newMax = Math.min(AGE_MAX, localAgeMax + 1);
                      setLocalAgeMax(newMax);
                      HapticManager.buttonPress();
                    }}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={COLORS.text.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Maksimum Mesafe:{' '}
                {maxDistance >= 500 ? 'Global' : `${maxDistance} km`}
              </Text>
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.distanceChip,
                      maxDistance === d && styles.distanceChipActive,
                    ]}
                    onPress={() => handleDistanceSelect(d)}
                  >
                    <Text
                      style={[
                        styles.distanceChipText,
                        maxDistance === d && styles.distanceChipTextActive,
                      ]}
                    >
                      {d >= 500 ? 'Global' : `${d} km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Moment Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anı Kategorisi</Text>
              <View style={styles.categoryGrid}>
                {MOMENT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      HapticManager.buttonPress();
                    }}
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

            {/* Gift Range - Aligned with Chat Lock tiers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Hediye Aralığı:{' '}
                {priceRange.min === 0 && priceRange.max === 999999
                  ? 'Tümü'
                  : `₺${priceRange.min} - ${priceRange.max >= 999999 ? '∞' : `₺${priceRange.max}`}`}
              </Text>
              <View style={styles.priceOptions}>
                {GIFT_RANGE_OPTIONS.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.priceChip,
                      priceRange.min === range.min &&
                        priceRange.max === range.max &&
                        styles.priceChipActive,
                    ]}
                    onPress={() => {
                      setPriceRange({ min: range.min, max: range.max });
                      HapticManager.buttonPress();
                    }}
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
                    <Text
                      style={[
                        styles.priceChipDescription,
                        priceRange.min === range.min &&
                          priceRange.max === range.max &&
                          styles.priceChipDescriptionActive,
                      ]}
                    >
                      {range.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sıralama</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      sortBy === option.id && styles.sortOptionActive,
                    ]}
                    onPress={() => {
                      setSortBy(option.id);
                      HapticManager.buttonPress();
                    }}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
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
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Uygula</Text>
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
  // Gender Selection Styles
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.grayLight,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderChipActive: {
    backgroundColor: COLORS.mint,
    borderColor: primitives.mint[600],
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  genderChipTextActive: {
    color: COLORS.utility.white,
  },
  // Age Range Styles
  ageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ageInputContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ageInputLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  ageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    minWidth: 36,
    textAlign: 'center',
  },
  ageSeparator: {
    paddingHorizontal: 16,
  },
  ageSeparatorText: {
    fontSize: 18,
    color: COLORS.text.tertiary,
  },
  priceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.grayLight,
    minWidth: 100,
    alignItems: 'center',
  },
  priceChipActive: {
    backgroundColor: COLORS.mint,
  },
  priceChipText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  priceChipTextActive: {
    color: COLORS.utility.white,
  },
  priceChipDescription: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  priceChipDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
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
