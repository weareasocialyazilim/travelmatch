/**
 * LovendoLoading - Lovendo Ultimate Design System 2026
 * Consolidated loading component for all loading types
 *
 * Replaces:
 * - Spinner.tsx (basic loading with message)
 * - LoadingSpinner.tsx (minimal loading)
 * - LiquidLoading.tsx (premium immersive loading)
 *
 * @example
 * ```tsx
 * // Simple inline spinner
 * <LovendoLoading type="simple" />
 *
 * // Standard spinner with message
 * <LovendoLoading type="standard" message="Loading..." />
 *
 * // Full screen loading
 * <LovendoLoading type="standard" fullScreen message="Please wait..." />
 *
 * // Premium liquid loading (cinematic)
 * <LovendoLoading type="liquid" message="İpeksi detaylar hazırlanıyor..." />
 * ```
 */

import React, { useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, GRADIENTS, primitives } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type LovendoLoadingType = 'simple' | 'standard' | 'liquid';

export type LoadingSize = 'sm' | 'md' | 'lg';

export type LoadingVariant = 'primary' | 'secondary' | 'trust';

export interface LovendoLoadingProps {
  /** Loading type determines rendering style */
  type?: LovendoLoadingType;

  // Common props
  /** Loading message */
  message?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;

  // Simple/Standard props
  /** ActivityIndicator size for simple/standard */
  size?: 'small' | 'large' | LoadingSize;
  /** Spinner color */
  color?: string;
  /** Full screen mode (standard type only) */
  fullScreen?: boolean;

  // Liquid props
  /** Show or hide the loading (liquid type) */
  visible?: boolean;
  /** Show backdrop blur (liquid type) */
  blur?: boolean;
  /** Intensity of blur 1-100 (liquid type) */
  blurIntensity?: number;
  /** Color variant (liquid type) */
  variant?: LoadingVariant;
  /** Custom messages array for rotation (liquid type) */
  messages?: string[];
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export const LovendoLoading: React.FC<LovendoLoadingProps> = ({
  type = 'standard',
  message,
  style,
  testID,
  size = 'large',
  color = COLORS.brand.primary,
  fullScreen = false,
  visible = true,
  blur = true,
  blurIntensity = 20,
  variant = 'primary',
  messages,
}) => {
  // Map LoadingSize to ActivityIndicator size
  const activityIndicatorSize =
    size === 'sm' || size === 'small' ? 'small' : 'large';

  switch (type) {
    case 'simple':
      return (
        <SimpleLoading
          size={activityIndicatorSize}
          color={color}
          style={style}
          testID={testID}
        />
      );

    case 'liquid':
      return (
        <LiquidLoading
          message={message}
          messages={messages}
          blur={blur}
          blurIntensity={blurIntensity}
          style={style}
          visible={visible}
          size={size as LoadingSize}
          variant={variant}
          testID={testID}
        />
      );

    case 'standard':
    default:
      return (
        <StandardLoading
          size={activityIndicatorSize}
          color={color}
          message={message}
          fullScreen={fullScreen}
          style={style}
          testID={testID}
        />
      );
  }
};

// ═══════════════════════════════════════════════════════════════════
// Simple Loading (replaces LoadingSpinner)
// ═══════════════════════════════════════════════════════════════════

interface SimpleLoadingProps {
  size: 'small' | 'large';
  color: string;
  style?: ViewStyle;
  testID?: string;
}

const SimpleLoading: React.FC<SimpleLoadingProps> = ({
  size,
  color,
  style,
  testID,
}) => (
  <View style={[styles.simpleContainer, style]} testID={testID}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Standard Loading (replaces Spinner)
// ═══════════════════════════════════════════════════════════════════

interface StandardLoadingProps {
  size: 'small' | 'large';
  color: string;
  message?: string;
  fullScreen: boolean;
  style?: ViewStyle;
  testID?: string;
}

const StandardLoading: React.FC<StandardLoadingProps> = ({
  size,
  color,
  message,
  fullScreen,
  style,
  testID,
}) => {
  const containerStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.standardContainer;

  return (
    <View style={[containerStyle, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.standardMessage}>{message}</Text>}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Liquid Loading (Premium Cinematic)
// ═══════════════════════════════════════════════════════════════════

interface LiquidLoadingProps {
  message?: string;
  messages?: string[];
  blur?: boolean;
  blurIntensity?: number;
  style?: ViewStyle;
  visible?: boolean;
  size?: LoadingSize;
  variant?: LoadingVariant;
  testID?: string;
}

// Orbiting Particle Component
interface OrbitingParticleProps {
  delay: number;
  radius: number;
  size: number;
  color: string;
  duration: number;
  clockwise?: boolean;
}

const OrbitingParticle: React.FC<OrbitingParticleProps> = ({
  delay,
  radius,
  size,
  color,
  duration,
  clockwise = true,
}) => {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  const particleStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 } as const,
      shadowOpacity: 0.8,
      shadowRadius: size * 2,
    }),
    [size, color],
  );

  useEffect(() => {
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(clockwise ? 360 : -360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
  }, [delay, duration, clockwise, rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = (rotation.value * Math.PI) / 180;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[styles.orbitingParticle, particleStyle, animatedStyle]}
    />
  );
};

// Neon Ring Component
interface NeonRingProps {
  size: number;
  borderWidth: number;
  duration: number;
  delay?: number;
  colors: readonly [string, string];
}

const NeonRing: React.FC<NeonRingProps> = ({
  size,
  borderWidth,
  duration,
  delay = 0,
  colors,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const containerStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
    }),
    [size],
  );

  const ringStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth,
      borderColor: 'transparent' as const,
      borderTopColor: colors[0],
      borderRightColor: colors[1],
    }),
    [size, borderWidth, colors],
  );

  useEffect(() => {
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false,
      ),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
  }, [delay, duration, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.ringContainer, containerStyle, animatedStyle]}
    >
      <View style={[styles.ring, ringStyle]} />
    </Animated.View>
  );
};

// Progress Dot Component
const ProgressDot: React.FC<{ delay: number; color: string }> = ({
  delay,
  color,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.progressDot, { backgroundColor: color }, animatedStyle]}
    />
  );
};

// Main Liquid Loading Component
const LiquidLoading: React.FC<LiquidLoadingProps> = ({
  message = 'İpeksi detaylar hazırlanıyor...',
  messages,
  blur = true,
  blurIntensity = 20,
  style,
  visible = true,
  size = 'md',
  variant = 'primary',
  testID,
}) => {
  const breathingScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const messageOpacity = useSharedValue(0);

  const variantColors = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          primary: COLORS.secondary,
          secondary: primitives.magenta[400],
          glow: primitives.magenta[300],
          gradient: GRADIENTS.secondary,
        };
      case 'trust':
        return {
          primary: COLORS.trust.primary,
          secondary: primitives.emerald[400],
          glow: primitives.emerald[300],
          gradient: GRADIENTS.trust,
        };
      default:
        return {
          primary: COLORS.primary,
          secondary: primitives.amber[400],
          glow: primitives.amber[300],
          gradient: GRADIENTS.primary,
        };
    }
  }, [variant]);

  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          outerRing: 60,
          innerRing: 48,
          centerDot: 10,
          innerDot: 5,
          particleRadius: 38,
          particleSize: 3,
        };
      case 'lg':
        return {
          outerRing: 120,
          innerRing: 96,
          centerDot: 18,
          innerDot: 9,
          particleRadius: 72,
          particleSize: 6,
        };
      default:
        return {
          outerRing: 80,
          innerRing: 64,
          centerDot: 14,
          innerDot: 7,
          particleRadius: 50,
          particleSize: 4,
        };
    }
  }, [size]);

  const particles = useMemo(() => {
    const particleColors = [
      variantColors.primary,
      variantColors.secondary,
      variantColors.glow,
    ];

    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: i * 200,
      radius: sizeConfig.particleRadius + (i % 2) * 8,
      size: sizeConfig.particleSize + (i % 3),
      color: particleColors[i % particleColors.length],
      duration: 3000 + i * 500,
      clockwise: i % 2 === 0,
    }));
  }, [variantColors, sizeConfig]);

  useEffect(() => {
    if (!visible) return;

    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 }),
      ),
      -1,
      false,
    );

    messageOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
  }, [visible, breathingScale, glowOpacity, messageOpacity]);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  if (!visible) return null;

  const currentMessage = messages?.[0] || message;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.liquidContainer, style]}
      testID={testID}
    >
      {blur ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={styles.backdrop}
        />
      ) : (
        <View style={styles.backdrop} />
      )}

      <View style={styles.overlay} />

      <View style={styles.content}>
        <View
          style={[
            styles.loaderWrapper,
            {
              width: sizeConfig.outerRing + 40,
              height: sizeConfig.outerRing + 40,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                width: sizeConfig.outerRing - 20,
                height: sizeConfig.outerRing - 20,
                borderRadius: (sizeConfig.outerRing - 20) / 2,
                backgroundColor: variantColors.glow,
              },
              breathingStyle,
              glowStyle,
            ]}
          />

          <NeonRing
            size={sizeConfig.outerRing}
            borderWidth={3}
            duration={2000}
            colors={[variantColors.primary, variantColors.secondary]}
          />

          <View style={styles.innerRingWrapper}>
            <NeonRing
              size={sizeConfig.innerRing}
              borderWidth={2}
              duration={2500}
              delay={300}
              colors={[variantColors.secondary, variantColors.primary]}
            />
          </View>

          {particles.map((particle) => (
            <OrbitingParticle
              key={particle.id}
              delay={particle.delay}
              radius={particle.radius}
              size={particle.size}
              color={particle.color}
              duration={particle.duration}
              clockwise={particle.clockwise}
            />
          ))}

          <View
            style={[
              styles.centerDot,
              {
                width: sizeConfig.centerDot,
                height: sizeConfig.centerDot,
                borderRadius: sizeConfig.centerDot / 2,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.innerDot,
                {
                  width: sizeConfig.innerDot,
                  height: sizeConfig.innerDot,
                  borderRadius: sizeConfig.innerDot / 2,
                  backgroundColor: variantColors.primary,
                },
                breathingStyle,
              ]}
            />
          </View>
        </View>

        <Animated.Text style={[styles.liquidMessage, messageStyle]}>
          {currentMessage.toUpperCase()}
        </Animated.Text>

        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <ProgressDot
              key={i}
              delay={i * 200}
              color={variantColors.primary}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Simple loading
  simpleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Standard loading
  standardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    flex: 1,
    justifyContent: 'center',
  },
  standardMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  // Liquid loading
  liquidContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 9, 0.92)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
  },
  ringContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
  },
  innerRingWrapper: {
    position: 'absolute',
  },
  orbitingParticle: {
    position: 'absolute',
    elevation: 6,
  },
  centerDot: {
    position: 'absolute',
    backgroundColor: primitives.stone[900],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  innerDot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  liquidMessage: {
    marginTop: SPACING['2xl'],
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 3,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: 6,
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default LovendoLoading;
