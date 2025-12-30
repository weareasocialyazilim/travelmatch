/**
 * SunsetClock Component
 *
 * Visualizes proof deadline with a cinematic sunset animation.
 * As time decreases, sun approaches horizon and colors shift dramatically.
 *
 * @example
 * ```tsx
 * <SunsetClock
 *   deadline={gift.escrowUntil}
 *   size="full"
 *   showTimeText
 *   onExtendPress={handleExtend}
 *   canExtend={user.isPremium}
 *   enableHaptics
 * />
 * ```
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_SIZES,
  CEREMONY_A11Y,
  SUNSET_PHASE_THRESHOLDS,
  SUNSET_PHASE_MESSAGES,
  type SunsetPhase,
} from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

type SunsetClockSize = 'compact' | 'full';

interface SunsetClockProps {
  /** Deadline timestamp */
  deadline: Date;
  /** Size variant */
  size?: SunsetClockSize;
  /** Show remaining time as text */
  showTimeText?: boolean;
  /** Extension button press handler (premium) */
  onExtendPress?: () => void;
  /** Can user extend deadline */
  canExtend?: boolean;
  /** Called when time expires */
  onExpire?: () => void;
  /** Enable haptic feedback on phase changes */
  enableHaptics?: boolean;
  /** Test ID */
  testID?: string;
}

// Calculate remaining time in hours
const getRemainingHours = (deadline: Date): number => {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  return remaining / (1000 * 60 * 60);
};

// Calculate sunset phase based on remaining time
const calculatePhase = (deadline: Date): SunsetPhase => {
  const hours = getRemainingHours(deadline);

  if (hours <= 0) return 'expired';
  if (hours <= 1) return 'twilight';
  if (hours <= 6) return 'urgent';
  if (hours <= 24) return 'warning';
  if (hours <= 72) return 'golden';
  return 'peaceful';
};

// Calculate sun position (0 = at horizon, 1 = at top)
const calculateSunPosition = (deadline: Date): number => {
  const now = new Date();
  const total = 7 * 24 * 60 * 60 * 1000; // 7 days total
  const remaining = deadline.getTime() - now.getTime();
  return Math.max(0, Math.min(1, remaining / total));
};

// Format remaining time
const formatTimeRemaining = (deadline: Date): string => {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) return 'Süre doldu';

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} gün ${hours} saat`;
  }
  if (hours > 0) {
    return `${hours} saat ${minutes} dk`;
  }
  return `${minutes} dakika`;
};

// Get gradient colors for phase
const getGradientColors = (
  phase: SunsetPhase
): readonly [string, string, string] => {
  return CEREMONY_COLORS.sky[phase] as readonly [string, string, string];
};

export const SunsetClock: React.FC<SunsetClockProps> = ({
  deadline,
  size = 'compact',
  showTimeText = false,
  onExtendPress,
  canExtend = false,
  onExpire,
  enableHaptics = false,
  testID,
}) => {
  const containerSize = CEREMONY_SIZES.sunsetClock[size];
  const isCompact = size === 'compact';

  const [phase, setPhase] = useState<SunsetPhase>(() => calculatePhase(deadline));
  const [timeText, setTimeText] = useState(() => formatTimeRemaining(deadline));
  const previousPhase = React.useRef(phase);

  // Animation values
  const sunPosition = useSharedValue(calculateSunPosition(deadline));
  const sunGlow = useSharedValue(0.5);
  const waveOffset = useSharedValue(0);

  // Update time and phase
  useEffect(() => {
    const updateClock = () => {
      const newPhase = calculatePhase(deadline);
      const newPosition = calculateSunPosition(deadline);
      const newTimeText = formatTimeRemaining(deadline);

      setTimeText(newTimeText);

      // Phase change detection
      if (newPhase !== previousPhase.current) {
        setPhase(newPhase);

        // Haptic feedback on phase change
        if (enableHaptics) {
          if (newPhase === 'urgent' || newPhase === 'twilight') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } else if (newPhase === 'expired') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            onExpire?.();
          }
        }

        previousPhase.current = newPhase;
      }

      // Animate sun position
      sunPosition.value = withTiming(newPosition, {
        duration: CEREMONY_TIMING.sunsetTransition,
        easing: Easing.out(Easing.ease),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline, enableHaptics, onExpire]);

  // Sun glow animation
  useEffect(() => {
    sunGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );

    // Wave animation
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Sun animated style
  const sunAnimatedStyle = useAnimatedStyle(() => {
    const containerHeight = isCompact ? containerSize * 0.7 : containerSize * 0.6;
    const sunY = interpolate(
      sunPosition.value,
      [0, 1],
      [containerHeight - 10, 0]
    );

    return {
      transform: [{ translateY: sunY }],
      opacity: phase === 'expired' ? 0 : 1,
    };
  });

  // Sun glow animated style
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sunGlow.value,
    transform: [{ scale: interpolate(sunGlow.value, [0.5, 0.8], [1, 1.1]) }],
  }));

  const gradientColors = getGradientColors(phase);
  const phaseMessage = SUNSET_PHASE_MESSAGES[phase];

  const sunSize = isCompact ? 24 : 48;
  const glowSize = isCompact ? 40 : 80;

  return (
    <View
      style={[
        styles.container,
        { width: containerSize, height: isCompact ? containerSize : containerSize * 0.8 },
      ]}
      testID={testID}
      accessible
      accessibilityLabel={`${CEREMONY_A11Y.labels.sunsetClock}. ${CEREMONY_A11Y.hints.timeRemaining(timeText)}`}
    >
      {/* Sky gradient */}
      <LinearGradient
        colors={gradientColors}
        style={styles.sky}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Sun */}
        <Animated.View
          style={[
            styles.sunContainer,
            { top: isCompact ? 8 : 20 },
            sunAnimatedStyle,
          ]}
        >
          {/* Sun glow */}
          <Animated.View
            style={[
              styles.sunGlow,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor:
                  phase === 'twilight'
                    ? CEREMONY_COLORS.sunset.twilight
                    : CEREMONY_COLORS.sunset.peaceful,
              },
              glowAnimatedStyle,
            ]}
          />
          {/* Sun body */}
          <View
            style={[
              styles.sun,
              {
                width: sunSize,
                height: sunSize,
                borderRadius: sunSize / 2,
                backgroundColor:
                  phase === 'twilight' || phase === 'urgent'
                    ? '#FF6B6B'
                    : '#FCD34D',
              },
            ]}
          />
        </Animated.View>

        {/* Stars (visible in twilight/expired) */}
        {(phase === 'twilight' || phase === 'expired') && (
          <View style={styles.starsContainer}>
            {[...Array(isCompact ? 3 : 8)].map((_, i) => (
              <Star key={i} index={i} size={isCompact ? 2 : 3} />
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Horizon line */}
      <View style={styles.horizon} />

      {/* Ocean/Ground */}
      <View
        style={[
          styles.ground,
          {
            height: isCompact ? 20 : 40,
            backgroundColor:
              phase === 'twilight' || phase === 'expired'
                ? '#1E1B4B'
                : '#0EA5E9',
          },
        ]}
      >
        {/* Wave effect */}
        <WaveEffect phase={phase} isCompact={isCompact} />
      </View>

      {/* Time text */}
      {showTimeText && (
        <View style={styles.timeContainer}>
          <Text
            style={[
              styles.timeText,
              isCompact && styles.timeTextCompact,
              (phase === 'twilight' || phase === 'expired') && styles.timeTextLight,
            ]}
          >
            {timeText}
          </Text>
          {!isCompact && (
            <Text
              style={[
                styles.phaseText,
                (phase === 'urgent' || phase === 'twilight') && styles.phaseTextUrgent,
              ]}
            >
              {phaseMessage}
            </Text>
          )}
        </View>
      )}

      {/* Extend button (premium) */}
      {canExtend && onExtendPress && !isCompact && phase !== 'expired' && (
        <TouchableOpacity
          style={styles.extendButton}
          onPress={onExtendPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="clock-plus-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.extendText}>Süre Uzat</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Star component for night sky
const Star: React.FC<{ index: number; size: number }> = ({ index, size }) => {
  const twinkle = useSharedValue(0.3);

  useEffect(() => {
    twinkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 + index * 200 }),
        withTiming(0.3, { duration: 800 + index * 200 })
      ),
      -1,
      true
    );
  }, [index]);

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: twinkle.value,
  }));

  // Random positions
  const positions = [
    { top: 10, left: '20%' },
    { top: 15, right: '25%' },
    { top: 8, left: '45%' },
    { top: 20, right: '15%' },
    { top: 12, left: '10%' },
    { top: 18, right: '40%' },
    { top: 6, left: '70%' },
    { top: 14, right: '60%' },
  ];

  const pos = positions[index % positions.length];

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          ...pos,
        },
        twinkleStyle,
      ]}
    />
  );
};

// Wave effect component
const WaveEffect: React.FC<{ phase: SunsetPhase; isCompact: boolean }> = ({
  phase,
  isCompact,
}) => {
  const waveOffset = useSharedValue(0);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(waveOffset.value, [0, 1], [0, -20]) }],
  }));

  const waveColor =
    phase === 'twilight' || phase === 'expired'
      ? 'rgba(124, 58, 237, 0.3)'
      : 'rgba(255, 255, 255, 0.2)';

  return (
    <Animated.View style={[styles.wave, waveStyle]}>
      <View
        style={[
          styles.waveLine,
          { backgroundColor: waveColor, height: isCompact ? 2 : 3 },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  sky: {
    flex: 1,
    position: 'relative',
  },
  sunContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunGlow: {
    position: 'absolute',
  },
  sun: {
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  horizon: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  ground: {
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
  },
  waveLine: {
    width: '200%',
    borderRadius: 2,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeTextCompact: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeTextLight: {
    color: COLORS.textInverse,
  },
  phaseText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phaseTextUrgent: {
    color: CEREMONY_COLORS.sunset.urgent,
    fontWeight: '600',
  },
  extendButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 12,
    gap: 4,
  },
  extendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default SunsetClock;
