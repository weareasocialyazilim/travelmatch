/**
 * SuccessCeremony Component
 *
 * Universal full-screen success ceremony for completing important actions.
 * Features silky confetti animation, animated icon, and celebration haptics.
 * Part of TravelMatch "Cinematic Trust Jewelry" design system.
 *
 * Use cases:
 * - Auth success (registration, login)
 * - Payment completion
 * - Profile completion
 * - Gift sent/received
 * - Any milestone achievement
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { CEREMONY_COLORS, CEREMONY_TIMING } from '../../constants/ceremony';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti configuration
const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = CEREMONY_COLORS.celebration.confetti;

interface SuccessCeremonyProps {
  /** Main headline text */
  title: string;
  /** Subtitle/message text */
  message: string;
  /** CTA button text */
  buttonText: string;
  /** Callback when CTA is pressed */
  onPress: () => void;
  /** Icon name from MaterialCommunityIcons (default: 'check-decagram') */
  icon?: string;
  /** Custom icon color (default: white) */
  iconColor?: string;
  /** Secondary action text (optional) */
  secondaryText?: string;
  /** Secondary action callback */
  onSecondaryPress?: () => void;
  /** Whether to show confetti animation (default: true) */
  showConfetti?: boolean;
  /** Whether to trigger haptic feedback (default: true) */
  enableHaptics?: boolean;
  /** Test ID for testing */
  testID?: string;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  size: number;
  color: string;
  rotation: number;
  swayAmplitude: number;
}

// Generate confetti pieces with random properties
const generateConfetti = (): ConfettiPiece[] => {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 1000,
    size: 6 + Math.random() * 10,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    swayAmplitude: 20 + Math.random() * 40,
  }));
};

// Individual confetti piece component
const ConfettiPieceComponent: React.FC<{ piece: ConfettiPiece }> = ({
  piece,
}) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Fall animation
    translateY.value = withDelay(
      piece.delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 3000 + Math.random() * 2000,
        easing: Easing.out(Easing.quad),
      }),
    );

    // Sway animation
    translateX.value = withDelay(
      piece.delay,
      withRepeat(
        withSequence(
          withTiming(piece.swayAmplitude, { duration: 500 }),
          withTiming(-piece.swayAmplitude, { duration: 500 }),
        ),
        -1,
        true,
      ),
    );

    // Rotation animation
    rotate.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(piece.rotation + 360, { duration: 2000 }),
        -1,
        false,
      ),
    );

    // Fade out near bottom
    opacity.value = withDelay(
      piece.delay + 2500,
      withTiming(0, { duration: 500 }),
    );
  }, [translateY, translateX, rotate, opacity, piece]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          borderRadius: piece.size * 0.1,
        },
        animatedStyle,
      ]}
    />
  );
};

export const SuccessCeremony: React.FC<SuccessCeremonyProps> = ({
  title,
  message,
  buttonText,
  onPress,
  icon = 'check-decagram',
  iconColor = COLORS.utility.white,
  secondaryText,
  onSecondaryPress,
  showConfetti = true,
  enableHaptics = true,
  testID,
}) => {
  // Animation values
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Generate confetti pieces
  const confettiPieces = React.useMemo(() => generateConfetti(), []);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(() => {
    if (enableHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [enableHaptics]);

  // Start animations on mount
  useEffect(() => {
    // Haptic feedback
    runOnJS(triggerHaptic)();

    // Icon entrance with bounce
    iconScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
      mass: 1,
    });

    // Icon subtle rotation wiggle
    iconRotation.value = withSequence(
      withTiming(-8, { duration: 100 }),
      withTiming(8, { duration: 100 }),
      withTiming(-4, { duration: 100 }),
      withTiming(4, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );

    // Glow pulse
    glowOpacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: CEREMONY_TIMING.glowPulse / 2 }),
          withTiming(0.3, { duration: CEREMONY_TIMING.glowPulse / 2 }),
        ),
        -1,
        true,
      ),
    );

    // Content fade in
    contentOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500 }),
    );
    contentTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 100 }),
    );

    // Button entrance
    buttonScale.value = withDelay(
      700,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
  }, [
    iconScale,
    iconRotation,
    contentOpacity,
    contentTranslateY,
    buttonScale,
    glowOpacity,
    triggerHaptic,
  ]);

  // Animated styles
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Button press handler
  const handlePress = useCallback(() => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [enableHaptics, onPress]);

  // Secondary action handler
  const handleSecondaryPress = useCallback(() => {
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSecondaryPress?.();
  }, [enableHaptics, onSecondaryPress]);

  return (
    <View style={styles.container} testID={testID}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#0C0A09', '#1C1917', '#0C0A09']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Confetti layer */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiPieces.map((piece) => (
            <ConfettiPieceComponent key={piece.id} piece={piece} />
          ))}
        </View>
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Icon with glow */}
          <View style={styles.iconWrapper}>
            {/* Glow effect */}
            <Animated.View style={[styles.iconGlow, glowStyle]}>
              <LinearGradient
                colors={GRADIENTS.gift as unknown as string[]}
                style={styles.glowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Icon container */}
            <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
              <LinearGradient
                colors={GRADIENTS.gift as unknown as string[]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={56}
                  color={iconColor}
                />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Text content */}
          <Animated.View style={[styles.textContainer, contentStyle]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
            <Animated.View style={styles.buttonContainer}>
              <LinearGradient
                colors={GRADIENTS.gift as unknown as string[]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={styles.buttonText}
                  onPress={handlePress}
                  suppressHighlighting
                >
                  {buttonText}
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Secondary action */}
            {secondaryText && onSecondaryPress && (
              <Text
                style={styles.secondaryText}
                onPress={handleSecondaryPress}
                suppressHighlighting
              >
                {secondaryText}
              </Text>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    top: -20,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    opacity: 0.3,
  },
  iconContainer: {
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...TYPOGRAPHY.hero,
    color: COLORS.textOnDark,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  message: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: COLORS.utility.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textOnDarkMuted,
    marginTop: 20,
    paddingVertical: 8,
  },
});

export default SuccessCeremony;
