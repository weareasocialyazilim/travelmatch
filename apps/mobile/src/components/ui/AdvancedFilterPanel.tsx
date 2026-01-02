/**
 * AdvancedFilterPanel - Awwwards-Quality Filter Experience
 *
 * Premium filter panel featuring:
 * - Liquid Glass surfaces with GlassCard
 * - Neon selection highlights with glow effects
 * - AI optimization toggle
 * - Premium typography with Clash Display + Satoshi
 * - Turkish localization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { SPACING } from '@/constants/spacing';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { useTranslation } from '@/hooks/useTranslation';
import { useSearchStore } from '@/stores/searchStore';
import { GlassCard } from './GlassCard';
import type { SearchFilters } from '@/stores/searchStore';

interface FilterPanelProps {
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}

// Experience types with Ionicons
const EXPERIENCE_TYPES = [
  { id: 'all', label: 'Tümü', icon: 'apps-outline' as const },
  { id: 'solo', label: 'Bireysel', icon: 'person-outline' as const },
  { id: 'group', label: 'Grup', icon: 'people-outline' as const },
  { id: 'vip', label: 'Premium', icon: 'diamond-outline' as const },
];

// Categories with Material Community Icons
const CATEGORIES = [
  { id: 'adventure', label: 'Macera', icon: 'hiking' as const },
  { id: 'culture', label: 'Kültür', icon: 'bank' as const },
  { id: 'food', label: 'Yemek', icon: 'food' as const },
  { id: 'nature', label: 'Doğa', icon: 'tree' as const },
  { id: 'nightlife', label: 'Gece Hayatı', icon: 'glass-cocktail' as const },
  { id: 'shopping', label: 'Alışveriş', icon: 'shopping' as const },
  { id: 'sports', label: 'Spor', icon: 'basketball' as const },
  { id: 'wellness', label: 'Wellness', icon: 'spa' as const },
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
  } = useSearchStore();

  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [selectedType, setSelectedType] = useState('all');
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleApply = () => {
    setFilters(localFilters);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    setSelectedType('all');
    clearFilters();
  };

  const toggleCategory = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  };

  const selectPriceRange = (min?: number, max?: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const activeCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kişiselleştir</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Experience Type Selection - Glass Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DENEYİM TÜRÜ</Text>
          <View style={styles.typeGrid}>
            {EXPERIENCE_TYPES.map((type) => {
              const isActive = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  style={styles.typeGridItem}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    intensity={isActive ? 40 : 15}
                    tint="light"
                    style={[
                      styles.typeCard,
                      isActive && styles.typeCardActive,
                    ]}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={isActive ? COLORS.primary : COLORS.text.secondary}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        isActive && styles.typeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Categories - Neon Pills */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KATEGORİ</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((category) => {
              const isSelected = localFilters.category === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.chip,
                    isSelected && styles.chipActive,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={category.icon}
                    size={18}
                    color={isSelected ? COLORS.white : COLORS.text.secondary}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price Range - Barometer Slider Mock */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>BÜTÇE ARALIĞI</Text>
            <Text style={styles.rangeValue}>
              {localFilters.minPrice !== undefined
                ? `$${localFilters.minPrice} - ${localFilters.maxPrice ? `$${localFilters.maxPrice}` : '$300+'}`
                : '$0 - $300+'}
            </Text>
          </View>

          {/* Slider Visual */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={styles.sliderProgress} />
              <View style={[styles.sliderHandle, { left: '15%' }]} />
              <View style={[styles.sliderHandle, { left: '75%' }]} />
            </View>
          </View>

          {/* Price Pills */}
          <View style={styles.priceGrid}>
            {PRICE_RANGES.map((range) => {
              const isSelected =
                localFilters.minPrice === range.min &&
                localFilters.maxPrice === range.max;
              return (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.pricePill,
                    isSelected && styles.pricePillActive,
                  ]}
                  onPress={() => selectPriceRange(range.min, range.max)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.priceText,
                      isSelected && styles.priceTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI Optimization Toggle - Glass Card */}
        <GlassCard intensity={20} tint="light" style={styles.aiToggleCard}>
          <View style={styles.aiInfo}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Optimizasyonu</Text>
              <Text style={styles.aiDesc}>
                Tercihlerine göre en iyi anları öne çıkar.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setAiEnabled(!aiEnabled)}
            style={[
              styles.switchTrack,
              aiEnabled && styles.switchTrackActive,
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.switchThumb,
                aiEnabled && styles.switchThumbActive,
              ]}
            />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={activeCount === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resetText,
              activeCount === 0 && styles.resetTextDisabled,
            ]}
          >
            Sıfırla
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.gift as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyButtonGradient}
          >
            <Text style={styles.applyButtonText}>
              Sonuçları Gör {activeCount > 0 && `(${activeCount})`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: FONT_SIZES_V2.h2,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    padding: 24,
    paddingBottom: 32,
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono.medium,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeValue: {
    fontSize: 12,
    fontFamily: FONTS.mono.medium,
    color: COLORS.primary,
  },

  // Experience Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeGridItem: {
    width: '48%',
  },
  typeCard: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    // Neon glow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  typeLabel: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: COLORS.text.primary,
  },

  // Category Chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: COLORS.surface.muted,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    // Neon glow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
  },
  chipTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },

  // Slider
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.surface.muted,
    borderRadius: 2,
    position: 'relative',
  },
  sliderProgress: {
    position: 'absolute',
    left: '15%',
    right: '25%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sliderHandle: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
    // Neon glow on handles
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },

  // Price Pills
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pricePill: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface.muted,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  pricePillActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  priceText: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.mono.medium,
    color: COLORS.text.secondary,
  },
  priceTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // AI Toggle Card
  aiToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  aiDesc: {
    fontSize: 11,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  // Switch
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface.muted,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: COLORS.secondary,
    // Neon glow
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  resetButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: COLORS.surface.muted,
  },
  resetText: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  resetTextDisabled: {
    color: COLORS.text.muted,
  },
  applyButton: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    // Neon glow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  applyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  applyButtonText: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.bold,
    fontWeight: '700',
    color: COLORS.white,
  },
});
