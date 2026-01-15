/**
 * LiquidSkeleton - Lovendo Ultimate Design System 2026
 * Premium skeleton loading component with "Liquid" neon aesthetic
 *
 * Features:
 * - Neon shimmer effect matching brand colors
 * - Multiple variants (text, card, avatar, button)
 * - Smooth gradient animations
 * - Dark theme optimized
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LiquidSkeleton variant="text" width="80%" />
 *
 * // Card skeleton
 * <LiquidSkeleton variant="card" />
 *
 * // Avatar skeleton
 * <LiquidSkeleton variant="avatar" size={64} />
 *
 * // Custom skeleton
 * <LiquidSkeleton width={200} height={100} borderRadius={16} />
 * ```
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  DimensionValue,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { RADIUS, SPACING } from '@/constants/spacing';

export type SkeletonVariant =
  | 'text'
  | 'text-small'
  | 'text-large'
  | 'card'
  | 'card-compact'
  | 'avatar'
  | 'avatar-small'
  | 'avatar-large'
  | 'button'
  | 'image'
  | 'custom';

export interface LiquidSkeletonProps {
  /** Skeleton variant - predefined shapes */
  variant?: SkeletonVariant;
  /** Custom width (number for px, string for %) */
  width?: number | string;
  /** Custom height (number for px, string for %) */
  height?: number | string;
  /** Border radius */
  borderRadius?: number;
  /** Size for avatar variants */
  size?: number;
  /** Enable shimmer animation (default: true) */
  animated?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Test ID */
  testID?: string;
  /** Number of skeleton items to repeat */
  count?: number;
  /** Gap between repeated items */
  gap?: number;
}

// Animation duration for shimmer effect
const SHIMMER_DURATION = 1500;

// Preset dimensions for variants
const VARIANT_PRESETS: Record<
  SkeletonVariant,
  { width: number | string; height: number; borderRadius: number }
> = {
  text: { width: '100%', height: 16, borderRadius: 4 },
  'text-small': { width: '60%', height: 12, borderRadius: 3 },
  'text-large': { width: '100%', height: 24, borderRadius: 6 },
  card: { width: '100%', height: 200, borderRadius: RADIUS.card },
  'card-compact': { width: '100%', height: 120, borderRadius: RADIUS.card },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  'avatar-small': { width: 32, height: 32, borderRadius: 16 },
  'avatar-large': { width: 64, height: 64, borderRadius: 32 },
  button: { width: '100%', height: 48, borderRadius: RADIUS.button },
  image: { width: '100%', height: 180, borderRadius: RADIUS.md },
  custom: { width: '100%', height: 50, borderRadius: 8 },
};

/**
 * Single skeleton item component
 */
const SkeletonItem: React.FC<Omit<LiquidSkeletonProps, 'count' | 'gap'>> = ({
  variant = 'text',
  width,
  height,
  borderRadius,
  size,
  animated = true,
  style,
  testID,
}) => {
  // Shimmer animation value
  const shimmerProgress = useSharedValue(0);

  // Start shimmer animation
  useEffect(() => {
    if (animated) {
      shimmerProgress.value = withRepeat(
        withTiming(1, {
          duration: SHIMMER_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false,
      );
    }
    return () => {
      shimmerProgress.value = 0;
    };
  }, [animated, shimmerProgress]);

  // Get preset dimensions
  const preset = VARIANT_PRESETS[variant];

  // Calculate final dimensions
  const finalWidth = size ?? width ?? preset.width;
  const finalHeight = size ?? height ?? preset.height;
  const finalBorderRadius =
    borderRadius ?? (size ? size / 2 : preset.borderRadius);

  // Animated shimmer style
  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  // Base skeleton style
  const skeletonStyle: ViewStyle = {
    width: finalWidth as DimensionValue,
    height: finalHeight as DimensionValue,
    borderRadius: finalBorderRadius,
    backgroundColor: COLORS.bg.tertiary,
    overflow: 'hidden',
  };

  return (
    <View style={[skeletonStyle, style]} testID={testID}>
      {/* Base layer with subtle glow */}
      <View style={styles.baseLayer} />

      {/* Animated shimmer gradient */}
      {animated && (
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(223, 255, 0, 0.08)', // Neon lime at 8% opacity
              'rgba(168, 85, 247, 0.06)', // Violet at 6% opacity
              'transparent',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}

      {/* Subtle border glow */}
      <View style={[styles.borderGlow, { borderRadius: finalBorderRadius }]} />
    </View>
  );
};

/**
 * LiquidSkeleton - Main component with repeat support
 */
export const LiquidSkeleton: React.FC<LiquidSkeletonProps> = ({
  count = 1,
  gap = SPACING.sm,
  ...props
}) => {
  if (count === 1) {
    return <SkeletonItem {...props} />;
  }

  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem
          key={index}
          {...props}
          testID={props.testID ? `${props.testID}-${index}` : undefined}
        />
      ))}
    </View>
  );
};

/**
 * Preset skeleton components for common use cases
 */

/** Text skeleton with multiple lines */
export const SkeletonText: React.FC<{
  lines?: number;
  lastLineWidth?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ lines = 3, lastLineWidth = '60%', animated = true, style }) => (
  <View style={[{ gap: SPACING.xs }, style]}>
    {Array.from({ length: lines }).map((_, index) => (
      <LiquidSkeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? lastLineWidth : '100%'}
        animated={animated}
      />
    ))}
  </View>
);

/** Card skeleton with image and text */
export const SkeletonCard: React.FC<{
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ animated = true, style }) => (
  <View style={[styles.cardContainer, style]}>
    {/* Image placeholder */}
    <LiquidSkeleton variant="image" animated={animated} />

    {/* Content area */}
    <View style={styles.cardContent}>
      {/* Avatar + name row */}
      <View style={styles.cardHeader}>
        <LiquidSkeleton variant="avatar-small" animated={animated} />
        <View style={styles.flexColumnGap4}>
          <LiquidSkeleton
            variant="text-small"
            width="50%"
            animated={animated}
          />
          <LiquidSkeleton
            variant="text-small"
            width="30%"
            animated={animated}
          />
        </View>
      </View>

      {/* Title */}
      <LiquidSkeleton variant="text-large" width="80%" animated={animated} />

      {/* Description */}
      <SkeletonText lines={2} lastLineWidth="40%" animated={animated} />

      {/* Action row */}
      <View style={styles.cardActions}>
        <LiquidSkeleton
          width={80}
          height={32}
          borderRadius={16}
          animated={animated}
        />
        <LiquidSkeleton
          width={100}
          height={32}
          borderRadius={16}
          animated={animated}
        />
      </View>
    </View>
  </View>
);

/** Moment card skeleton matching MomentCard layout */
export const SkeletonMomentCard: React.FC<{
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ animated = true, style }) => (
  <View style={[styles.momentCardContainer, style]}>
    {/* Image with trust ring */}
    <View style={styles.momentImageContainer}>
      <LiquidSkeleton
        variant="custom"
        width="100%"
        height={180}
        borderRadius={0}
        animated={animated}
      />
      {/* Trust ring position */}
      <View style={styles.trustRingPosition}>
        <LiquidSkeleton variant="avatar-small" size={40} animated={animated} />
      </View>
      {/* Location badge */}
      <View style={styles.locationBadgePosition}>
        <LiquidSkeleton
          width={80}
          height={24}
          borderRadius={12}
          animated={animated}
        />
      </View>
    </View>

    {/* Content */}
    <View style={styles.momentContent}>
      <LiquidSkeleton variant="text-large" width="70%" animated={animated} />
      <LiquidSkeleton variant="text-small" width="40%" animated={animated} />

      {/* Action row */}
      <View style={styles.momentActions}>
        <LiquidSkeleton
          width={60}
          height={20}
          borderRadius={4}
          animated={animated}
        />
        <View style={styles.flexRowGap8}>
          <LiquidSkeleton
            width={70}
            height={32}
            borderRadius={8}
            animated={animated}
          />
          <LiquidSkeleton
            width={100}
            height={32}
            borderRadius={8}
            animated={animated}
          />
        </View>
      </View>
    </View>
  </View>
);

/** List item skeleton */
export const SkeletonListItem: React.FC<{
  animated?: boolean;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ animated = true, showAvatar = true, style }) => (
  <View style={[styles.listItemContainer, style]}>
    {showAvatar && <LiquidSkeleton variant="avatar" animated={animated} />}
    <View style={styles.flexColumnGapXs}>
      <LiquidSkeleton variant="text" width="60%" animated={animated} />
      <LiquidSkeleton variant="text-small" width="40%" animated={animated} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg.tertiary,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '200%',
  },
  shimmerGradient: {
    flex: 1,
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(223, 255, 0, 0.05)', // Subtle neon border
  },
  // Card skeleton styles
  cardContainer: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  cardContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  // Moment card skeleton styles
  momentCardContainer: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  momentImageContainer: {
    position: 'relative',
  },
  trustRingPosition: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  locationBadgePosition: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
  },
  momentContent: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  momentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  // List item skeleton styles
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  // Flex container styles to avoid inline styles
  flexColumnGap4: {
    flex: 1,
    gap: 4,
  },
  flexRowGap8: {
    flexDirection: 'row',
    gap: 8,
  },
  flexColumnGapXs: {
    flex: 1,
    gap: SPACING.xs,
  },
});

export default LiquidSkeleton;
