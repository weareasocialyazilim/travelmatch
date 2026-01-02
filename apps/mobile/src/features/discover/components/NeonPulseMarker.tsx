/**
 * NeonPulseMarker Component
 *
 * Awwwards-standard map marker with neon glow and pulse animation.
 * Used for highlighting moments on the immersive map experience.
 *
 * Features:
 * - Neon glow effect with pulsing animation
 * - Price badge display
 * - Selected state with enhanced glow
 * - Dark mode optimized
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/typography';

interface NeonPulseMarkerProps {
  /** Price to display on the marker */
  price?: string;
  /** Whether this marker is currently selected */
  isSelected?: boolean;
  /** Custom color for the marker (defaults to primary) */
  color?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Neon pulse map marker with animated glow effect.
 */
export const NeonPulseMarker: React.FC<NeonPulseMarkerProps> = ({
  price,
  isSelected = false,
  color,
  size = 'medium',
}) => {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const glowIntensity = useSharedValue(isSelected ? 1 : 0);

  const markerColor = color ?? COLORS.primary;

  // Sizes based on variant
  const sizeConfig = {
    small: { marker: 32, pulse: 48, fontSize: 10 },
    medium: { marker: 44, pulse: 64, fontSize: 12 },
    large: { marker: 56, pulse: 80, fontSize: 14 },
  }[size];

  useEffect(() => {
    // Continuous pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
      ),
      -1, // Infinite repeat
      false,
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, [pulseScale, pulseOpacity]);

  useEffect(() => {
    glowIntensity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, glowIntensity]);

  // Animated styles for pulse ring
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Animated styles for glow intensity
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowIntensity.value, [0, 1], [0.4, 0.8]),
    shadowRadius: interpolate(glowIntensity.value, [0, 1], [8, 16]),
    transform: [{ scale: interpolate(glowIntensity.value, [0, 1], [1, 1.1]) }],
  }));

  return (
    <View style={styles.container}>
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: sizeConfig.pulse,
            height: sizeConfig.pulse,
            borderRadius: sizeConfig.pulse / 2,
            borderColor: markerColor,
          },
          pulseStyle,
        ]}
      />

      {/* Main marker with glow */}
      <Animated.View
        style={[
          styles.marker,
          {
            width: sizeConfig.marker,
            height: sizeConfig.marker,
            borderRadius: sizeConfig.marker / 2,
            backgroundColor: markerColor,
            shadowColor: markerColor,
          },
          glowStyle,
        ]}
      >
        {/* Inner gradient overlay */}
        <View style={styles.innerGlow} />

        {/* Price label */}
        {price && (
          <Text
            style={[
              styles.priceText,
              { fontSize: sizeConfig.fontSize },
            ]}
            numberOfLines={1}
          >
            {price}
          </Text>
        )}
      </Animated.View>

      {/* Selection indicator */}
      {isSelected && (
        <View
          style={[
            styles.selectionRing,
            {
              width: sizeConfig.marker + 8,
              height: sizeConfig.marker + 8,
              borderRadius: (sizeConfig.marker + 8) / 2,
              borderColor: markerColor,
            },
          ]}
        />
      )}
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
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  priceText: {
    color: COLORS.white,
    fontFamily: FONTS.body.semibold,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectionRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});

export default NeonPulseMarker;
