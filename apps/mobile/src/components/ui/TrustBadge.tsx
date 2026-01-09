/**
 * TrustBadge - Premium Verified Badge with Shimmer Effect
 *
 * Features:
 * - Periodic glint/shimmer effect (every 5s)
 * - Premium trust indication
 * - Smooth animations
 *
 * @example
 * ```tsx
 * <TrustBadge size={18} />
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

interface TrustBadgeProps {
  /** Icon size */
  size?: number;
  /** Custom color */
  color?: string;
  /** Enable pulse animation (default: true) */
  pulse?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  size = 18,
  color = COLORS.trust.primary,
  pulse = true,
}) => {
  // Shimmer animation value
  const shimmerTranslateX = useSharedValue(-50);
  const shimmerOpacity = useSharedValue(0);

  // Pulse animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    // Shimmer effect every 5 seconds
    shimmerTranslateX.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(50, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(-50, { duration: 0 }),
          withDelay(4200, withTiming(-50, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    shimmerOpacity.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) }),
          withDelay(4200, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    // Pulse effect - heartbeat rhythm
    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [shimmerTranslateX, shimmerOpacity, pulseScale, pulseOpacity, pulse]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
    opacity: shimmerOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pulse ring */}
      {pulse && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size * 1.6,
              height: size * 1.6,
              borderRadius: (size * 1.6) / 2,
              borderWidth: 2,
              borderColor: color,
            },
            pulseStyle,
          ]}
        />
      )}

      {/* Icon */}
      <MaterialCommunityIcons name="check-decagram" size={size} color={color} />

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: size * 0.4,
            height: size * 1.2,
          },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pulseRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
