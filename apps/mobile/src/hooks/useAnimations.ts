/**
 * TravelMatch Awwwards Design System - Animation Hooks
 *
 * Pre-built animation patterns for consistent micro-interactions
 * Uses react-native-reanimated 3
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
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { HapticManager } from '@/services/HapticManager';

// ============================================
// 1. SPRING CONFIGURATIONS
// ============================================
export const SPRINGS = {
  /** Gentle, slow spring for subtle movements */
  gentle: { damping: 20, stiffness: 150, mass: 1 },

  /** Standard spring for most animations */
  default: { damping: 15, stiffness: 200, mass: 1 },

  /** Bouncy spring for playful interactions */
  bouncy: { damping: 10, stiffness: 200, mass: 1 },

  /** Quick, snappy spring for fast responses */
  snappy: { damping: 15, stiffness: 300, mass: 0.8 },

  /** Slow, heavy spring for dramatic effect */
  slow: { damping: 25, stiffness: 100, mass: 1.2 },

  /** Extra bouncy for celebrations */
  celebration: { damping: 8, stiffness: 250, mass: 0.9 },
} as const;

// ============================================
// 2. TIMING CONFIGURATIONS
// ============================================
export const TIMINGS = {
  /** Very fast timing (100ms) */
  instant: { duration: 100, easing: Easing.out(Easing.ease) },

  /** Fast timing (150ms) */
  fast: { duration: 150, easing: Easing.out(Easing.ease) },

  /** Standard timing (250ms) */
  default: { duration: 250, easing: Easing.inOut(Easing.ease) },

  /** Medium timing (350ms) */
  medium: { duration: 350, easing: Easing.inOut(Easing.ease) },

  /** Slow timing (500ms) */
  slow: { duration: 500, easing: Easing.inOut(Easing.ease) },

  /** Very slow timing (800ms) */
  verySlow: { duration: 800, easing: Easing.inOut(Easing.ease) },
} as const;

// ============================================
// 3. PRESS ANIMATIONS
// ============================================

/**
 * Button press scale animation
 * Usage: <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
 */
export const usePressAnimation = (
  scaleValue: number = 0.97,
  springConfig = SPRINGS.snappy,
) => {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, springConfig);
    HapticManager.buttonPress();
  }, [scale, scaleValue, springConfig]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    scale,
    onPressIn,
    onPressOut,
    animatedStyle,
  };
};

/**
 * Button press with scale + opacity
 */
export const usePressOpacityAnimation = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.97, SPRINGS.snappy);
    opacity.value = withTiming(0.7, TIMINGS.fast);
  }, [scale, opacity]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
    opacity.value = withTiming(1, TIMINGS.fast);
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { onPressIn, onPressOut, animatedStyle };
};

// ============================================
// 4. ENTRANCE ANIMATIONS
// ============================================

/**
 * Fade in animation
 */
export const useFadeIn = (delay: number = 0, duration: number = 300) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
    );
  }, [opacity, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { opacity, animatedStyle };
};

/**
 * Fade + slide up animation
 */
export const useFadeSlideUp = (delay: number = 0, translateY: number = 20) => {
  const opacity = useSharedValue(0);
  const translate = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
    translate.value = withDelay(delay, withSpring(0, SPRINGS.gentle));
  }, [opacity, translate, delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return { animatedStyle };
};

/**
 * Scale bounce in animation
 */
export const useBounceIn = (delay: number = 0, fromScale: number = 0.8) => {
  const scale = useSharedValue(fromScale);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, TIMINGS.fast));
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.05, TIMINGS.fast),
        withSpring(1, SPRINGS.bouncy),
      ),
    );
  }, [opacity, scale, delay, fromScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle };
};

/**
 * Staggered list item animation
 */
export const useStaggeredItem = (index: number, staggerDelay: number = 50) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = index * staggerDelay;
    opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
    translateY.value = withDelay(delay, withSpring(0, SPRINGS.gentle));
  }, [opacity, translateY, index, staggerDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
};

// ============================================
// 5. CONTINUOUS ANIMATIONS
// ============================================

/**
 * Pulse animation (for CTAs, notifications)
 */
export const usePulse = (
  minScale: number = 1,
  maxScale: number = 1.05,
  duration: number = 1500,
) => {
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
  }, [scale, minScale, maxScale, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scale, animatedStyle };
};

/**
 * Breathing animation (for avatars, logos)
 */
export const useBreathing = (duration: number = 2000) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);

    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration, easing }),
        withTiming(1, { duration, easing }),
      ),
      -1,
      false,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration, easing }),
        withTiming(1, { duration, easing }),
      ),
      -1,
      false,
    );
  }, [scale, opacity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle };
};

/**
 * Floating animation (subtle up/down movement)
 */
export const useFloating = (amplitude: number = 5, duration: number = 3000) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(amplitude, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, [translateY, amplitude, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
};

/**
 * Rotation animation
 */
export const useRotation = (degrees: number = 360, duration: number = 1000) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(degrees, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation, degrees, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return { rotation, animatedStyle };
};

// ============================================
// 6. FEEDBACK ANIMATIONS
// ============================================

/**
 * Shake animation (for errors)
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
    HapticManager.error();
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, animatedStyle };
};

/**
 * Success bounce animation
 */
export const useSuccessBounce = () => {
  const scale = useSharedValue(1);

  const bounce = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.2, SPRINGS.celebration),
      withSpring(0.9, SPRINGS.snappy),
      withSpring(1, SPRINGS.bouncy),
    );
    HapticManager.success();
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { bounce, animatedStyle };
};

// ============================================
// 7. SCROLL-BASED ANIMATIONS
// ============================================

/**
 * Parallax effect based on scroll position
 */
export const useParallax = (
  scrollY: SharedValue<number>,
  inputRange: [number, number],
  outputRange: [number, number],
) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      inputRange,
      outputRange,
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  return { animatedStyle };
};

/**
 * Header collapse animation
 */
export const useHeaderCollapse = (
  scrollY: SharedValue<number>,
  expandedHeight: number,
  collapsedHeight: number,
) => {
  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, expandedHeight - collapsedHeight],
      [expandedHeight, collapsedHeight],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollY.value,
      [0, (expandedHeight - collapsedHeight) / 2],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return {
      height,
      opacity,
    };
  });

  return { animatedStyle };
};

// ============================================
// 8. UTILITY HOOKS
// ============================================

/**
 * Animate value change
 */
export const useAnimatedValue = (value: number, config = TIMINGS.default) => {
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, config);
  }, [animatedValue, value, config]);

  return animatedValue;
};

/**
 * Progress bar animation
 */
export const useProgress = (
  progress: number, // 0-1
  duration: number = 500,
) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration });
  }, [animatedProgress, progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return { animatedProgress, animatedStyle };
};

/**
 * Floating animation (for badges, notifications, etc.)
 */
export const useFloatingAnimation = (
  amplitude: number = 5,
  duration: number = 3000,
) => {
  return useFloating(amplitude, duration);
};

/**
 * Skeleton loading pulse animation
 */
export const useSkeletonAnimation = () => {
  return usePulse();
};

/**
 * Get spring configuration
 */
export const getSpringConfig = (preset: keyof typeof SPRINGS = 'default') => {
  return SPRINGS[preset];
};

/**
 * Get timing configuration
 */
export const getTimingConfig = (preset: keyof typeof TIMINGS = 'default') => {
  return TIMINGS[preset];
};

/**
 * Create staggered delays for list items
 */
export const createStaggerDelays = (count: number, delay: number = 50) => {
  return Array.from({ length: count }, (_, i) => i * delay);
};

// Type exports
export type SpringConfig = (typeof SPRINGS)[keyof typeof SPRINGS];
export type TimingConfig = (typeof TIMINGS)[keyof typeof TIMINGS];
