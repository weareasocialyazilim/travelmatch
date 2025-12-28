// hooks/useMotion.ts
// TravelMatch Ultimate Design System 2026 - "Unified Physics" Motion System
// Motto: "Give a moment. See it happen."

import { useCallback } from 'react';
import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  SharedValue,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  interpolate as _interpolate,
  Extrapolation as _Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// ═══════════════════════════════════════════════════════════════════
// SPRING CONFIG - Tüm app'te aynı fizik
// ═══════════════════════════════════════════════════════════════════
export const SPRING = {
  // Ana spring - her yerde bu kullanılacak
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Hızlı response (butonlar)
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },

  // Yumuşak (sheets, modals)
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

  // Heavy (drag, swipe)
  heavy: {
    damping: 25,
    stiffness: 200,
    mass: 1.2,
  },

  // Quick (micro interactions)
  quick: {
    damping: 18,
    stiffness: 400,
    mass: 0.6,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// TIMING - Consistent durations
// ═══════════════════════════════════════════════════════════════════
export const TIMING = {
  instant: 100,
  fast: 200,
  default: 300,
  slow: 500,
  slower: 700,

  // Easing curves
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  easeIn: Easing.bezier(0.42, 0, 1, 1),
  easeOut: Easing.bezier(0, 0, 0.58, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),

  // Custom curves for specific use cases
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
} as const;

// ═══════════════════════════════════════════════════════════════════
// HAPTICS - "Tatmin" hissi
// ═══════════════════════════════════════════════════════════════════
export const HAPTIC = {
  // Buton press
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Aksiyon complete
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Önemli aksiyon (gift send, proof confirm)
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Success
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Error
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Warning
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Selection change
  selection: () => Haptics.selectionAsync(),
} as const;

// ═══════════════════════════════════════════════════════════════════
// ANIMATION PRESETS - Worklet functions
// ═══════════════════════════════════════════════════════════════════

// Press animation (tüm butonlar)
export const pressAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSpring(0.96, SPRING.snappy);
};

export const releaseAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSpring(1, SPRING.default);
};

// Soft press (for cards)
export const softPressAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSpring(0.98, SPRING.snappy);
};

// Trust ring shimmer
export const shimmerAnimation = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withSequence(
    withTiming(0.4, { duration: 400 }),
    withTiming(1, { duration: 400 }),
    withTiming(0.7, { duration: 300 }),
  );
};

// Continuous shimmer loop
export const shimmerLoopAnimation = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 800 }),
      withTiming(0.5, { duration: 800 }),
    ),
    -1,
    true,
  );
};

// Card entrance (staggered list)
export const cardEntranceAnimation = (
  translateY: SharedValue<number>,
  opacity: SharedValue<number>,
  index: number,
) => {
  'worklet';
  const delay = index * 50;
  translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
  opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
};

// Sheet slide up
export const sheetSlideUp = (translateY: SharedValue<number>) => {
  'worklet';
  translateY.value = withSpring(0, SPRING.gentle);
};

// Sheet slide down
export const sheetSlideDown = (
  translateY: SharedValue<number>,
  targetY: number,
) => {
  'worklet';
  translateY.value = withSpring(targetY, SPRING.gentle);
};

// Clean spark (proof verified)
export const cleanSparkAnimation = (
  scale: SharedValue<number>,
  opacity: SharedValue<number>,
) => {
  'worklet';
  scale.value = withSequence(
    withTiming(1.3, { duration: 150 }),
    withSpring(1, SPRING.bouncy),
  );
  opacity.value = withSequence(
    withTiming(1, { duration: 100 }),
    withDelay(400, withTiming(0, { duration: 200 })),
  );
};

// Fade in
export const fadeInAnimation = (opacity: SharedValue<number>, delay = 0) => {
  'worklet';
  opacity.value = withDelay(
    delay,
    withTiming(1, { duration: TIMING.default, easing: TIMING.easeOut }),
  );
};

// Fade out
export const fadeOutAnimation = (opacity: SharedValue<number>) => {
  'worklet';
  opacity.value = withTiming(0, {
    duration: TIMING.fast,
    easing: TIMING.easeIn,
  });
};

// Slide in from bottom
export const slideInFromBottom = (
  translateY: SharedValue<number>,
  delay = 0,
) => {
  'worklet';
  translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
};

// Slide in from right
export const slideInFromRight = (
  translateX: SharedValue<number>,
  delay = 0,
) => {
  'worklet';
  translateX.value = withDelay(delay, withSpring(0, SPRING.gentle));
};

// Bounce animation
export const bounceAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.15, SPRING.quick),
    withSpring(0.9, SPRING.quick),
    withSpring(1, SPRING.bouncy),
  );
};

// Shake animation (for errors)
export const shakeAnimation = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withSpring(0, SPRING.snappy),
  );
};

// Pulse animation
export const pulseAnimation = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withRepeat(
    withSequence(
      withTiming(1.05, { duration: 500 }),
      withTiming(1, { duration: 500 }),
    ),
    -1,
    true,
  );
};

// ═══════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook for press scale animation with haptics
 */
export const usePressAnimation = (withHaptic = true) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(0.96, SPRING.snappy);
    if (withHaptic) {
      runOnJS(HAPTIC.light)();
    }
  }, [withHaptic]);

  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};

/**
 * Hook for soft press animation (cards)
 */
export const useSoftPressAnimation = (withHaptic = true) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(0.98, SPRING.snappy);
    if (withHaptic) {
      runOnJS(HAPTIC.light)();
    }
  }, [withHaptic]);

  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};

/**
 * Hook for fade in animation on mount
 */
export const useFadeIn = (delay = 0) => {
  const opacity = useSharedValue(0);

  const startAnimation = useCallback(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default, easing: TIMING.easeOut }),
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {
    opacity,
    startAnimation,
    animatedStyle,
  };
};

/**
 * Hook for slide in animation
 */
export const useSlideIn = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 20,
  delay = 0,
) => {
  const translateX = useSharedValue(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0,
  );
  const translateY = useSharedValue(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0,
  );
  const opacity = useSharedValue(0);

  const startAnimation = useCallback(() => {
    translateX.value = withDelay(delay, withSpring(0, SPRING.gentle));
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: TIMING.default }),
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return {
    translateX,
    translateY,
    opacity,
    startAnimation,
    animatedStyle,
  };
};

/**
 * Hook for staggered list items
 */
export const useStaggeredEntry = (index: number, baseDelay = 50) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const startAnimation = useCallback(() => {
    const delay = index * baseDelay;
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [index, baseDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return {
    translateY,
    opacity,
    startAnimation,
    animatedStyle,
  };
};

/**
 * Hook for trust ring shimmer effect
 */
export const useTrustShimmer = (enabled = true) => {
  const shimmerOpacity = useSharedValue(0.7);

  const startShimmer = useCallback(() => {
    if (!enabled) return;
    shimmerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [enabled]);

  const stopShimmer = useCallback(() => {
    shimmerOpacity.value = withTiming(0.7, { duration: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return {
    shimmerOpacity,
    startShimmer,
    stopShimmer,
    animatedStyle,
  };
};

/**
 * Hook for parallax scroll effect
 */
export const useParallax = (scrollY: SharedValue<number>, factor = 0.5) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * factor }],
  }));

  return { animatedStyle };
};

/**
 * Hook for progress ring animation
 */
export const useProgressRing = (targetProgress: number, duration = 1000) => {
  const progress = useSharedValue(0);

  const startAnimation = useCallback(() => {
    progress.value = withTiming(targetProgress / 100, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [targetProgress, duration]);

  return {
    progress,
    startAnimation,
  };
};

// Export all
export default {
  SPRING,
  TIMING,
  HAPTIC,
  pressAnimation,
  releaseAnimation,
  softPressAnimation,
  shimmerAnimation,
  shimmerLoopAnimation,
  cardEntranceAnimation,
  sheetSlideUp,
  sheetSlideDown,
  cleanSparkAnimation,
  fadeInAnimation,
  fadeOutAnimation,
  slideInFromBottom,
  slideInFromRight,
  bounceAnimation,
  shakeAnimation,
  pulseAnimation,
  usePressAnimation,
  useSoftPressAnimation,
  useFadeIn,
  useSlideIn,
  useStaggeredEntry,
  useTrustShimmer,
  useParallax,
  useProgressRing,
};
