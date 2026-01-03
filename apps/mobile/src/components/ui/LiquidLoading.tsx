// components/ui/LiquidLoading.tsx
// TravelMatch Ultimate Design System 2026
// "Global Liquid Loading Ceremony" - Twilight Zinc & Neon Genetiği
// Awwwards-standard immersive loading experience

import React, { useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, GRADIENTS, primitives } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// Orbiting Particle Component
// ═══════════════════════════════════════════════════════════════════
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

  useEffect(() => {
    // Start rotation after delay
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(clockwise ? 360 : -360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    // Fade in
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500 })
    );
  }, [delay, duration, clockwise, rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = (rotation.value * Math.PI) / 180;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.orbitingParticle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size * 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Neon Ring Component
// ═══════════════════════════════════════════════════════════════════
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

  useEffect(() => {
    // Rotate ring
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false
      )
    );
    // Scale in with spring
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
  }, [delay, duration, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.ringContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: 'transparent',
            borderTopColor: colors[0],
            borderRightColor: colors[1],
          },
        ]}
      />
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Main LiquidLoading Component
// ═══════════════════════════════════════════════════════════════════
interface LiquidLoadingProps {
  /** Loading message */
  message?: string;
  /** Custom messages array for rotation */
  messages?: string[];
  /** Show backdrop blur */
  blur?: boolean;
  /** Intensity of blur (1-100) */
  blurIntensity?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Show or hide the loading */
  visible?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'trust';
}

/**
 * Awwwards-Standard Immersive Loading Screen
 * "Global Liquid Loading Ceremony"
 *
 * Features:
 * - Multi-layered neon rings with gradient rotation
 * - Orbiting particles with glow trails
 * - Breathing center dot with inner glow
 * - Backdrop blur with darkened overlay
 * - Animated message with letter spacing
 */
export const LiquidLoading: React.FC<LiquidLoadingProps> = ({
  message = 'İpeksi detaylar hazırlanıyor...',
  messages,
  blur = true,
  blurIntensity = 20,
  style,
  visible = true,
  size = 'md',
  variant = 'primary',
}) => {
  // Breathing animation for center dot
  const breathingScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  // Message animation
  const messageOpacity = useSharedValue(0);
  const messageIndex = useSharedValue(0);

  // Get colors based on variant
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

  // Size configurations
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

  // Generate orbiting particles
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

    // Breathing animation
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow pulsing
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );

    // Message fade in
    messageOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 600 })
    );
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
      style={[styles.container, style]}
    >
      {/* Backdrop */}
      {blur ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={styles.backdrop}
        />
      ) : (
        <View style={styles.backdrop} />
      )}

      {/* Darkened Overlay */}
      <View style={styles.overlay} />

      {/* Loading Content */}
      <View style={styles.content}>
        {/* Loader Wrapper */}
        <View
          style={[
            styles.loaderWrapper,
            {
              width: sizeConfig.outerRing + 40,
              height: sizeConfig.outerRing + 40,
            },
          ]}
        >
          {/* Outer Glow */}
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

          {/* Outer Neon Ring */}
          <NeonRing
            size={sizeConfig.outerRing}
            borderWidth={3}
            duration={2000}
            colors={[variantColors.primary, variantColors.secondary]}
          />

          {/* Inner Neon Ring (counter-rotating) */}
          <View style={styles.innerRingWrapper}>
            <NeonRing
              size={sizeConfig.innerRing}
              borderWidth={2}
              duration={2500}
              delay={300}
              colors={[variantColors.secondary, variantColors.primary]}
            />
          </View>

          {/* Orbiting Particles */}
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

          {/* Center Dot */}
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

        {/* Message */}
        <Animated.Text style={[styles.message, messageStyle]}>
          {currentMessage.toUpperCase()}
        </Animated.Text>

        {/* Subtle Progress Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <ProgressDot key={i} delay={i * 200} color={variantColors.primary} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Progress Dot Component
// ═══════════════════════════════════════════════════════════════════
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
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.progressDot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
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
    backgroundColor: 'rgba(12, 10, 9, 0.92)', // Twilight Zinc
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
  message: {
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

export default LiquidLoading;
