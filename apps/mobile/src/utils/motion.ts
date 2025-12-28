/**
 * TravelMatch Ultimate Design System - Motion
 *
 * "Unified Physics" - Single spring config across entire app
 *
 * Principles:
 * 1. Same physics everywhere (button, sheet, card)
 * 2. Haptics for "satisfaction" not "clicks"
 * 3. Shared element transitions for continuity
 *
 * Note: This module complements the existing animations.ts and haptics.ts
 * - Use SPRING configs for physics-based animations
 * - Use TIMING for duration-based animations
 * - Use HAPTIC for haptic feedback (wraps haptics.ts)
 */

import { useCallback, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  SharedValue as _SharedValue,
  runOnJS as _runOnJS,
} from 'react-native-reanimated';
import {
  triggerHaptic as _triggerHaptic,
  HapticType,
  smartHaptic,
} from './haptics';

// ═══════════════════════════════════════════════════
// SPRING CONFIGS - "Unified Physics"
// ═══════════════════════════════════════════════════
export const SPRING = {
  // Main spring - USE THIS EVERYWHERE
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Fast response (buttons)
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },

  // Soft (sheets, modals)
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
  },

  // Bouncy (celebration, success)
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 0.9,
  },
} as const;

export type SpringType = keyof typeof SPRING;

// ═══════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════
export const TIMING = {
  instant: 100,
  fast: 200,
  default: 300,
  slow: 500,

  // Easing functions
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeOut: Easing.bezier(0, 0, 0.58, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
} as const;

// ═══════════════════════════════════════════════════
// HAPTICS - "Satisfaction" feedback
// Wraps existing haptics.ts for convenience
// ═══════════════════════════════════════════════════
export const HAPTIC = {
  light: () => smartHaptic(HapticType.LIGHT),
  medium: () => smartHaptic(HapticType.MEDIUM),
  heavy: () => smartHaptic(HapticType.HEAVY),
  success: () => smartHaptic(HapticType.SUCCESS),
  error: () => smartHaptic(HapticType.ERROR),
  warning: () => smartHaptic(HapticType.WARNING),
  selection: () => smartHaptic(HapticType.SELECTION),
} as const;

// ═══════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════

/**
 * Press animation for buttons/cards
 * Enhanced version with haptic feedback
 */
export const usePressAnimation = (scaleValue = 0.96) => {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, SPRING.snappy);
    void HAPTIC.light();
  }, [scale, scaleValue]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, onPressIn, onPressOut, animatedStyle };
};

/**
 * Fade + slide up entrance
 */
export const useFadeSlideUp = (delay = 0, translateY = 20) => {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default }),
    );
    translate.value = withDelay(delay, withSpring(0, SPRING.gentle));
  }, [delay, opacity, translate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return { opacity, translate, animatedStyle };
};

/**
 * Staggered list item entrance
 */
export const useStaggeredItem = (index: number, staggerDelay = 50) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = index * staggerDelay;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default }),
    );
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
  }, [index, opacity, staggerDelay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { opacity, translateY, animatedStyle };
};

/**
 * Pulse animation for CTAs
 */
export const usePulse = (minScale = 1, maxScale = 1.03, duration = 2000) => {
  const scale = useSharedValue(minScale);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration }),
        withTiming(minScale, { duration }),
      ),
      -1,
      false,
    );
  }, [duration, maxScale, minScale, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, animatedStyle };
};

/**
 * Trust ring shimmer effect
 */
export const useShimmer = (enabled = true) => {
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    if (enabled) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 800 }),
        ),
        -1,
        true,
      );
    }
  }, [enabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, animatedStyle };
};

/**
 * Shake animation for errors
 * Enhanced version with haptic feedback
 */
export const useShake = () => {
  const translateX = useSharedValue(0);

  const shake = useCallback(() => {
    translateX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 100 }),
      withTiming(-6, { duration: 100 }),
      withTiming(6, { duration: 100 }),
      withTiming(0, { duration: 50 }),
    );
    void HAPTIC.error();
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { translateX, shake, animatedStyle };
};

/**
 * Success bounce for confirmations
 */
export const useSuccessBounce = () => {
  const scale = useSharedValue(1);

  const bounce = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.15, SPRING.bouncy),
      withSpring(0.95, SPRING.snappy),
      withSpring(1, SPRING.default),
    );
    void HAPTIC.success();
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, bounce, animatedStyle };
};

/**
 * Clean spark animation (proof verified)
 */
export const useCleanSpark = () => {
  const scale = useSharedValue(1);
  const sparkOpacity = useSharedValue(0);

  const spark = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withSpring(1, SPRING.bouncy),
    );
    sparkOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(400, withTiming(0, { duration: 200 })),
    );
    void HAPTIC.success();
  }, [scale, sparkOpacity]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
  }));

  return { scale, sparkOpacity, spark, scaleStyle, sparkStyle };
};

/**
 * Sheet slide up (bottom sheets)
 */
export const useSheetAnimation = (initialTranslateY = 500) => {
  const translateY = useSharedValue(initialTranslateY);
  const backdropOpacity = useSharedValue(0);

  const open = useCallback(() => {
    translateY.value = withSpring(0, SPRING.gentle);
    backdropOpacity.value = withTiming(1, { duration: TIMING.fast });
  }, [backdropOpacity, translateY]);

  const close = useCallback(() => {
    translateY.value = withSpring(initialTranslateY, SPRING.gentle);
    backdropOpacity.value = withTiming(0, { duration: TIMING.fast });
  }, [backdropOpacity, initialTranslateY, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return {
    translateY,
    backdropOpacity,
    open,
    close,
    sheetStyle,
    backdropStyle,
  };
};

/**
 * Card entrance for grids/lists
 */
export const useCardEntrance = (index: number, staggerDelay = 50) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const delay = index * staggerDelay;
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default }),
    );
    scale.value = withDelay(delay, withSpring(1, SPRING.gentle));
  }, [index, opacity, scale, staggerDelay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return { translateY, opacity, scale, animatedStyle };
};

/**
 * Floating action button animation
 */
export const useFABAnimation = () => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const show = useCallback(() => {
    scale.value = withSpring(1, SPRING.bouncy);
    rotation.value = withSpring(0, SPRING.default);
  }, [rotation, scale]);

  const hide = useCallback(() => {
    scale.value = withSpring(0, SPRING.snappy);
    rotation.value = withTiming(-90, { duration: TIMING.fast });
  }, [rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return { scale, rotation, show, hide, animatedStyle };
};

/**
 * Loading skeleton pulse
 */
export const useSkeletonPulse = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: TIMING.easeInOut }),
        withTiming(0.3, { duration: 800, easing: TIMING.easeInOut }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, animatedStyle };
};

// ═══════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Get spring config by type
 */
export const getSpringConfig = (type: SpringType = 'default') => SPRING[type];

/**
 * Create delayed animation sequence
 */
export const createStaggeredDelay = (index: number, baseDelay = 50) =>
  index * baseDelay;
