/**
 * TravelMatch Awwwards Design System 2026 - Animation Hooks V2
 *
 * Comprehensive animation system for Awwwards-level micro-interactions
 * Built on react-native-reanimated for 60fps performance
 *
 * Features:
 * - Spring configurations for natural motion
 * - Pre-built animation patterns
 * - Haptic feedback integration
 * - Accessibility (reduce motion) support
 */

import { useCallback, useEffect } from 'react';
import {
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedStyle,
  SharedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useReduceMotion } from './useReduceMotion';

// ============================================
// 1. SPRING CONFIGURATIONS
// ============================================
export const SPRINGS = {
  /**
   * Gentle - Smooth, subtle movements
   * Best for: background elements, subtle transitions
   */
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },

  /**
   * Bouncy - Playful, energetic movements
   * Best for: buttons, cards, interactive elements
   */
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 1,
  },

  /**
   * Snappy - Quick, responsive movements
   * Best for: immediate feedback, micro-interactions
   */
  snappy: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  },

  /**
   * Slow - Deliberate, smooth movements
   * Best for: page transitions, modals
   */
  slow: {
    damping: 25,
    stiffness: 100,
    mass: 1.2,
  },

  /**
   * Wobbly - Extra bounce effect
   * Best for: celebration, success states
   */
  wobbly: {
    damping: 8,
    stiffness: 180,
    mass: 1,
  },

  /**
   * Stiff - Minimal overshoot
   * Best for: precise movements, sliders
   */
  stiff: {
    damping: 30,
    stiffness: 400,
    mass: 1,
  },
} as const;

// ============================================
// 2. TIMING CONFIGURATIONS
// ============================================
export const TIMINGS = {
  /**
   * Fast - Quick transitions
   */
  fast: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  },

  /**
   * Medium - Standard transitions
   */
  medium: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },

  /**
   * Slow - Deliberate transitions
   */
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  },

  /**
   * Entrance - Elements appearing
   */
  entrance: {
    duration: 400,
    easing: Easing.out(Easing.back(1.5)),
  },

  /**
   * Exit - Elements disappearing
   */
  exit: {
    duration: 250,
    easing: Easing.in(Easing.ease),
  },

  /**
   * Pulse - Looping animations
   */
  pulse: {
    duration: 1500,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

// ============================================
// 3. ANIMATION HOOKS
// ============================================

/**
 * Main animation hook with all patterns
 */
export const useAnimations = () => {
  const reduceMotion = useReduceMotion();

  // ----------------------------------------
  // Button Press Animation
  // ----------------------------------------
  const buttonPress = useCallback(
    (scale: SharedValue<number>, options?: { haptic?: boolean }) => {
      'worklet';
      const { haptic = true } = options || {};

      if (haptic) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }

      scale.value = withSequence(
        withTiming(0.95, TIMINGS.fast),
        withSpring(1, SPRINGS.bouncy)
      );
    },
    []
  );

  // ----------------------------------------
  // Bounce In Animation
  // ----------------------------------------
  const bounceIn = useCallback(
    (
      scale: SharedValue<number>,
      opacity: SharedValue<number>,
      delay = 0
    ) => {
      'worklet';
      if (reduceMotion) {
        scale.value = 1;
        opacity.value = 1;
        return;
      }

      opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.1, TIMINGS.fast),
          withSpring(1, SPRINGS.bouncy)
        )
      );
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Fade Slide In Animation
  // ----------------------------------------
  const fadeSlideIn = useCallback(
    (
      translateY: SharedValue<number>,
      opacity: SharedValue<number>,
      delay = 0
    ) => {
      'worklet';
      if (reduceMotion) {
        translateY.value = 0;
        opacity.value = 1;
        return;
      }

      translateY.value = withDelay(delay, withSpring(0, SPRINGS.gentle));
      opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Pulse Animation (for CTAs)
  // ----------------------------------------
  const pulse = useCallback(
    (scale: SharedValue<number>) => {
      'worklet';
      if (reduceMotion) return;

      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, TIMINGS.pulse),
          withTiming(1, TIMINGS.pulse)
        ),
        -1, // Infinite
        false
      );
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Stop Pulse Animation
  // ----------------------------------------
  const stopPulse = useCallback((scale: SharedValue<number>) => {
    'worklet';
    cancelAnimation(scale);
    scale.value = withSpring(1, SPRINGS.gentle);
  }, []);

  // ----------------------------------------
  // Shake Animation (for errors)
  // ----------------------------------------
  const shake = useCallback(
    (translateX: SharedValue<number>, options?: { haptic?: boolean }) => {
      'worklet';
      const { haptic = true } = options || {};

      if (haptic) {
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Error
        );
      }

      if (reduceMotion) {
        translateX.value = 0;
        return;
      }

      translateX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 100 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Breathing Animation (for logos)
  // ----------------------------------------
  const breathe = useCallback(
    (scale: SharedValue<number>) => {
      'worklet';
      if (reduceMotion) return;

      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Glow Pulse Animation
  // ----------------------------------------
  const glowPulse = useCallback(
    (opacity: SharedValue<number>) => {
      'worklet';
      if (reduceMotion) {
        opacity.value = 0.6;
        return;
      }

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1,
        false
      );
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Staggered List Animation
  // ----------------------------------------
  const staggerIn = useCallback(
    (
      items: Array<{
        opacity: SharedValue<number>;
        translateY: SharedValue<number>;
      }>,
      staggerDelay = 50
    ) => {
      items.forEach((item, index) => {
        const delay = index * staggerDelay;

        if (reduceMotion) {
          item.opacity.value = 1;
          item.translateY.value = 0;
          return;
        }

        item.opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
        item.translateY.value = withDelay(
          delay,
          withSpring(0, SPRINGS.gentle)
        );
      });
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Card Flip Animation
  // ----------------------------------------
  const flipCard = useCallback(
    (rotateY: SharedValue<number>, isFlipped: boolean) => {
      'worklet';
      if (reduceMotion) {
        rotateY.value = isFlipped ? 180 : 0;
        return;
      }

      rotateY.value = withSpring(isFlipped ? 180 : 0, SPRINGS.slow);
    },
    [reduceMotion]
  );

  // ----------------------------------------
  // Celebration Animation
  // ----------------------------------------
  const celebrate = useCallback(
    (
      scale: SharedValue<number>,
      rotation: SharedValue<number>
    ) => {
      'worklet';
      runOnJS(Haptics.notificationAsync)(
        Haptics.NotificationFeedbackType.Success
      );

      if (reduceMotion) {
        scale.value = 1;
        rotation.value = 0;
        return;
      }

      scale.value = withSequence(
        withSpring(1.2, SPRINGS.wobbly),
        withSpring(0.9, SPRINGS.wobbly),
        withSpring(1, SPRINGS.bouncy)
      );

      rotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    },
    [reduceMotion]
  );

  return {
    buttonPress,
    bounceIn,
    fadeSlideIn,
    pulse,
    stopPulse,
    shake,
    breathe,
    glowPulse,
    staggerIn,
    flipCard,
    celebrate,
    reduceMotion,
  };
};

// ============================================
// 4. SPECIALIZED HOOKS
// ============================================

/**
 * Hook for button press animations
 */
export const usePressAnimation = (options?: {
  scaleDown?: number;
  haptic?: boolean;
}) => {
  const { scaleDown = 0.97, haptic = true } = options || {};
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotion();

  const handlePressIn = useCallback(() => {
    if (reduceMotion) return;

    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(scaleDown, SPRINGS.snappy);
  }, [scaleDown, haptic, reduceMotion]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
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
 * Hook for entrance animations
 */
export const useEntranceAnimation = (options?: {
  delay?: number;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'scale';
  distance?: number;
}) => {
  const { delay = 0, from = 'bottom', distance = 20 } = options || {};
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(from === 'left' ? -distance : from === 'right' ? distance : 0);
  const translateY = useSharedValue(from === 'bottom' ? distance : from === 'top' ? -distance : 0);
  const scale = useSharedValue(from === 'scale' ? 0.9 : 1);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      return;
    }

    opacity.value = withDelay(delay, withTiming(1, TIMINGS.medium));
    translateX.value = withDelay(delay, withSpring(0, SPRINGS.gentle));
    translateY.value = withDelay(delay, withSpring(0, SPRINGS.gentle));
    if (from === 'scale') {
      scale.value = withDelay(delay, withSpring(1, SPRINGS.bouncy));
    }
  }, [delay, from, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return { animatedStyle };
};

/**
 * Hook for parallax scrolling effect
 */
export const useParallax = (scrollY: SharedValue<number>, options?: {
  inputRange?: [number, number];
  outputRange?: [number, number];
}) => {
  const { inputRange = [-200, 200], outputRange = [20, -20] } = options || {};

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          inputRange,
          outputRange,
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return { animatedStyle };
};

/**
 * Hook for floating/levitating animation
 */
export const useFloatingAnimation = (options?: {
  distance?: number;
  duration?: number;
}) => {
  const { distance = 8, duration = 2000 } = options || {};
  const translateY = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;

    translateY.value = withRepeat(
      withSequence(
        withTiming(-distance, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(translateY);
    };
  }, [distance, duration, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
};

/**
 * Hook for skeleton loading animation
 */
export const useSkeletonAnimation = () => {
  const shimmer = useSharedValue(0);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      shimmer.value = 0.5;
      return;
    }

    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(shimmer);
    };
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.6, 1]),
  }));

  return { animatedStyle };
};

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

/**
 * Create staggered delay array
 */
export const createStaggerDelays = (count: number, baseDelay = 50): number[] => {
  return Array.from({ length: count }, (_, i) => i * baseDelay);
};

/**
 * Get spring config based on motion preference
 */
export const getSpringConfig = (
  config: keyof typeof SPRINGS,
  reduceMotion: boolean
) => {
  if (reduceMotion) {
    return { damping: 100, stiffness: 500, mass: 1 };
  }
  return SPRINGS[config];
};

/**
 * Get timing config based on motion preference
 */
export const getTimingConfig = (
  config: keyof typeof TIMINGS,
  reduceMotion: boolean
) => {
  if (reduceMotion) {
    return { duration: 0, easing: Easing.linear };
  }
  return TIMINGS[config];
};

// Export types
export type SpringConfig = keyof typeof SPRINGS;
export type TimingConfig = keyof typeof TIMINGS;
