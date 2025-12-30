/**
 * TrustScoreCircle Component
 *
 * Premium circular trust score visualization
 * Design inspired by DailyLoop's minimal aesthetic
 *
 * Features:
 * - Animated circular progress ring
 * - Color-coded segments for trust factors
 * - Central score display with level icon
 * - Floating stat cards below
 * - Premium "jewelry" aesthetic with soft shadows
 *
 * Following 60-30-10 color rule:
 * - 60% Background (stone[50])
 * - 30% Text/Secondary (stone[900], stone[500])
 * - 10% Accent (gradient amber → magenta)
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives, SHADOWS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface TrustFactor {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export interface TrustScoreCircleProps {
  /** Overall trust score (0-100) */
  score: number;
  /** Trust level name */
  level: string;
  /** Trust factors breakdown */
  factors?: TrustFactor[];
  /** Size of the circle */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show animation on mount */
  animated?: boolean;
}

// Default trust factors if none provided
const DEFAULT_FACTORS: TrustFactor[] = [
  { id: '1', name: 'Kimlik', value: 0, maxValue: 30, color: '#10B981', icon: 'shield-check' },
  { id: '2', name: 'Sosyal', value: 0, maxValue: 15, color: '#3B82F6', icon: 'link-variant' },
  { id: '3', name: 'Deneyim', value: 0, maxValue: 30, color: '#EC4899', icon: 'check-circle' },
  { id: '4', name: 'Yanıt', value: 0, maxValue: 15, color: '#F59E0B', icon: 'message-reply' },
  { id: '5', name: 'Puan', value: 0, maxValue: 10, color: '#8B5CF6', icon: 'star' },
];

export const TrustScoreCircle: React.FC<TrustScoreCircleProps> = ({
  score,
  level,
  factors = DEFAULT_FACTORS,
  size = SCREEN_WIDTH * 0.55,
  strokeWidth = 12,
  animated = true,
}) => {
  const progress = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate on mount
  useEffect(() => {
    if (animated) {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      cardOpacity.value = withTiming(1, { duration: 600 });
      progress.value = withDelay(
        400,
        withTiming(score / 100, {
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    } else {
      cardScale.value = 1;
      cardOpacity.value = 1;
      progress.value = score / 100;
    }
  }, [score, animated, progress, cardScale, cardOpacity]);

  // Get level color based on score
  const levelColor = useMemo(() => {
    if (score >= 90) return primitives.purple[500];
    if (score >= 70) return primitives.emerald[500];
    if (score >= 40) return primitives.amber[500];
    return primitives.magenta[500];
  }, [score]);

  // Get level icon
  const getLevelIcon = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (score >= 90) return 'crown';
    if (score >= 70) return 'flower';
    if (score >= 40) return 'leaf';
    return 'sprout';
  };

  // Animated props for main progress circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Card animation
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  // Calculate factor segments
  const factorSegments = useMemo(() => {
    let startAngle = -90;
    return factors.map((factor) => {
      const percentage = (factor.maxValue / 100) * 360;
      const fillPercentage = factor.value / factor.maxValue;
      const segment = {
        ...factor,
        startAngle,
        endAngle: startAngle + percentage,
        fillPercentage,
      };
      startAngle += percentage;
      return segment;
    });
  }, [factors]);

  return (
    <View style={styles.container}>
      {/* Stacked Card Background Effect (DailyLoop style) */}
      <View style={styles.stackContainer}>
        <View style={[styles.stackedCard, styles.stackedCard2]} />
        <View style={[styles.stackedCard, styles.stackedCard1]} />

        {/* Main Circle Card */}
        <Animated.View style={[styles.circleCard, cardAnimatedStyle]}>
          <View style={[styles.circleContainer, { width: size, height: size }]}>
            <Svg width={size} height={size}>
              <Defs>
                <LinearGradient id="trustScoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor={primitives.amber[500]} />
                  <Stop offset="100%" stopColor={primitives.magenta[500]} />
                </LinearGradient>
              </Defs>

              {/* Background track */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={primitives.stone[100]}
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Factor segment indicators (outer ring) */}
              <G rotation={-90} origin={`${center}, ${center}`}>
                {factorSegments.map((segment) => {
                  const segmentRadius = radius + strokeWidth / 2 + 6;
                  const segmentCircumference = 2 * Math.PI * segmentRadius;
                  const segmentLength = (segment.endAngle - segment.startAngle) / 360;
                  const gapSize = 0.012;

                  return (
                    <Circle
                      key={segment.id}
                      cx={center}
                      cy={center}
                      r={segmentRadius}
                      stroke={segment.color}
                      strokeWidth={4}
                      fill="none"
                      strokeDasharray={`${segmentCircumference * (segmentLength - gapSize)} ${segmentCircumference}`}
                      strokeDashoffset={-segmentCircumference * (segment.startAngle / 360)}
                      strokeLinecap="round"
                      opacity={0.25 + segment.fillPercentage * 0.75}
                    />
                  );
                })}
              </G>

              {/* Main progress arc */}
              <G rotation={-90} origin={`${center}, ${center}`}>
                <AnimatedCircle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#trustScoreGradient)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  animatedProps={animatedProps}
                  strokeLinecap="round"
                />
              </G>
            </Svg>

            {/* Center Content */}
            <View style={styles.centerContent}>
              <View style={[styles.levelIconContainer, { backgroundColor: `${levelColor}12` }]}>
                <MaterialCommunityIcons
                  name={getLevelIcon()}
                  size={24}
                  color={levelColor}
                />
              </View>
              <Text style={styles.scoreText}>{score}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
              <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Factor Stats Cards - Floating design */}
      <View style={styles.statsContainer}>
        {factors.slice(0, 3).map((factor, index) => (
          <StatCard key={factor.id} factor={factor} index={index} animated={animated} />
        ))}
      </View>

      {/* Additional Stats Row */}
      <View style={styles.additionalStats}>
        {factors.slice(3).map((factor) => (
          <View key={factor.id} style={styles.additionalStatItem}>
            <View style={[styles.additionalStatDot, { backgroundColor: factor.color }]} />
            <Text style={styles.additionalStatLabel}>{factor.name}</Text>
            <Text style={styles.additionalStatValue}>
              {factor.value}/{factor.maxValue}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Animated Stat Card Component
const StatCard: React.FC<{ factor: TrustFactor; index: number; animated: boolean }> = ({
  factor,
  index,
  animated
}) => {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);

  useEffect(() => {
    if (animated) {
      cardOpacity.value = withDelay(800 + index * 100, withTiming(1, { duration: 400 }));
      cardTranslateY.value = withDelay(800 + index * 100, withSpring(0, { damping: 15 }));
    } else {
      cardOpacity.value = 1;
      cardTranslateY.value = 0;
    }
  }, [index, animated, cardOpacity, cardTranslateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <View style={[styles.statIcon, { backgroundColor: `${factor.color}12` }]}>
        <MaterialCommunityIcons
          name={factor.icon}
          size={18}
          color={factor.color}
        />
      </View>
      <Text style={styles.statValue}>
        {factor.id === '5' ? factor.value.toFixed(1) : factor.value}
      </Text>
      <Text style={styles.statLabel}>{factor.name}</Text>
    </Animated.View>
  );
};

// Compact version for profile headers
export const TrustScoreRingCompact: React.FC<{
  score: number;
  size?: number;
  strokeWidth?: number;
}> = ({ score, size = 80, strokeWidth = 6 }) => {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const levelColor = useMemo(() => {
    if (score >= 90) return primitives.purple[500];
    if (score >= 70) return primitives.emerald[500];
    if (score >= 40) return primitives.amber[500];
    return primitives.magenta[500];
  }, [score]);

  return (
    <View style={[stylesCompact.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="compactGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={primitives.amber[500]} />
            <Stop offset="100%" stopColor={primitives.magenta[500]} />
          </LinearGradient>
        </Defs>

        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={primitives.stone[100]}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <G rotation={-90} origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#compactGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={stylesCompact.centerContent}>
        <Text style={[stylesCompact.scoreText, { color: levelColor }]}>{score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  // Stack Container for DailyLoop effect
  stackContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stackedCard: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    backgroundColor: primitives.white,
    borderRadius: 28,
  },
  stackedCard2: {
    top: 8,
    opacity: 0.3,
    transform: [{ scale: 0.92 }],
  },
  stackedCard1: {
    top: 4,
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },

  // Main Circle Card
  circleCard: {
    backgroundColor: primitives.white,
    borderRadius: 28,
    padding: 20,
    ...SHADOWS.card,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: '800',
    color: primitives.stone[900],
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: primitives.stone[400],
    marginTop: -2,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: primitives.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 85,
    ...SHADOWS.subtle,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: primitives.stone[900],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: primitives.stone[400],
  },

  // Additional Stats
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  additionalStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: primitives.stone[500],
  },
  additionalStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: primitives.stone[700],
  },
});

const stylesCompact = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '800',
  },
});

export default TrustScoreCircle;
