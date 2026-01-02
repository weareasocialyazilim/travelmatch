/**
 * TrustConstellation - Awwwards Edition
 *
 * Premium visual representation of user trust metrics.
 * Features:
 * - Animated star nodes with pulsing glow
 * - Connecting lines between trust factors
 * - Gradient fills with neon accents
 * - Interactive touch feedback
 */
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Svg, {
  Circle,
  Line,
  Defs,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { PROFILE_COLORS, getTrustLevel, getTrustColors } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TrustFactor {
  id: string;
  label: string;
  value: number; // 0-100
  icon: string;
}

interface TrustConstellationProps {
  /** Overall trust score 0-100 */
  trustScore?: number;
  /** Size of the constellation canvas */
  size?: number;
  /** Individual trust factors */
  factors?: TrustFactor[];
}

// Default trust factors if not provided
const DEFAULT_FACTORS: TrustFactor[] = [
  { id: 'identity', label: 'Kimlik', value: 85, icon: '🪪' },
  { id: 'social', label: 'Sosyal', value: 72, icon: '👥' },
  { id: 'reviews', label: 'Değerlendirmeler', value: 90, icon: '⭐' },
  { id: 'payments', label: 'Ödemeler', value: 95, icon: '💳' },
  { id: 'activity', label: 'Aktivite', value: 68, icon: '📍' },
];

// Calculate node positions in a circular pattern
const calculateNodePositions = (
  count: number,
  size: number,
  centerOffset: number = 0
) => {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    positions.push({
      x: center + radius * Math.cos(angle) + centerOffset,
      y: center + radius * Math.sin(angle) + centerOffset,
    });
  }

  return positions;
};

// Individual star node component
interface StarNodeProps {
  x: number;
  y: number;
  value: number;
  delay: number;
  color: string;
}

const StarNode: React.FC<StarNodeProps> = ({ x, y, value, delay, color }) => {
  const pulse = useSharedValue(0);
  const nodeSize = interpolate(value, [0, 100], [6, 14]);
  const glowSize = nodeSize * 2.5;

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [delay, pulse]);

  const animatedGlowProps = useAnimatedProps(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.2, 0.5]),
    r: interpolate(pulse.value, [0, 1], [glowSize, glowSize * 1.3]),
  }));

  return (
    <G>
      {/* Glow effect */}
      <AnimatedCircle
        cx={x}
        cy={y}
        fill={color}
        animatedProps={animatedGlowProps}
      />
      {/* Core node */}
      <Circle
        cx={x}
        cy={y}
        r={nodeSize}
        fill={color}
      />
      {/* Inner bright spot */}
      <Circle
        cx={x - nodeSize * 0.2}
        cy={y - nodeSize * 0.2}
        r={nodeSize * 0.3}
        fill="rgba(255, 255, 255, 0.6)"
      />
    </G>
  );
};

export const TrustConstellation: React.FC<TrustConstellationProps> = ({
  trustScore = 80,
  size = 280,
  factors = DEFAULT_FACTORS,
}) => {
  const fadeIn = useSharedValue(0);
  const centerPulse = useSharedValue(0);

  const [primaryColor, secondaryColor] = getTrustColors(trustScore);
  const trustLevel = getTrustLevel(trustScore);

  const positions = useMemo(
    () => calculateNodePositions(factors.length, size),
    [factors.length, size]
  );

  const center = size / 2;

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    centerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [fadeIn, centerPulse]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: interpolate(fadeIn.value, [0, 1], [0.9, 1]) }],
  }));

  const centerGlowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(centerPulse.value, [0, 1], [0.3, 0.6]),
    transform: [
      { scale: interpolate(centerPulse.value, [0, 1], [1, 1.2]) },
    ],
  }));

  // Get color based on factor value
  const getNodeColor = (value: number): string => {
    if (value >= 80) return PROFILE_COLORS.neon.lime;
    if (value >= 60) return PROFILE_COLORS.neon.cyan;
    if (value >= 40) return PROFILE_COLORS.neon.amber;
    return PROFILE_COLORS.neon.rose;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.svgContainer, containerAnimatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Background glow */}
          <Circle
            cx={center}
            cy={center}
            r={size * 0.35}
            fill="url(#centerGlow)"
          />

          {/* Connection lines */}
          {positions.map((pos, index) => (
            <G key={`line-${index}`}>
              {/* Line to center */}
              <Line
                x1={center}
                y1={center}
                x2={pos.x}
                y2={pos.y}
                stroke={PROFILE_COLORS.glass.border}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              {/* Line to next node */}
              <Line
                x1={pos.x}
                y1={pos.y}
                x2={positions[(index + 1) % positions.length].x}
                y2={positions[(index + 1) % positions.length].y}
                stroke={PROFILE_COLORS.glass.borderActive}
                strokeWidth={1.5}
              />
            </G>
          ))}

          {/* Star nodes */}
          {positions.map((pos, index) => (
            <StarNode
              key={`node-${index}`}
              x={pos.x}
              y={pos.y}
              value={factors[index]?.value ?? 50}
              delay={index * 200}
              color={getNodeColor(factors[index]?.value ?? 50)}
            />
          ))}

          {/* Center node - Trust Score */}
          <Circle
            cx={center}
            cy={center}
            r={28}
            fill={PROFILE_COLORS.background.secondary}
            stroke={primaryColor}
            strokeWidth={3}
          />
          <Circle
            cx={center}
            cy={center}
            r={20}
            fill={`${primaryColor}30`}
          />
        </Svg>

        {/* Center glow animation */}
        <Animated.View
          style={[
            styles.centerGlow,
            { width: size * 0.25, height: size * 0.25 },
            centerGlowAnimatedStyle,
          ]}
        />

        {/* Center trust score text */}
        <View style={[styles.centerText, { top: center - 16, left: center - 20 }]}>
          <Text style={[styles.trustScoreValue, { color: primaryColor }]}>
            {trustScore}
          </Text>
        </View>

        {/* Factor labels */}
        {positions.map((pos, index) => {
          const factor = factors[index];
          if (!factor) return null;

          const labelX = pos.x > center ? pos.x + 16 : pos.x - 50;
          const labelY = pos.y - 8;

          return (
            <View
              key={`label-${index}`}
              style={[
                styles.factorLabel,
                {
                  left: labelX,
                  top: labelY,
                  alignItems: pos.x > center ? 'flex-start' : 'flex-end',
                },
              ]}
            >
              <Text style={styles.factorIcon}>{factor.icon}</Text>
              <Text style={styles.factorText}>{factor.label}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Trust Level Badge */}
      <View style={[styles.levelBadge, { borderColor: primaryColor }]}>
        <Text style={[styles.levelText, { color: primaryColor }]}>
          {trustLevel.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PROFILE_COLORS.neon.lime,
    ...Platform.select({
      ios: {
        shadowColor: PROFILE_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {},
    }),
  },
  centerText: {
    position: 'absolute',
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustScoreValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  factorLabel: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 4,
  },
  factorIcon: {
    fontSize: 12,
  },
  factorText: {
    fontSize: 10,
    fontWeight: '600',
    color: PROFILE_COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: PROFILE_COLORS.background.secondary,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default TrustConstellation;
