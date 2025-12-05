/**
 * Skeleton Loader Component
 * Animated placeholder for loading content with shimmer effect.
 * Used during data fetching to show content layout preview.
 */

import React, { useEffect, useRef } from 'react';
import type { ViewStyle, DimensionValue } from 'react-native';
import { StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';

interface SkeletonProps {
  /** Width of skeleton - number or percentage string */
  width?: DimensionValue;
  /** Height in pixels */
  height?: number;
  /** Border radius for rounded corners */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Skeleton - Animated loading placeholder
 *
 * Features:
 * - Smooth shimmer animation
 * - Customizable dimensions
 * - Auto-cleanup on unmount
 *
 * @example
 * ```tsx
 * // Text line placeholder
 * <Skeleton width="80%" height={16} />
 *
 * // Avatar placeholder
 * <Skeleton width={48} height={48} borderRadius={24} />
 *
 * // Card placeholder
 * <Skeleton width="100%" height={120} borderRadius={12} />
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radii.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
});
