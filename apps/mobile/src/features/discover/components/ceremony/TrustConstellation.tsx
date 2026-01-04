/**
 * TrustConstellation Component
 *
 * Visual star map representation of trust milestones.
 * Each verification milestone is a star, connections between them show trust level.
 *
 * @example
 * ```tsx
 * <TrustConstellation
 *   milestones={user.verificationMilestones}
 *   score={user.trustScore}
 *   size="lg"
 *   onMilestonePress={handleMilestoneDetail}
 *   showBadge={user.trustScore >= 80}
 * />
 * ```
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  FadeInUp,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_SIZES,
  CEREMONY_A11Y,
  DEFAULT_MILESTONES,
  type TrustMilestone,
} from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

const AnimatedLine = Animated.createAnimatedComponent(Line);

type ConstellationSize = 'sm' | 'md' | 'lg';

interface TrustConstellationProps {
  /** User's milestones */
  milestones: TrustMilestone[];
  /** Total trust score (0-100) - legacy compatibility */
  score?: number;
  /** Component size */
  size?: ConstellationSize;
  /** Show animation */
  animated?: boolean;
  /** On milestone press */
  onMilestonePress?: (milestone: TrustMilestone) => void;
  /** Show badge when complete */
  showBadge?: boolean;
  /** Theme variant */
  variant?: 'light' | 'dark';
  /** Test ID */
  testID?: string;
}

const getSizeValue = (size: ConstellationSize): number => {
  return CEREMONY_SIZES.constellation[size];
};

export const TrustConstellation: React.FC<TrustConstellationProps> = ({
  milestones = DEFAULT_MILESTONES,
  score: _score = 0,
  size = 'md',
  animated = true,
  onMilestonePress,
  showBadge = false,
  variant = 'light',
  testID,
}) => {
  const containerSize = getSizeValue(size);
  const starRadius = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
  const iconSize = size === 'sm' ? 10 : size === 'md' ? 14 : 18;

  // Calculate verified count for badge
  const verifiedCount = useMemo(
    () => milestones.filter((m) => m.verified).length,
    [milestones],
  );
  const totalCount = milestones.length;
  const allVerified = verifiedCount === totalCount;

  // Animation values
  const drawProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Draw constellation
      drawProgress.value = withDelay(
        300,
        withTiming(1, {
          duration: CEREMONY_TIMING.constellationDraw,
          easing: Easing.out(Easing.cubic),
        }),
      );

      // Glow animation for verified stars
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
        ),
        -1,
        true,
      );

      // Badge animation
      if (showBadge && allVerified) {
        badgeScale.value = withDelay(
          CEREMONY_TIMING.constellationDraw + 500,
          withSequence(
            withTiming(1.2, { duration: 200 }),
            withTiming(1, { duration: 150 }),
          ),
        );
      }
    } else {
      drawProgress.value = 1;
      if (showBadge && allVerified) {
        badgeScale.value = 1;
      }
    }
  }, [animated, showBadge, allVerified]);

  const handleMilestonePress = (milestone: TrustMilestone) => {
    if (milestone.verified) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMilestonePress?.(milestone);
  };

  // Render connections between milestones
  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    const renderedPairs = new Set<string>();

    milestones.forEach((milestone) => {
      milestone.connections.forEach((connectedId) => {
        const pairKey = [milestone.id, connectedId].sort().join('-');
        if (renderedPairs.has(pairKey)) return;
        renderedPairs.add(pairKey);

        const connectedMilestone = milestones.find((m) => m.id === connectedId);
        if (!connectedMilestone) return;

        const bothVerified = milestone.verified && connectedMilestone.verified;
        const x1 = milestone.position.x * containerSize;
        const y1 = milestone.position.y * containerSize;
        const x2 = connectedMilestone.position.x * containerSize;
        const y2 = connectedMilestone.position.y * containerSize;

        connections.push(
          <ConnectionLine
            key={pairKey}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            verified={bothVerified}
            progress={drawProgress}
            delay={connections.length * 100}
          />,
        );
      });
    });

    return connections;
  };

  // Badge animated style
  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  const isDark = variant === 'dark';

  return (
    <View
      style={[
        styles.container,
        { width: containerSize, height: containerSize },
      ]}
      testID={testID}
      accessible
      accessibilityLabel={`${CEREMONY_A11Y.labels.trustConstellation}. ${verifiedCount} / ${totalCount} doğrulandı`}
    >
      {/* SVG Layer for connections */}
      <Svg
        width={containerSize}
        height={containerSize}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <Stop
              offset="0%"
              stopColor={CEREMONY_COLORS.constellation.glowing}
              stopOpacity="0.8"
            />
            <Stop
              offset="100%"
              stopColor={CEREMONY_COLORS.constellation.glowing}
              stopOpacity="0"
            />
          </RadialGradient>
        </Defs>
        <G>{renderConnections()}</G>
      </Svg>

      {/* Stars Layer */}
      {milestones.map((milestone, index) => (
        <StarNode
          key={milestone.id}
          milestone={milestone}
          containerSize={containerSize}
          starRadius={starRadius}
          iconSize={iconSize}
          progress={drawProgress}
          glowOpacity={glowOpacity}
          delay={index * CEREMONY_TIMING.starStagger}
          animated={animated}
          isDark={isDark}
          onPress={() => handleMilestonePress(milestone)}
        />
      ))}

      {/* Trusted Host Badge */}
      {showBadge && allVerified && (
        <Animated.View
          style={[styles.badge, badgeAnimatedStyle]}
          entering={FadeInUp.delay(CEREMONY_TIMING.constellationDraw + 300)}
        >
          <MaterialCommunityIcons
            name="crown"
            size={size === 'sm' ? 14 : size === 'md' ? 18 : 22}
            color={COLORS.trustGold}
          />
          <Text
            style={[
              styles.badgeText,
              isDark && styles.badgeTextDark,
              size === 'sm' && styles.badgeTextSmall,
            ]}
          >
            Trusted Host
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Star Node Component
interface StarNodeProps {
  milestone: TrustMilestone;
  containerSize: number;
  starRadius: number;
  iconSize: number;
  progress: SharedValue<number>;
  glowOpacity: SharedValue<number>;
  delay: number;
  animated: boolean;
  isDark: boolean;
  onPress: () => void;
}

const StarNode: React.FC<StarNodeProps> = ({
  milestone,
  containerSize,
  starRadius,
  iconSize,
  progress: _progress,
  glowOpacity,
  delay,
  animated,
  isDark,
  onPress,
}) => {
  const starScale = useSharedValue(0);
  const x = milestone.position.x * containerSize;
  const y = milestone.position.y * containerSize;

  useEffect(() => {
    if (animated) {
      starScale.value = withDelay(
        delay + 300,
        withSequence(
          withTiming(1.3, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );
    } else {
      starScale.value = 1;
    }
  }, [animated, delay]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - starRadius },
      { translateY: y - starRadius },
      { scale: starScale.value },
    ],
    opacity: interpolate(starScale.value, [0, 0.5, 1], [0, 0.5, 1]),
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: milestone.verified ? glowOpacity.value : 0,
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessible
      accessibilityLabel={`${milestone.label}. ${
        milestone.verified
          ? CEREMONY_A11Y.hints.milestoneVerified
          : CEREMONY_A11Y.hints.milestonePending
      }`}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.star,
          {
            width: starRadius * 2,
            height: starRadius * 2,
            borderRadius: starRadius,
          },
          starAnimatedStyle,
        ]}
      >
        {/* Glow effect for verified */}
        {milestone.verified && (
          <Animated.View
            style={[
              styles.starGlow,
              {
                width: starRadius * 3,
                height: starRadius * 3,
                borderRadius: starRadius * 1.5,
                backgroundColor: CEREMONY_COLORS.constellation.glowing,
              },
              glowAnimatedStyle,
            ]}
          />
        )}

        {/* Star circle */}
        <View
          style={[
            styles.starCircle,
            {
              width: starRadius * 2,
              height: starRadius * 2,
              borderRadius: starRadius,
              backgroundColor: milestone.verified
                ? CEREMONY_COLORS.constellation.verified
                : isDark
                  ? '#3F3F46'
                  : CEREMONY_COLORS.constellation.unverified,
              borderColor: milestone.verified
                ? CEREMONY_COLORS.constellation.glowing
                : isDark
                  ? '#52525B'
                  : '#9CA3AF',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={milestone.icon as any}
            size={iconSize}
            color={
              milestone.verified
                ? CEREMONY_COLORS.constellation.starCenter
                : isDark
                  ? '#71717A'
                  : '#9CA3AF'
            }
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Connection Line Component
interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  verified: boolean;
  progress: SharedValue<number>;
  delay: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  verified,
  progress,
  delay: _delay,
}) => {
  const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  const animatedProps = useAnimatedProps(() => {
    const dashOffset = lineLength * (1 - progress.value);
    return {
      strokeDashoffset: dashOffset,
    };
  });

  return (
    <AnimatedLine
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={
        verified
          ? CEREMONY_COLORS.constellation.verified
          : CEREMONY_COLORS.constellation.connection
      }
      strokeWidth={verified ? 2 : 1}
      strokeDasharray={lineLength}
      animatedProps={animatedProps}
      strokeLinecap="round"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlow: {
    position: 'absolute',
    shadowColor: CEREMONY_COLORS.constellation.glowing,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  starCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    bottom: -24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 12,
    gap: SPACING.xxs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  badgeTextDark: {
    color: COLORS.textInverse,
  },
  badgeTextSmall: {
    fontSize: 9,
  },
});

export default TrustConstellation;
