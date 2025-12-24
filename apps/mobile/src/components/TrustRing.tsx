/**
 * TrustRing Component
 *
 * Circular progress indicator around avatars to visualize trust score.
 * Part of iOS 26.3 design system for TravelMatch.
 *
 * Trust Score Color Coding:
 * - 0-30: Red (#EF4444) - Low trust
 * - 31-60: Amber (#F59E0B) - Medium trust
 * - 61-85: Green (#10B981) - High trust
 * - 86-100: Gold (#FFD700) - Platinum trust
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TrustRingProps {
  /** Trust score from 0-100 */
  score: number;
  /** Size of the ring container */
  size: number;
  /** Width of the ring stroke */
  strokeWidth?: number;
  /** Content to display inside the ring (usually avatar) */
  children: React.ReactNode;
  /** Callback when ring is tapped (show tooltip) */
  onPress?: () => void;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether to show background ring */
  showBackground?: boolean;
}

/**
 * Get the trust ring color based on score
 */
export const getTrustColor = (score: number): string => {
  if (score <= 30) return COLORS.trustLow;     // Red
  if (score <= 60) return COLORS.trustMedium;  // Amber
  if (score <= 85) return COLORS.trustHigh;    // Green
  return COLORS.trustPlatinum;                  // Gold
};

/**
 * Get trust level label based on score
 */
export const getTrustLabel = (score: number): string => {
  if (score <= 30) return 'Yeni Kullanıcı';
  if (score <= 60) return 'Gelişen';
  if (score <= 85) return 'Güvenilir';
  return 'Çok Güvenilir';
};

export const TrustRing: React.FC<TrustRingProps> = ({
  score,
  size,
  strokeWidth = 3,
  children,
  onPress,
  animationDuration = 1000,
  showBackground = true,
}) => {
  const progress = useSharedValue(0);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate on mount and score change
  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: animationDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [score, animationDuration, progress]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const ringColor = getTrustColor(score);

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container
      {...containerProps}
      style={[styles.container, { width: size, height: size }]}
    >
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        {/* Background circle */}
        {showBackground && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        )}

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Content (Avatar) */}
      <View style={styles.content}>
        {children}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
  },
});

export default TrustRing;
