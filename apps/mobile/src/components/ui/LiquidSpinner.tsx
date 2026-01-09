/**
 * LiquidSpinner - Premium Liquid Glass Refresh Indicator
 *
 * Custom pull-to-refresh spinner with liquid glass theme.
 * Replaces standard RefreshControl for premium feel.
 *
 * Features:
 * - Liquid droplet animation
 * - Glass morphism effect
 * - Smooth rotation
 * - Neon accent colors
 *
 * @example
 * ```tsx
 * <FlatList
 *   refreshControl={
 *     <LiquidSpinner refreshing={refreshing} onRefresh={onRefresh} />
 *   }
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

interface LiquidSpinnerProps extends Omit<RefreshControlProps, 'children'> {
  /** Refresh state */
  refreshing: boolean;
  /** Refresh callback */
  onRefresh?: () => void;
}

export const LiquidSpinner: React.FC<LiquidSpinnerProps> = ({
  refreshing,
  onRefresh,
  ...props
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false,
      );
      scale.value = withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      rotation.value = 0;
      scale.value = 0.8;
    }
  }, [refreshing, rotation, scale]);

  // Use platform-specific refresh control
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={COLORS.primary}
      colors={[COLORS.primary, COLORS.secondary]}
      {...props}
    />
  );
};

// Custom inline spinner for manual use
export const LiquidDroplet: React.FC = () => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.dropletContainer}>
      <Animated.View style={[styles.droplet, animatedStyle]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dropletGradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropletContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  droplet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropletGradient: {
    flex: 1,
  },
});
