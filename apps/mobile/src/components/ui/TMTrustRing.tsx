// components/ui/TMTrustRing.tsx
// TravelMatch Ultimate Design System 2026
// Trust ring component with "Jewelry" aesthetic - animated progress ring with avatar

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '@/constants/colors';
import { SIZES, SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/theme/typography';

// Lazy load SVG to handle potential native module issues

let Svg: any = null;

let Circle: any = null;

let Defs: any = null;

let SvgGradient: any = null;

let Stop: any = null;

let AnimatedCircle: any = null;

try {
  const svg = require('react-native-svg');
  Svg = svg.default || svg.Svg;
  Circle = svg.Circle;
  Defs = svg.Defs;
  SvgGradient = svg.LinearGradient;
  Stop = svg.Stop;
  if (Circle) {
    AnimatedCircle = Animated.createAnimatedComponent(Circle);
  }
} catch {
  // SVG not available, will use fallback
}

type TrustLevel = 'platinum' | 'gold' | 'silver' | 'bronze';
type RingSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

interface TMTrustRingProps {
  score: number;
  avatarUrl: string;
  size?: RingSize;
  showScore?: boolean;
  showShimmer?: boolean;
  showLabel?: boolean;
  testID?: string;
}

const getTrustLevel = (score: number): TrustLevel => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
};

const getTrustColors = (level: TrustLevel): [string, string] => {
  switch (level) {
    case 'platinum':
      return ['#E5E4E2', '#C0C0C0'];
    case 'gold':
      return ['#FFD700', '#FFA500'];
    case 'silver':
      return ['#C0C0C0', '#A8A8A8'];
    case 'bronze':
      return ['#CD7F32', '#8B4513'];
  }
};

const getTrustLabel = (level: TrustLevel): string => {
  switch (level) {
    case 'platinum':
      return 'Trusted Traveler';
    case 'gold':
      return 'Reliable';
    case 'silver':
      return 'Building Trust';
    case 'bronze':
      return 'New Member';
  }
};

const sizeConfig = {
  xs: { container: SIZES.trustRingXS, stroke: 2.5, avatar: 24 },
  sm: { container: SIZES.trustRingSM, stroke: 3, avatar: 36 },
  md: { container: SIZES.trustRingMD, stroke: 4, avatar: 52 },
  lg: { container: SIZES.trustRingLG, stroke: 5, avatar: 72 },
  hero: { container: SIZES.trustRingHero, stroke: 6, avatar: 100 },
};

// Fallback component when SVG is not available
const FallbackTMTrustRing: React.FC<TMTrustRingProps> = ({
  score,
  avatarUrl,
  size = 'md',
  showScore = false,
  showLabel = false,
  testID,
}) => {
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, score))
    : 0;
  const level = getTrustLevel(safeScore);
  const colors = getTrustColors(level);
  const label = getTrustLabel(level);
  const config = sizeConfig[size];

  return (
    <View style={styles.wrapper} testID={testID}>
      <View
        style={[
          styles.container,
          { width: config.container, height: config.container },
        ]}
      >
        {/* Fallback border ring */}
        <View
          style={[
            styles.fallbackRing,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
              borderWidth: config.stroke,
              borderColor: colors[0],
            },
          ]}
        />

        {/* Avatar */}
        <View
          style={[
            styles.avatarContainer,
            {
              width: config.avatar,
              height: config.avatar,
              borderRadius: config.avatar / 2,
            },
          ]}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.avatar, { borderRadius: config.avatar / 2 }]}
          />
        </View>

        {/* Score badge */}
        {showScore && (
          <View
            style={[
              styles.scoreBadge,
              size === 'xs' && styles.scoreBadgeXS,
              size === 'sm' && styles.scoreBadgeSM,
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                (size === 'xs' || size === 'sm') && styles.scoreTextSmall,
              ]}
            >
              {safeScore}
            </Text>
          </View>
        )}
      </View>

      {/* Trust label */}
      {showLabel && (
        <Text
          style={[
            styles.label,
            size === 'xs' && styles.labelSmall,
            size === 'sm' && styles.labelSmall,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

export const TMTrustRing: React.FC<TMTrustRingProps> = ({
  score,
  avatarUrl,
  size = 'md',
  showScore = false,
  showShimmer = true,
  showLabel = false,
  testID,
}) => {
  const [svgError, setSvgError] = useState(false);

  // Ensure score is valid
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, score))
    : 0;

  const level = getTrustLevel(safeScore);
  const colors = getTrustColors(level);
  const label = getTrustLabel(level);

  const shimmerOpacity = useSharedValue(0.7);
  const ringProgress = useSharedValue(0);

  const config = sizeConfig[size];
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate ring progress
    ringProgress.value = withTiming(safeScore / 100, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });

    // Shimmer animation for high trust scores
    if (showShimmer && safeScore >= 70) {
      shimmerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.5, { duration: 800 }),
        ),
        -1,
        true,
      );
    }
  }, [safeScore, showShimmer, ringProgress, shimmerOpacity]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - ringProgress.value),
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  // Check if SVG components are available
  const svgAvailable =
    Svg && Circle && Defs && SvgGradient && Stop && AnimatedCircle && !svgError;

  // Use fallback if SVG is not available
  if (!svgAvailable) {
    return (
      <FallbackTMTrustRing
        score={safeScore}
        avatarUrl={avatarUrl}
        size={size}
        showScore={showScore}
        showLabel={showLabel}
        testID={testID}
      />
    );
  }

  try {
    return (
      <View style={styles.wrapper} testID={testID}>
        <View
          style={[
            styles.container,
            { width: config.container, height: config.container },
          ]}
        >
          {/* Trust Ring SVG */}
          <Svg
            width={config.container}
            height={config.container}
            style={styles.svg}
          >
            <Defs>
              <SvgGradient
                id="trustGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="100%" stopColor={colors[1]} />
              </SvgGradient>
            </Defs>

            {/* Background circle */}
            <Circle
              cx={config.container / 2}
              cy={config.container / 2}
              r={radius}
              stroke={COLORS.border.default}
              strokeWidth={config.stroke}
              fill="transparent"
            />

            {/* Progress circle */}
            <AnimatedCircle
              cx={config.container / 2}
              cy={config.container / 2}
              r={radius}
              stroke="url(#trustGradient)"
              strokeWidth={config.stroke}
              fill="transparent"
              strokeDasharray={`${circumference}`}
              strokeLinecap="round"
              rotation={-90}
              origin={`${config.container / 2}, ${config.container / 2}`}
              animatedProps={animatedProps}
            />
          </Svg>

          {/* Avatar */}
          <View
            style={[
              styles.avatarContainer,
              {
                width: config.avatar,
                height: config.avatar,
                borderRadius: config.avatar / 2,
              },
            ]}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, { borderRadius: config.avatar / 2 }]}
            />
          </View>

          {/* Shimmer overlay for high trust */}
          {showShimmer && safeScore >= 70 && (
            <Animated.View
              style={[
                styles.shimmer,
                { borderRadius: config.container / 2 },
                shimmerAnimatedStyle,
                SHADOWS.trustGlow,
              ]}
            />
          )}

          {/* Score badge */}
          {showScore && (
            <View
              style={[
                styles.scoreBadge,
                size === 'xs' && styles.scoreBadgeXS,
                size === 'sm' && styles.scoreBadgeSM,
              ]}
            >
              <Text
                style={[
                  styles.scoreText,
                  (size === 'xs' || size === 'sm') && styles.scoreTextSmall,
                ]}
              >
                {safeScore}
              </Text>
            </View>
          )}
        </View>

        {/* Trust label */}
        {showLabel && (
          <Text
            style={[
              styles.label,
              size === 'xs' && styles.labelSmall,
              size === 'sm' && styles.labelSmall,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    );
  } catch {
    setSvgError(true);
    return (
      <FallbackTMTrustRing
        score={safeScore}
        avatarUrl={avatarUrl}
        size={size}
        showScore={showScore}
        showLabel={showLabel}
        testID={testID}
      />
    );
  }
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  avatarContainer: {
    backgroundColor: COLORS.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  fallbackRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.trust.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  scoreBadgeXS: {
    bottom: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 20,
    borderRadius: 8,
  },
  scoreBadgeSM: {
    bottom: -3,
    right: -3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 24,
    borderRadius: 9,
  },
  scoreText: {
    ...TYPOGRAPHY.score,
    color: COLORS.white,
  },
  scoreTextSmall: {
    fontSize: 10,
    lineHeight: 14,
  },
  label: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  labelSmall: {
    fontSize: 11,
    marginTop: SPACING.xxs,
  },
});

export default TMTrustRing;
