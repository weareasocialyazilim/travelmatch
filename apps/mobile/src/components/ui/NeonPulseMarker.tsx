// components/ui/NeonPulseMarker.tsx
// TravelMatch Ultimate Design System 2026
// Neon Pulse Marker - GenZ "Breathing Neon" animation for map moments
// Awwwards standard animated marker component

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING, BORDER } from '@/constants/spacing';

type MarkerSize = 'sm' | 'md' | 'lg';

interface NeonPulseMarkerProps {
  /** Price or label to display */
  price: string;
  /** Whether this marker is currently selected */
  isSelected?: boolean;
  /** Size variant */
  size?: MarkerSize;
  /** Custom accent color (overrides default) */
  accentColor?: string;
  /** Disable breathing animation */
  animated?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * NeonPulseMarker
 *
 * Harita üzerindeki Moment'leri temsil eden parlayan marker.
 * Awwwards standardında "Breathing Neon" animasyonu içerir.
 * GenZ estetiğine uygun pulse/glow efekti.
 *
 * @example
 * ```tsx
 * <NeonPulseMarker price="₺250" />
 * <NeonPulseMarker price="₺1,500" isSelected />
 * <NeonPulseMarker price="₺99" size="sm" animated={false} />
 * ```
 */
export const NeonPulseMarker: React.FC<NeonPulseMarkerProps> = ({
  price,
  isSelected = false,
  size = 'md',
  accentColor,
  animated = true,
  testID,
}) => {
  // Breathing animation value (0 to 1)
  const breathe = useSharedValue(0);

  // Start breathing animation
  useEffect(() => {
    if (!animated) {
      breathe.value = 0;
      return;
    }

    // Nefes alma animasyonu - 2s in, 2s out, continuous loop
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1, // Infinite repeat
      false // Don't reverse
    );
  }, [animated, breathe]);

  // Animated style for pulse ring
  const pulseRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1, 1.5]);
    const opacity = interpolate(breathe.value, [0, 1], [0.6, 0]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Animated glow effect for marker body
  const glowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(breathe.value, [0, 1], [0.3, 0.5]);

    return {
      shadowOpacity: glowOpacity,
    };
  });

  // Secondary pulse ring animation (outer glow)
  const outerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1, 1.8]);
    const opacity = interpolate(breathe.value, [0, 1], [0.3, 0]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Size configurations
  const sizeConfig = {
    sm: {
      container: { width: 48, height: 48 },
      ring: { width: 32, height: 32 },
      body: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
      arrow: { borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 6 },
      fontSize: TYPOGRAPHY.labelXSmall,
    },
    md: {
      container: { width: 60, height: 60 },
      ring: { width: 40, height: 40 },
      body: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
      arrow: { borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 8 },
      fontSize: TYPOGRAPHY.labelSmall,
    },
    lg: {
      container: { width: 72, height: 72 },
      ring: { width: 52, height: 52 },
      body: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
      arrow: { borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 10 },
      fontSize: TYPOGRAPHY.label,
    },
  };

  const config = sizeConfig[size];

  // Determine colors based on selection state
  const primaryColor = accentColor || (isSelected ? COLORS.secondary : COLORS.primary);
  const bodyBg = isSelected ? COLORS.secondary : COLORS.surface.base;
  const borderColor = isSelected ? COLORS.textOnDark : primaryColor;
  const textColor = isSelected ? COLORS.textOnDark : COLORS.text.primary;

  return (
    <View style={[styles.container, config.container]} testID={testID}>
      {/* Pulse Ring - Breathing Effect */}
      <Animated.View
        style={[
          styles.pulseRing,
          config.ring,
          { backgroundColor: primaryColor },
          pulseRingStyle,
        ]}
      />

      {/* Secondary Pulse Ring (outer glow) */}
      {animated && (
        <Animated.View
          style={[
            styles.pulseRingOuter,
            {
              width: config.ring.width + 16,
              height: config.ring.height + 16,
              backgroundColor: primaryColor,
            },
            outerRingStyle,
          ]}
        />
      )}

      {/* Main Marker Body */}
      <Animated.View
        style={[
          styles.markerBody,
          config.body,
          {
            backgroundColor: bodyBg,
            borderColor: borderColor,
            shadowColor: primaryColor,
          },
          glowStyle,
        ]}
      >
        <Text
          style={[
            styles.priceText,
            config.fontSize,
            { color: textColor },
          ]}
          numberOfLines={1}
        >
          {price}
        </Text>
      </Animated.View>

      {/* Arrow Pointer */}
      <View
        style={[
          styles.arrow,
          {
            borderLeftWidth: config.arrow.borderLeftWidth,
            borderRightWidth: config.arrow.borderRightWidth,
            borderBottomWidth: config.arrow.borderBottomWidth,
            borderBottomColor: isSelected ? COLORS.secondary : primaryColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: RADIUS.full,
    zIndex: -1,
  },
  pulseRingOuter: {
    position: 'absolute',
    borderRadius: RADIUS.full,
    zIndex: -2,
  },
  markerBody: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.md,
    borderWidth: BORDER.medium,
    borderColor: COLORS.primary,
    // Premium shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  priceText: {
    fontWeight: '800',
    textAlign: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
    marginTop: -1,
  },
});

export default NeonPulseMarker;
