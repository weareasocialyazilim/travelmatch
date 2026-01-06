// components/ui/EmptyState.tsx
// TravelMatch Ultimate Design System 2026
// "Liquid Empty State System" - Zarif Boşluklar
// Awwwards-standard premium empty state with neon particles

import React, { useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, primitives } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../theme/typography';
import { TMButton } from './TMButton';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import type { IllustrationType } from './EmptyStateIllustration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// Neon Particle Component
// ═══════════════════════════════════════════════════════════════════
interface NeonParticleProps {
  delay: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  duration: number;
}

const NeonParticle: React.FC<NeonParticleProps> = ({
  delay,
  startX,
  startY,
  size,
  color,
  duration,
}) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate particle floating upward
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      ),
    );
    // Fade in and out
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 0.3 }),
          withTiming(0.8, { duration: duration * 0.4 }),
          withTiming(0, { duration: duration * 0.3 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, duration, progress, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -60]);
    const translateX = interpolate(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [0, 8, 0, -8, 0],
    );
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.5, 1, 0.5]);

    return {
      transform: [{ translateY }, { translateX }, { scale }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size,
        },
        animatedStyle,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Animated Glow Ring
// ═══════════════════════════════════════════════════════════════════
const GlowRing: React.FC<{ color: string }> = ({ color }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Pulsing glow animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.glowRing,
        {
          backgroundColor: color,
          shadowColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Main EmptyState Component
// ═══════════════════════════════════════════════════════════════════
interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: React.ReactNode;
  illustrationType?: IllustrationType;
  style?: ViewStyle;
  /** Use neon particle animation (default: true) */
  animated?: boolean;
  /** Primary color for glow effects */
  glowColor?: string;
  /** Show emoji decoration */
  emoji?: string;
  /** Variant style */
  variant?: 'default' | 'minimal' | 'premium';
}

/**
 * Awwwards-Standard Empty State Component
 * "Liquid Empty State System" - Zarif Boşluklar
 *
 * Features:
 * - Neon glow effects with pulsing animation
 * - Floating particle system
 * - Premium typography
 * - Gradient icon wrapper
 * - Optional emoji decoration
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
  illustrationType,
  style,
  animated = true,
  glowColor = COLORS.primary,
  emoji,
  variant = 'default',
}) => {
  const desc = description || subtitle;
  const isPremium = variant === 'premium';
  const isMinimal = variant === 'minimal';

  // Generate random particles
  const particles = useMemo(() => {
    if (!animated || isMinimal) return [];

    const particleColors = [
      COLORS.primary,
      COLORS.secondary,
      primitives.amber[300],
      primitives.magenta[300],
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 400,
      startX: 20 + Math.random() * 80,
      startY: 20 + Math.random() * 60,
      size: 4 + Math.random() * 4,
      color: particleColors[i % particleColors.length],
      duration: 3000 + Math.random() * 2000,
    }));
  }, [animated, isMinimal]);

  // Icon scale animation
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (animated && !isMinimal) {
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [animated, isMinimal, iconScale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Render custom illustration if provided
  if (illustration) {
    return (
      <View style={[styles.container, style]}>
        {illustration}
        <Text style={styles.title}>{title}</Text>
        {desc && <Text style={styles.description}>{desc}</Text>}
        {renderActions()}
      </View>
    );
  }

  // Render illustration type
  if (illustrationType) {
    return (
      <View style={[styles.container, style]}>
        <EmptyStateIllustration type={illustrationType} size={160} />
        <Text style={styles.title}>{title}</Text>
        {desc && <Text style={styles.description}>{desc}</Text>}
        {renderActions()}
      </View>
    );
  }

  function renderActions() {
    return (
      <>
        {actionLabel && onAction && (
          <TMButton
            onPress={onAction}
            variant="primary"
            size="md"
            style={styles.button}
            testID="empty-state-action-primary"
          >
            {actionLabel}
          </TMButton>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <TMButton
            onPress={onSecondaryAction}
            variant="ghost"
            size="md"
            style={styles.secondaryButton}
            testID="empty-state-action-secondary"
          >
            {secondaryActionLabel}
          </TMButton>
        )}
      </>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Icon Container with Glow and Particles */}
      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.iconOuterWrapper}
      >
        {/* Neon Particles */}
        {animated &&
          particles.map((particle) => (
            <NeonParticle
              key={particle.id}
              delay={particle.delay}
              startX={particle.startX}
              startY={particle.startY}
              size={particle.size}
              color={particle.color}
              duration={particle.duration}
            />
          ))}

        {/* Pulsing Glow Ring */}
        {animated && !isMinimal && <GlowRing color={glowColor} />}

        {/* Icon Wrapper */}
        <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
          {isPremium ? (
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradientBg}
            >
              <MaterialCommunityIcons
                name={icon}
                size={48}
                color={COLORS.white}
              />
            </LinearGradient>
          ) : (
            <>
              {/* Inner glow */}
              <View style={[styles.iconGlow, { backgroundColor: glowColor }]} />
              <MaterialCommunityIcons
                name={icon}
                size={48}
                color={isMinimal ? primitives.stone[400] : glowColor}
              />
            </>
          )}
        </Animated.View>
      </Animated.View>

      {/* Emoji Decoration */}
      {emoji && (
        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.emoji}
        >
          {emoji}
        </Animated.Text>
      )}

      {/* Title */}
      <Animated.Text
        entering={FadeInUp.delay(100).duration(500)}
        style={[styles.title, isPremium && styles.titlePremium]}
      >
        {title}
      </Animated.Text>

      {/* Description */}
      {desc && (
        <Animated.Text
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.description}
        >
          {desc}
        </Animated.Text>
      )}

      {/* Actions */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.actionsContainer}
      >
        {renderActions()}
      </Animated.View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['3xl'],
    flex: 1,
  },
  iconOuterWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  iconGradientBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.2,
  },
  particle: {
    position: 'absolute',
    elevation: 4,
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  titlePremium: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: SCREEN_WIDTH * 0.75,
    marginBottom: SPACING.xl,
  },
  actionsContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.sm,
  },
  button: {
    minWidth: 180,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
    minWidth: 140,
  },
});

export default EmptyState;
