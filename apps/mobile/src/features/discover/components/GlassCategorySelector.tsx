/**
 * GlassCategorySelector Component
 *
 * Awwwards-standard category selector with glass texture chips and neon selection highlights.
 * Selecting categories feels like an interactive game for users.
 *
 * Features:
 * - Glass/frosted texture on chips
 * - Neon glow effect on selected state
 * - Silk-like smooth transitions
 * - Haptic feedback on selection
 */
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface GlassCategory {
  id: string;
  label: string;
  key: string;
}

const CATEGORIES: GlassCategory[] = [
  { id: '1', label: '🏖️ Sahil', key: 'beach' },
  { id: '2', label: '⛰️ Doğa', key: 'nature' },
  { id: '3', label: '🍷 Gastronomi', key: 'food' },
  { id: '4', label: '💃 Gece Hayatı', key: 'nightlife' },
  { id: '5', label: '🎨 Kültür', key: 'culture' },
  { id: '6', label: '🎵 Müzik', key: 'music' },
  { id: '7', label: '💆 Wellness', key: 'wellness' },
  { id: '8', label: '🏃 Spor', key: 'sports' },
];

interface GlassCategorySelectorProps {
  /** Currently selected category key */
  selected?: string;
  /** Callback when a category is selected */
  onSelect?: (categoryKey: string) => void;
  /** Custom categories (optional, overrides default) */
  categories?: GlassCategory[];
  /** Whether to allow multiple selections */
  multiSelect?: boolean;
  /** Selected keys for multi-select mode */
  selectedKeys?: string[];
  /** Callback for multi-select mode */
  onMultiSelect?: (keys: string[]) => void;
}

/**
 * Individual glass chip component with neon glow animation
 */
const GlassChip: React.FC<{
  category: GlassCategory;
  isActive: boolean;
  onPress: () => void;
}> = ({ category, isActive, onPress }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    glowOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, glowOpacity]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: interpolate(glowOpacity.value, [0, 1], [0, 0.6]),
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[styles.chipContainer, animatedStyle]}
    >
      {/* Neon glow layer (behind the chip) */}
      <Animated.View style={[styles.neonGlow, glowStyle]} />

      {/* Glass chip */}
      <View style={[styles.chip, isActive && styles.activeChip]}>
        {/* Glass overlay effect */}
        <View style={styles.glassOverlay} />

        {/* Content */}
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {category.label}
        </Text>

        {/* Inner highlight for depth */}
        <View style={styles.innerHighlight} />
      </View>
    </AnimatedTouchable>
  );
};

/**
 * Awwwards-standard glass category selector.
 * Features neon glow on selected items and silky glass texture.
 */
export const GlassCategorySelector: React.FC<GlassCategorySelectorProps> = ({
  selected: selectedProp,
  onSelect,
  categories = CATEGORIES,
  multiSelect = false,
  selectedKeys = [],
  onMultiSelect,
}) => {
  const [internalSelected, setInternalSelected] = useState('beach');
  const selected = selectedProp ?? internalSelected;

  const handleSelect = useCallback(
    (categoryKey: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (multiSelect && onMultiSelect) {
        const newKeys = selectedKeys.includes(categoryKey)
          ? selectedKeys.filter((k) => k !== categoryKey)
          : [...selectedKeys, categoryKey];
        onMultiSelect(newKeys);
      } else {
        if (onSelect) {
          onSelect(categoryKey);
        } else {
          setInternalSelected(categoryKey);
        }
      }
    },
    [multiSelect, onMultiSelect, selectedKeys, onSelect],
  );

  const isSelected = useCallback(
    (key: string) => {
      if (multiSelect) {
        return selectedKeys.includes(key);
      }
      return selected === key;
    },
    [multiSelect, selectedKeys, selected],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {categories.map((cat) => (
          <GlassChip
            key={cat.id}
            category={cat}
            isActive={isSelected(cat.key)}
            onPress={() => handleSelect(cat.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -20, // Extend to screen edges
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
  },
  chipContainer: {
    position: 'relative',
  },
  // Neon glow effect layer
  neonGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  // Base chip styles - glass texture
  chip: {
    position: 'relative',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  // Glass overlay for frosted effect
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
  },
  // Inner highlight for glass depth
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  // Active chip state with neon border
  activeChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  // Label styles
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: TYPOGRAPHY.styles?.body2?.fontFamily ?? 'System',
    fontWeight: '500',
    position: 'relative',
    zIndex: 1,
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '700',
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default GlassCategorySelector;
