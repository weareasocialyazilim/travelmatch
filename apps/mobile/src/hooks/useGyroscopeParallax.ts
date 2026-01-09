/**
 * useGyroscopeParallax - Premium Glass Reflection Effect
 *
 * Adds subtle light reflection to glass elements based on device tilt.
 * Creates realistic glass material interaction.
 *
 * Features:
 * - Gyroscope-based parallax (2-3px movement)
 * - White semi-transparent overlay
 * - Smooth interpolation
 * - Auto cleanup
 *
 * @example
 * ```tsx
 * const { overlayStyle } = useGyroscopeParallax();
 *
 * <View style={styles.card}>
 *   <Animated.View style={[styles.glassOverlay, overlayStyle]} />
 * </View>
 * ```
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

// Mock gyroscope for web/simulator
const createMockGyroscope = () => ({
  setUpdateInterval: () => {},
  addListener: () => ({ remove: () => {} }),
});

// Lazy load gyroscope for native only
let Gyroscope: any = null;
if (Platform.OS !== 'web') {
  try {
    Gyroscope = require('expo-sensors').Gyroscope;
  } catch (_e) {
    Gyroscope = createMockGyroscope();
  }
} else {
  Gyroscope = createMockGyroscope();
}

interface UseGyroscopeParallaxOptions {
  /** Movement range in pixels (default: 3) */
  range?: number;
  /** Enable parallax effect (default: true) */
  enabled?: boolean;
}

export const useGyroscopeParallax = (options?: UseGyroscopeParallaxOptions) => {
  const { range = 3, enabled = true } = options || {};

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (!enabled || !Gyroscope) return;

    // Set update interval to 100ms for smooth but not excessive updates
    Gyroscope.setUpdateInterval(100);

    const subscription = Gyroscope.addListener((data: any) => {
      // Smooth spring animation for natural feel
      x.value = withSpring(data.y * range * 10, {
        damping: 20,
        stiffness: 90,
      });
      y.value = withSpring(data.x * range * 10, {
        damping: 20,
        stiffness: 90,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, [enabled, range, x, y]);

  const overlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(x.value, [-range, range], [-range, range]) },
      { translateY: interpolate(y.value, [-range, range], [-range, range]) },
    ],
  }));

  return {
    overlayStyle,
    parallaxStyle,
  };
};
