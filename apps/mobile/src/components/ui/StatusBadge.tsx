// components/ui/StatusBadge.tsx
// TravelMatch Ultimate Design System 2026
// Premium status badge with neon glow effects

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../theme/typography';

type BadgeType = 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'premium';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  /** Badge label text */
  label: string;
  /** Badge type/variant */
  type?: BadgeType;
  /** Badge size */
  size?: BadgeSize;
  /** Optional icon */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Show pulsing animation for active states */
  pulse?: boolean;
  /** Show dot indicator */
  showDot?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// Type configurations
const typeConfig: Record<
  BadgeType,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: primitives.blue[400],
    border: 'rgba(59, 130, 246, 0.3)',
    dot: primitives.blue[500],
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: primitives.emerald[400],
    border: 'rgba(16, 185, 129, 0.3)',
    dot: primitives.emerald[500],
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: primitives.amber[400],
    border: 'rgba(245, 158, 11, 0.3)',
    dot: primitives.amber[500],
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: primitives.red[400],
    border: 'rgba(239, 68, 68, 0.3)',
    dot: primitives.red[500],
  },
  neutral: {
    bg: 'rgba(168, 162, 158, 0.15)',
    text: primitives.stone[400],
    border: 'rgba(168, 162, 158, 0.3)',
    dot: primitives.stone[500],
  },
  premium: {
    bg: 'rgba(245, 158, 11, 0.2)',
    text: primitives.amber[300],
    border: 'rgba(245, 158, 11, 0.4)',
    dot: COLORS.primary,
  },
};

// Size configurations
const sizeConfig: Record<
  BadgeSize,
  {
    height: number;
    paddingH: number;
    fontSize: number;
    iconSize: number;
    dotSize: number;
  }
> = {
  sm: {
    height: 22,
    paddingH: 8,
    fontSize: 10,
    iconSize: 12,
    dotSize: 6,
  },
  md: {
    height: 28,
    paddingH: 10,
    fontSize: 11,
    iconSize: 14,
    dotSize: 7,
  },
  lg: {
    height: 34,
    paddingH: 14,
    fontSize: 12,
    iconSize: 16,
    dotSize: 8,
  },
};

/**
 * StatusBadge Component
 * Premium status indicator with optional pulse animation and neon styling
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  type = 'neutral',
  size = 'md',
  icon,
  pulse = false,
  showDot = false,
  style,
}) => {
  const config = typeConfig[type];
  const sizeConf = sizeConfig[size];

  // Pulse animation
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (pulse) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [pulse, pulseOpacity]);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          height: sizeConf.height,
          paddingHorizontal: sizeConf.paddingH,
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      {/* Status Dot */}
      {showDot && (
        <Animated.View
          style={[
            styles.dot,
            {
              width: sizeConf.dotSize,
              height: sizeConf.dotSize,
              borderRadius: sizeConf.dotSize / 2,
              backgroundColor: config.dot,
              shadowColor: config.dot,
            },
            pulse && dotAnimatedStyle,
          ]}
        />
      )}

      {/* Icon */}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sizeConf.iconSize}
          color={config.text}
          style={styles.icon}
        />
      )}

      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            fontSize: sizeConf.fontSize,
            color: config.text,
          },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Live Status Badge (with animated dot)
// ═══════════════════════════════════════════════════════════════════
interface LiveStatusBadgeProps {
  label?: string;
  style?: ViewStyle;
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({
  label = 'CANLI',
  style,
}) => {
  return (
    <StatusBadge
      label={label}
      type="error"
      size="sm"
      showDot
      pulse
      style={style}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Verified Badge
// ═══════════════════════════════════════════════════════════════════
interface VerifiedBadgeProps {
  size?: BadgeSize;
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'sm',
  style,
}) => {
  return (
    <StatusBadge
      label="Onaylı"
      type="success"
      size={size}
      icon="check-decagram"
      style={style}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Premium Badge
// ═══════════════════════════════════════════════════════════════════
interface PremiumBadgeProps {
  size?: BadgeSize;
  style?: ViewStyle;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'sm',
  style,
}) => {
  return (
    <StatusBadge
      label="Premium"
      type="premium"
      size={size}
      icon="crown"
      style={style}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: -2,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default StatusBadge;
