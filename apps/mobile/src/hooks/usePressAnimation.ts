/**
 * usePressAnimation - Premium Card Press Animation Hook
 *
 * Adds tactile "sinking" press feedback to cards and interactive elements.
 * Creates physical interaction feel with subtle scale reduction.
 *
 * Features:
 * - Smooth scale animation (0.98 on press)
 * - Automatic release handling
 * - Optional haptic feedback
 * - Optimized for cards and list items
 *
 * @example
 * ```tsx
 * const { animatedStyle, handlePressIn, handlePressOut } = usePressAnimation();
 *
 * <Animated.View style={[styles.card, animatedStyle]}>
 *   <TouchableOpacity
 *     onPressIn={handlePressIn}
 *     onPressOut={handlePressOut}
 *     activeOpacity={1}
 *   >
 *     <Text>Card Content</Text>
 *   </TouchableOpacity>
 * </Animated.View>
 * ```
 */

import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { HapticManager } from '@/services/HapticManager';

interface UsePressAnimationOptions {
  /** Scale value when pressed (default: 0.98) */
  pressScale?: number;
  /** Enable haptic feedback (default: true) */
  haptics?: boolean;
  /** Spring animation config */
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export const usePressAnimation = (options?: UsePressAnimationOptions) => {
  const {
    pressScale = 0.98,
    haptics = true,
    springConfig = { damping: 25, stiffness: 350, mass: 0.5 },
  } = options || {};

  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(pressScale, springConfig);
    if (haptics) {
      HapticManager.buttonPress();
    }
  }, [scale, pressScale, springConfig, haptics]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [scale, springConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};

/**
 * Soft press variant for subtle interactions
 */
export const useSoftPressAnimation = () => {
  return usePressAnimation({
    pressScale: 0.99,
    haptics: false,
    springConfig: { damping: 30, stiffness: 400, mass: 0.4 },
  });
};

/**
 * Strong press variant for primary actions
 */
export const useStrongPressAnimation = () => {
  return usePressAnimation({
    pressScale: 0.96,
    haptics: true,
    springConfig: { damping: 20, stiffness: 300, mass: 0.6 },
  });
};
