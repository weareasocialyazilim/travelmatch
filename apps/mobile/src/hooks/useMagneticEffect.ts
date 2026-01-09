/**
 * useMagneticEffect - Magnetic Button Interaction
 *
 * Creates a "magnetic" pull effect where UI elements subtly move toward
 * the user's finger as it approaches, similar to Apple Vision Pro interactions.
 *
 * Features:
 * - Pan gesture tracking
 * - Distance-based attraction (2-3px pull)
 * - Smooth spring animations
 * - Configurable attraction radius
 * - Glow intensity on proximity
 *
 * Usage:
 * const { magneticStyle, panGestureHandler } = useMagneticEffect({
 *   attractionRadius: 60,
 *   maxPull: 3,
 * });
 */

import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

interface MagneticEffectConfig {
  /** Radius in pixels where magnetic effect activates (default: 60) */
  attractionRadius?: number;
  /** Maximum pull distance in pixels (default: 3) */
  maxPull?: number;
  /** Enable haptic feedback on attraction (default: true) */
  enableHaptics?: boolean;
  /** Spring configuration damping (default: 15) */
  springDamping?: number;
  /** Spring configuration stiffness (default: 150) */
  springStiffness?: number;
  /** Enable glow effect on proximity (default: true) */
  enableGlow?: boolean;
}

export const useMagneticEffect = ({
  attractionRadius = 60,
  maxPull = 3,
  enableHaptics = true,
  springDamping = 15,
  springStiffness = 150,
  enableGlow = true,
}: MagneticEffectConfig = {}) => {
  // Shared values for finger position
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);
  const isNearby = useSharedValue(false);

  // Button center position (will be set on layout)
  const buttonCenterX = useSharedValue(0);
  const buttonCenterY = useSharedValue(0);

  // Haptic feedback flag (prevent rapid firing)
  const hasTriggeredHaptic = useSharedValue(false);

  /**
   * Calculate distance between two points
   */
  const calculateDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number => {
    'worklet';
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Pan gesture handler to track finger position
   */
  const panGestureHandler = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      fingerX.value = event.x;
      fingerY.value = event.y;

      const distance = calculateDistance(
        fingerX.value,
        fingerY.value,
        buttonCenterX.value,
        buttonCenterY.value,
      );

      const wasNearby = isNearby.value;
      isNearby.value = distance <= attractionRadius;

      // Trigger haptic on first entry into attraction zone
      if (
        enableHaptics &&
        !wasNearby &&
        isNearby.value &&
        !hasTriggeredHaptic.value
      ) {
        hasTriggeredHaptic.value = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd(() => {
      'worklet';
      isNearby.value = false;
      hasTriggeredHaptic.value = false;
    });

  /**
   * Animated style for magnetic pull effect
   */
  const magneticStyle = useAnimatedStyle(() => {
    if (!isNearby.value) {
      return {
        transform: [
          {
            translateX: withSpring(0, {
              damping: springDamping,
              stiffness: springStiffness,
            }),
          },
          {
            translateY: withSpring(0, {
              damping: springDamping,
              stiffness: springStiffness,
            }),
          },
        ],
      };
    }

    // Calculate direction vector from button to finger
    const dx = fingerX.value - buttonCenterX.value;
    const dy = fingerY.value - buttonCenterY.value;
    const distance = calculateDistance(
      fingerX.value,
      fingerY.value,
      buttonCenterX.value,
      buttonCenterY.value,
    );

    // Calculate pull intensity based on proximity (closer = stronger pull)
    const pullIntensity = interpolate(
      distance,
      [0, attractionRadius],
      [1, 0],
      Extrapolation.CLAMP,
    );

    // Normalize direction and apply pull
    const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
    const pullX = (dx / magnitude) * maxPull * pullIntensity;
    const pullY = (dy / magnitude) * maxPull * pullIntensity;

    return {
      transform: [
        {
          translateX: withSpring(pullX, {
            damping: springDamping,
            stiffness: springStiffness,
          }),
        },
        {
          translateY: withSpring(pullY, {
            damping: springDamping,
            stiffness: springStiffness,
          }),
        },
      ],
    };
  });

  /**
   * Animated style for glow effect
   */
  const glowStyle = useAnimatedStyle(() => {
    if (!enableGlow) return { opacity: 0 };

    const distance = calculateDistance(
      fingerX.value,
      fingerY.value,
      buttonCenterX.value,
      buttonCenterY.value,
    );

    // Glow intensity increases as finger gets closer
    const glowIntensity = interpolate(
      distance,
      [0, attractionRadius],
      [0.6, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: withSpring(isNearby.value ? glowIntensity : 0, {
        damping: 20,
        stiffness: 90,
      }),
    };
  });

  /**
   * Callback to set button position (call in onLayout)
   */
  const setButtonCenter = useCallback(
    (x: number, y: number) => {
      buttonCenterX.value = x;
      buttonCenterY.value = y;
    },
    [buttonCenterX, buttonCenterY],
  );

  return {
    magneticStyle,
    glowStyle,
    panGestureHandler,
    setButtonCenter,
    isNearby,
  };
};
