/**
 * Unified Loading State Component
 * Provides consistent loading experience across all screens
 *
 * @version 2.0.0 - Master 2026 with Dating Neon Heart Animation
 */

import React, { memo, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

/**
 * Loading Type
 */
export type LoadingType = 'skeleton' | 'spinner' | 'overlay' | 'dating';

/**
 * Loading State Props
 */
interface LoadingStateProps {
  type: LoadingType;
  count?: number; // For skeleton
  message?: string; // For overlay
  color?: string;
  size?: 'small' | 'large';
}

/**
 * Skeleton Item - Memoized to prevent re-renders in lists
 */
const SkeletonItem: React.FC<{ style?: object }> = memo(({ style }) => {
  return (
    <View style={[styles.skeletonItem, style]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </View>
  );
});

SkeletonItem.displayName = 'SkeletonItem';

/**
 * 💖 Neon Heart Pulse - Dating Platform Loading Animation
 * Pulsating heart with glow effect
 */
const NeonHeartPulse: React.FC<{ message?: string }> = memo(({ message }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Heart pulse animation
    scale.value = withRepeat(
      withSequence(
        withSpring(1.15, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 }),
      ),
      -1,
      false,
    );

    // Glow pulse animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    opacity.value = withTiming(1, { duration: 300 });
  }, [scale, opacity, glowOpacity]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.datingContainer}>
      {/* Glow effect */}
      <Animated.View style={[styles.heartGlow, glowStyle]} />

      {/* Heart icon */}
      <Animated.View style={heartStyle}>
        <MaterialCommunityIcons
          name="heart"
          size={48}
          color={primitives.magenta[500]}
        />
      </Animated.View>

      {/* Message */}
      {message && <Text style={styles.datingMessage}>{message}</Text>}

      {/* Subtle loading indicator */}
      <View style={styles.datingDots}>
        <DatingDot delay={0} />
        <DatingDot delay={150} />
        <DatingDot delay={300} />
      </View>
    </View>
  );
});

NeonHeartPulse.displayName = 'NeonHeartPulse';

/**
 * Animated dot for dating loader
 */
const DatingDot: React.FC<{ delay: number }> = memo(({ delay }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        true,
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.datingDot, style]} />;
});

DatingDot.displayName = 'DatingDot';

/**
 * Loading State Component
 *
 * @example
 * // Skeleton loading
 * <LoadingState type="skeleton" count={5} />
 *
 * // Spinner loading
 * <LoadingState type="spinner" />
 *
 * // Overlay loading with message
 * <LoadingState type="overlay" message="Loading your trips..." />
 */
export const LoadingState: React.FC<LoadingStateProps> = memo(
  ({
    type,
    count = 3,
    message,
    color = COLORS.brand.primary,
    size = 'large',
  }) => {
    // Memoize skeleton items array to prevent recreation
    const skeletonItems = useMemo(
      () =>
        Array.from({ length: count }, (_, index) => (
          <SkeletonItem key={index} />
        )),
      [count],
    );

    switch (type) {
      case 'skeleton':
        return <View style={styles.skeletonContainer}>{skeletonItems}</View>;

      case 'spinner':
        return (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size={size} color={color} />
          </View>
        );

      case 'dating':
        return <NeonHeartPulse message={message} />;

      case 'overlay':
        return (
          <Modal transparent visible animationType="fade">
            <View style={styles.overlayContainer}>
              <View style={styles.overlayContent}>
                <ActivityIndicator size="large" color={color} />
                {message && (
                  <Text style={styles.overlayMessage}>{message}</Text>
                )}
              </View>
            </View>
          </Modal>
        );

      default:
        return null;
    }
  },
  (prevProps, nextProps) =>
    prevProps.type === nextProps.type &&
    prevProps.count === nextProps.count &&
    prevProps.message === nextProps.message &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size,
);

LoadingState.displayName = 'LoadingState';

const styles = StyleSheet.create({
  // Skeleton Styles
  skeletonContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  skeletonItem: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: COLORS.border.default,
    borderRadius: 4,
  },
  skeletonLineShort: {
    width: '60%',
  },

  // Spinner Styles
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },

  // Overlay Styles
  overlayContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  overlayMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  // 💖 Dating Neon Heart Styles
  datingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  heartGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: primitives.magenta[500],
    shadowColor: primitives.magenta[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  datingMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  datingDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.md,
  },
  datingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: primitives.magenta[400],
  },
});
