/**
 * TrustScoreCircle Component
 *
 * Premium circular trust score visualization
 * Inspired by modern health/cycle tracking apps (like Image 9)
 *
 * Features:
 * - Animated circular progress ring
 * - Color-coded segments for trust factors
 * - Central score display with level icon
 * - Info cards with key metrics
 * - Premium "jewelry" aesthetic
 *
 * UX Best Practice: Dashboard visualization shows key metrics at a glance
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';

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
  /** Show dashboard info cards below */
  showDashboard?: boolean;
  /** Additional dashboard data */
  dashboardData?: {
    averageScore?: number;
    completedProofs?: number;
    regularity?: number;
    nextMilestone?: { name: string; daysLeft: number };
  };
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
  size = SCREEN_WIDTH * 0.65,
  strokeWidth = 14,
  animated = true,
  showDashboard = true,
  dashboardData,
}) => {
  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate on mount
  useEffect(() => {
    if (animated) {
      progress.value = withDelay(
        300,
        withTiming(score / 100, {
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    } else {
      progress.value = score / 100;
    }
  }, [score, animated, progress]);

  // Get level color based on score
  const levelColor = useMemo(() => {
    if (score >= 90) return primitives.purple[500];
    if (score >= 70) return primitives.emerald[500];
    if (score >= 40) return primitives.amber[500];
    return primitives.magenta[500];
  }, [score]);

  // Animated props for main progress circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
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

  // Get level icon
  const getLevelIcon = () => {
    if (score >= 90) return 'crown';
    if (score >= 70) return 'flower';
    if (score >= 40) return 'leaf';
    return 'sprout';
  };

  return (
    <View style={styles.container}>
      {/* Main Circle */}
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
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
              const segmentRadius = radius + strokeWidth / 2 + 4;
              const segmentCircumference = 2 * Math.PI * segmentRadius;
              const segmentLength = (segment.endAngle - segment.startAngle) / 360;
              const gapSize = 0.008;

              return (
                <Circle
                  key={segment.id}
                  cx={center}
                  cy={center}
                  r={segmentRadius}
                  stroke={segment.color}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={`${segmentCircumference * (segmentLength - gapSize)} ${segmentCircumference}`}
                  strokeDashoffset={-segmentCircumference * (segment.startAngle / 360)}
                  strokeLinecap="round"
                  opacity={0.3 + segment.fillPercentage * 0.7}
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
              stroke="url(#scoreGradient)"
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
          <View style={[styles.levelIconContainer, { backgroundColor: `${levelColor}15` }]}>
            <MaterialCommunityIcons
              name={getLevelIcon()}
              size={28}
              color={levelColor}
            />
          </View>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
          <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
        </View>
      </View>

      {/* Dashboard Info Cards */}
      {showDashboard && (
        <>
          {/* Quick Info Row */}
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: `${primitives.emerald[500]}15` }]}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={18}
                  color={primitives.emerald[500]}
                />
              </View>
              <View>
                <Text style={styles.quickInfoLabel}>Gelişim</Text>
                <Text style={[styles.quickInfoValue, { color: primitives.emerald[500] }]}>
                  +{dashboardData?.averageScore || 5} puan
                </Text>
              </View>
            </View>

            <View style={styles.quickInfoCard}>
              <View style={[styles.quickInfoIcon, { backgroundColor: `${primitives.magenta[500]}15` }]}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={18}
                  color={primitives.magenta[500]}
                />
              </View>
              <View>
                <Text style={styles.quickInfoLabel}>Sonraki Hedef</Text>
                <Text style={[styles.quickInfoValue, { color: primitives.magenta[500] }]}>
                  {dashboardData?.nextMilestone?.daysLeft || 7} gün
                </Text>
              </View>
            </View>
          </View>

          {/* Factor Stats Cards */}
          <View style={styles.statsContainer}>
            {factors.slice(0, 3).map((factor) => (
              <View key={factor.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${factor.color}15` }]}>
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
              </View>
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

          {/* Bottom metrics row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: primitives.blue[50] }]}>
                <MaterialCommunityIcons name="chart-line" size={16} color={primitives.blue[500]} />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.averageScore || 28}</Text>
              <Text style={styles.metricLabel}>Ort. Skor</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: primitives.magenta[50] }]}>
                <MaterialCommunityIcons name="check-decagram" size={16} color={primitives.magenta[500]} />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.completedProofs || 5}</Text>
              <Text style={styles.metricLabel}>Kanıt</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={[styles.metricIcon, { backgroundColor: primitives.amber[50] }]}>
                <MaterialCommunityIcons name="percent" size={16} color={primitives.amber[500]} />
              </View>
              <Text style={styles.metricValue}>{dashboardData?.regularity || 92}%</Text>
              <Text style={styles.metricLabel}>Düzenlilik</Text>
            </View>
          </View>
        </>
      )}

      {/* Legacy support - simple stats when dashboard is off */}
      {!showDashboard && (
        <>
          <View style={styles.statsContainer}>
            {factors.slice(0, 3).map((factor) => (
              <View key={factor.id} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${factor.color}15` }]}>
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
              </View>
            ))}
          </View>

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
        </>
      )}
    </View>
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
    paddingVertical: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: -4,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Quick Info Row - Dashboard style
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quickInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 140,
  },
  quickInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfoLabel: {
    fontSize: 11,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 90,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },

  // Additional Stats
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
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
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  additionalStatValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },

  // Metrics Row - Dashboard bottom stats
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  metricItem: {
    alignItems: 'center',
    gap: 6,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text.secondary,
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
