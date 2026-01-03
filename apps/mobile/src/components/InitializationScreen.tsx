/**
 * InitializationScreen
 *
 * A premium loading screen shown during app bootstrap.
 * Uses the Liquid Loading Ceremony for immersive experience.
 * Shows:
 * - Neon ring animations with orbiting particles
 * - Loading progress with service names
 * - Error states with retry option
 * - Graceful transition to main app
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
  FadeIn,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { COLORS, GRADIENTS, primitives } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import type { BootstrapProgress, ServiceName } from '../services/appBootstrap';

// Asset imports
const appIcon = require('../../assets/icon.png') as number;

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
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
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
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(scale);
    };
  }, [delay, duration, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
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
// Main InitializationScreen Component
// ═══════════════════════════════════════════════════════════════════
interface InitializationScreenProps {
  progress: BootstrapProgress;
  onRetry?: (serviceName: ServiceName) => void;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({
  progress,
  onRetry,
}) => {
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const breathingScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  const [showDetails, setShowDetails] = useState(false);

  // Particle configuration
  const particles = useMemo(() => {
    const particleColors = [
      COLORS.primary,
      primitives.amber[400],
      primitives.amber[300],
    ];

    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: i * 200,
      radius: 50 + (i % 2) * 8,
      size: 4 + (i % 3),
      color: particleColors[i % particleColors.length],
      duration: 3000 + i * 500,
      clockwise: i % 2 === 0,
    }));
  }, []);

  // Animate logo and breathing on mount
  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 120 });

    // Breathing animation
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Glow pulsing
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(0.25, { duration: 1000 })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(breathingScale);
      cancelAnimation(glowOpacity);
    };
  }, [logoOpacity, logoScale, breathingScale, glowOpacity]);

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const failedServices = Array.from(progress.services.values()).filter(
    (s) => s.status === 'failed'
  );

  const currentService = progress.currentService
    ? progress.services.get(progress.currentService)
    : null;

  const progressPercent = (progress.currentStep / progress.totalSteps) * 100;
  const hasError = failedServices.length > 0 && !progress.canContinue;

  return (
    <View style={styles.container}>
      {/* Twilight Zinc Background */}
      <LinearGradient
        colors={['#0C0A09', '#1C1917', '#0C0A09']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Content */}
      <View style={styles.content}>
        {/* Liquid Loading Ceremony */}
        <View style={styles.loaderWrapper}>
          {/* Outer Glow */}
          <Animated.View
            style={[
              styles.glow,
              { backgroundColor: primitives.amber[300] },
              breathingStyle,
              glowStyle,
            ]}
          />

          {/* Outer Neon Ring */}
          <NeonRing
            size={100}
            borderWidth={3}
            duration={2000}
            colors={[COLORS.primary, primitives.amber[400]]}
          />

          {/* Inner Neon Ring (counter-rotating) */}
          <View style={styles.innerRingWrapper}>
            <NeonRing
              size={80}
              borderWidth={2}
              duration={2500}
              delay={300}
              colors={[primitives.amber[400], COLORS.primary]}
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

          {/* Center Logo */}
          <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
            <Image source={appIcon} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* App Name */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Text style={styles.appName}>TravelMatch</Text>
          <Text style={styles.tagline}>Give a moment. See it happen.</Text>
        </Animated.View>
      </View>

      {/* Progress Section */}
      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.progressSection}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Status Text */}
        {currentService && !hasError && (
          <View style={styles.statusContainer}>
            <LoadingDots />
            <Text style={styles.statusText}>
              {currentService.displayName}...
            </Text>
          </View>
        )}

        {/* Error State */}
        {hasError && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={styles.errorContainer}
          >
            <Text style={styles.errorTitle}>⚠️ Kritik hata oluştu</Text>
            {failedServices.map((service) => (
              <View key={service.name} style={styles.errorItem}>
                <Text style={styles.errorText}>
                  {service.displayName}: {service.error}
                </Text>
                {onRetry && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => onRetry(service.name)}
                  >
                    <Text style={styles.retryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Non-critical failures */}
        {failedServices.length > 0 && progress.canContinue && (
          <TouchableOpacity
            style={styles.warningContainer}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.warningText}>
              ⚠️ {failedServices.length} servis yüklenemedi (detay için dokun)
            </Text>
            {showDetails && (
              <View style={styles.detailsContainer}>
                {failedServices.map((service) => (
                  <Text key={service.name} style={styles.detailText}>
                    • {service.displayName}: {service.error}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Loading Dots Component
// ═══════════════════════════════════════════════════════════════════
const LoadingDots: React.FC = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    dot2Opacity.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    dot3Opacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(dot1Opacity);
      cancelAnimation(dot2Opacity);
      cancelAnimation(dot3Opacity);
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3Opacity.value }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  loaderWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
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
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primitives.stone[900],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  logo: {
    width: 40,
    height: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    color: COLORS.textOnDarkSecondary,
  },
  progressSection: {
    paddingHorizontal: SPACING['2xl'],
    paddingBottom: SPACING['4xl'],
  },
  progressBarContainer: {
    marginBottom: SPACING.base,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textOnDarkSecondary,
    marginLeft: SPACING.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 2,
  },
  errorContainer: {
    marginTop: SPACING.base,
    padding: SPACING.base,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: primitives.red[400],
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: primitives.red[300],
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: primitives.red[500],
    borderRadius: 6,
    marginLeft: SPACING.sm,
  },
  retryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  warningContainer: {
    marginTop: SPACING.base,
    padding: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: primitives.amber[400],
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
  },
  detailText: {
    ...TYPOGRAPHY.caption,
    color: primitives.amber[300],
    marginTop: SPACING.xs,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 1,
  },
});

export default InitializationScreen;
