/**
 * usePressAnimation Hook
 *
 * Provides press animation (scale) and haptic feedback for touchable elements.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface UsePressAnimationOptions {
  /** Scale amount when pressed (default: 0.97) */
  scaleAmount?: number;
  /** Haptic feedback style */
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  /** Whether to enable haptic feedback (default: true) */
  enableHaptics?: boolean;
  /** Spring damping (default: 15) */
  damping?: number;
  /** Spring stiffness (default: 300) */
  stiffness?: number;
}

interface UsePressAnimationReturn {
  /** Animated style to apply to the component */
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  /** Handler for press in event */
  onPressIn: () => void;
  /** Handler for press out event */
  onPressOut: () => void;
  /** Current scale value */
  scale: ReturnType<typeof useSharedValue>;
}

export const usePressAnimation = (
  options: UsePressAnimationOptions = {}
): UsePressAnimationReturn => {
  const {
    scaleAmount = 0.97,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
    enableHaptics = true,
    damping = 15,
    stiffness = 300,
  } = options;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleAmount, { damping, stiffness });
    if (enableHaptics) {
      Haptics.impactAsync(hapticStyle);
    }
  }, [scale, scaleAmount, damping, stiffness, enableHaptics, hapticStyle]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping, stiffness });
  }, [scale, damping, stiffness]);

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    scale,
  };
};

/**
 * useBounceAnimation Hook
 *
 * Provides a bounce animation on press with more dramatic effect.
 */
interface UseBounceAnimationOptions {
  /** Whether to enable haptic feedback (default: true) */
  enableHaptics?: boolean;
}

export const useBounceAnimation = (
  options: UseBounceAnimationOptions = {}
) => {
  const { enableHaptics = true } = options;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bounce = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    }, 100);

    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [scale, enableHaptics]);

  return {
    animatedStyle,
    bounce,
    scale,
  };
};

export default usePressAnimation;
