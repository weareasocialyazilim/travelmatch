/**
 * AnimatedGradient - Living Gradient Background
 *
 * Premium animated gradient that slowly shifts colors
 * creating a "living" background effect.
 *
 * Features:
 * - Smooth color transitions (10-15s cycle)
 * - Optional gyroscope-based parallax
 * - Liquid glass theme integration
 * - Performance optimized
 *
 * @example
 * ```tsx
 * <AnimatedGradient
 *   colors={['#121214', '#1E1E20', '#121214']}
 *   duration={12000}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { LinearGradientProps as _LinearGradientProps } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedGradientProps {
  /** Base gradient colors */
  colors: string[];
  /** Alternative colors to transition to */
  alternateColors?: string[];
  /** Animation duration in ms */
  duration?: number;
  /** Container style */
  style?: ViewStyle;
  /** Start point */
  start?: { x: number; y: number };
  /** End point */
  end?: { x: number; y: number };
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  colors: inputColors,
  alternateColors,
  duration = 12000,
  style,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
}) => {
  // Ensure at least 2 colors for LinearGradient (required by expo-linear-gradient)
  const colors: [string, string, ...string[]] =
    inputColors.length >= 2
      ? (inputColors as [string, string, ...string[]])
      : [
          inputColors[0] || '#000000',
          inputColors[1] || inputColors[0] || '#000000',
        ];

  const progress = useSharedValue(0);

  useEffect(() => {
    // Slow breathing animation
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [progress, duration]);

  const animatedProps = useAnimatedProps(() => {
    if (!alternateColors) {
      return { colors };
    }

    // Interpolate between color sets
    const animatedColors = colors.map((color, index) => {
      const altColor = alternateColors[index] || color;
      return interpolateColor(progress.value, [0, 1], [color, altColor]);
    });

    return {
      colors: animatedColors,
    };
  });

  return (
    <AnimatedLinearGradient
      // @ts-ignore - Known reanimated v3 type incompatibility: animatedProps for
      // createAnimatedComponent() doesn't properly type-check with LinearGradient props.
      // See: https://github.com/software-mansion/react-native-reanimated/issues/4548
      animatedProps={animatedProps}
      colors={colors}
      start={start}
      end={end}
      style={[StyleSheet.absoluteFill, style]}
    />
  );
};
