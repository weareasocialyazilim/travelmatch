/**
 * Lovendo Ultimate Design System - Motion
 *
 * "Unified Physics" - Single spring config across entire app
 *
 * Principles:
 * 1. Same physics everywhere (button, sheet, card)
 * 2. Haptics for "satisfaction" not "clicks"
 * 3. Shared element transitions for continuity
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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
// ═══════════════════════════════════════════════════
export const HAPTIC = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  selection: () => Haptics.selectionAsync(),
} as const;

// ═══════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════

/**
 * Press animation for buttons/cards
 */
export const usePressAnimation = (scaleValue = 0.96) => {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, SPRING.snappy);
    HAPTIC.light();
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
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return { animatedStyle };
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
  }, [index, staggerDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
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
  }, [minScale, maxScale, duration]);

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
  }, [enabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { animatedStyle };
};

/**
 * Shake animation for errors
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
    HAPTIC.error();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, animatedStyle };
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
    HAPTIC.success();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { bounce, animatedStyle };
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
    HAPTIC.success();
  }, []);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: sparkOpacity.value,
  }));

  return { spark, scaleStyle, sparkStyle };
};

/**
 * Sheet slide up (bottom sheets)
 */
export const useSheetAnimation = () => {
  const translateY = useSharedValue(500);
  const opacity = useSharedValue(0);

  const open = useCallback(() => {
    translateY.value = withSpring(0, SPRING.gentle);
    opacity.value = withTiming(1, { duration: TIMING.fast });
  }, []);

  const close = useCallback(() => {
    translateY.value = withSpring(500, SPRING.gentle);
    opacity.value = withTiming(0, { duration: TIMING.fast });
  }, []);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { open, close, sheetStyle, backdropStyle };
};

/**
 * Card entrance for grids/lists
 */
export const useCardEntrance = (index: number) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const delay = index * 50;
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default }),
    );
    scale.value = withDelay(delay, withSpring(1, SPRING.gentle));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle };
};
