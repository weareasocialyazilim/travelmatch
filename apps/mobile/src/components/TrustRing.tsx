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
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

// Lazy load SVG to handle potential native module issues
let Svg: typeof import('react-native-svg').default | null = null;
let Circle: typeof import('react-native-svg').Circle | null = null;
let AnimatedCircle: ReturnType<typeof Animated.createAnimatedComponent> | null = null;

try {
  const svg = require('react-native-svg');
  Svg = svg.default || svg.Svg;
  Circle = svg.Circle;
  if (Circle) {
    AnimatedCircle = Animated.createAnimatedComponent(Circle);
  }
} catch {
  // SVG not available, will use fallback
}

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

// Fallback component when SVG is not available
const FallbackTrustRing: React.FC<TrustRingProps> = ({
  score,
  size,
  strokeWidth = 3,
  children,
  onPress,
}) => {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  const ringColor = getTrustColor(safeScore);

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress } : {};

  return (
    <Container
      {...containerProps}
      style={[styles.container, { width: size, height: size }]}
    >
      <View
        style={[
          styles.fallbackRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: ringColor,
          },
        ]}
      />
      <View style={styles.content}>
        {children}
      </View>
    </Container>
  );
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
  const [svgError, setSvgError] = useState(false);
  const progress = useSharedValue(0);

  // Ensure values are valid numbers to prevent NaN
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  const safeSize = Number.isFinite(size) && size > 0 ? size : 50;
  const safeStrokeWidth = Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 3;

  // Calculate circle properties with safe values
  const radius = (safeSize - safeStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = safeSize / 2;

  // Animate on mount and score change
  useEffect(() => {
    progress.value = withTiming(safeScore / 100, {
      duration: animationDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [safeScore, animationDuration, progress]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const ringColor = getTrustColor(safeScore);

  const Container = onPress ? Pressable : View;
  const containerProps = onPress ? { onPress } : {};

  // Check if SVG components are available
  const svgAvailable = Svg && Circle && AnimatedCircle && !svgError;

  // Use fallback if SVG is not available
  if (!svgAvailable) {
    return (
      <FallbackTrustRing
        score={safeScore}
        size={safeSize}
        strokeWidth={safeStrokeWidth}
        onPress={onPress}
      >
        {children}
      </FallbackTrustRing>
    );
  }

  try {
    return (
      <Container
        {...containerProps}
        style={[styles.container, { width: safeSize, height: safeSize }]}
      >
        <Svg
          width={safeSize}
          height={safeSize}
          style={styles.svg}
        >
          {/* Background circle */}
          {showBackground && (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth={safeStrokeWidth}
              fill="transparent"
            />
          )}

          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={safeStrokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference}`}
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
  } catch {
    setSvgError(true);
    return (
      <FallbackTrustRing
        score={safeScore}
        size={safeSize}
        strokeWidth={safeStrokeWidth}
        onPress={onPress}
      >
        {children}
      </FallbackTrustRing>
    );
  }
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
  fallbackRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

export default TrustRing;
