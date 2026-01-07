/**
 * TMBadge - TravelMatch Ultimate Design System 2026
 * Consolidated badge component for all badge types
 *
 * Replaces:
 * - Badge.tsx (general labels)
 * - StatusBadge.tsx (animated status indicators)
 * - TrustBadge.tsx (trust score gamification)
 *
 * @example
 * ```tsx
 * // Label badge
 * <TMBadge type="label" variant="success" label="Active" />
 *
 * // Status badge with pulse
 * <TMBadge type="status" variant="error" label="LIVE" pulse showDot />
 *
 * // Trust badge
 * <TMBadge type="trust" trustScore={85} />
 *
 * // Notification count
 * <TMBadge type="notification" count={5} />
 * ```
 */

import React, { useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, primitives } from '@/constants/colors';
import { RADII } from '@/constants/radii';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type TMBadgeType = 'label' | 'status' | 'trust' | 'notification';

export type LabelVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'primary'
  | 'featured'
  | 'popular'
  | 'new'
  | 'premium'
  | 'interview'
  | 'approved'
  | 'rejected'
  | 'pending';

export type StatusVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'premium';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface TMBadgeProps {
  /** Badge type determines rendering style */
  type?: TMBadgeType;

  // Label/Status props
  /** Badge label text */
  label?: string;
  /** Visual variant for label/status types */
  variant?: LabelVariant | StatusVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Optional icon */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Show dot indicator */
  showDot?: boolean;
  /** Show pulsing animation (status type only) */
  pulse?: boolean;

  // Trust badge props
  /** Trust score (0-100) for trust type */
  trustScore?: number;

  // Notification badge props
  /** Notification count for notification type */
  count?: number;
  /** Maximum count to display */
  maxCount?: number;

  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════════

const LABEL_VARIANT_CONFIG: Record<LabelVariant, { bg: string; text: string }> =
  {
    default: { bg: primitives.stone[100], text: primitives.stone[600] },
    success: { bg: primitives.emerald[50], text: primitives.emerald[600] },
    warning: { bg: primitives.amber[50], text: primitives.amber[600] },
    error: { bg: primitives.red[50], text: primitives.red[600] },
    info: { bg: primitives.blue[50], text: primitives.blue[600] },
    primary: { bg: primitives.amber[50], text: primitives.amber[600] },
    featured: { bg: '#3D4A3A', text: COLORS.white },
    popular: { bg: primitives.seafoam[500], text: COLORS.white },
    new: { bg: primitives.stone[800], text: COLORS.white },
    premium: { bg: primitives.amber[500], text: COLORS.white },
    interview: { bg: primitives.blue[500], text: COLORS.white },
    approved: { bg: primitives.emerald[500], text: COLORS.white },
    rejected: { bg: primitives.red[500], text: COLORS.white },
    pending: { bg: primitives.amber[500], text: COLORS.white },
  };

const STATUS_VARIANT_CONFIG: Record<
  StatusVariant,
  { bg: string; text: string; border: string; dot: string }
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

const SIZE_CONFIG: Record<
  BadgeSize,
  {
    height: number;
    paddingH: number;
    fontSize: number;
    iconSize: number;
    dotSize: number;
  }
> = {
  sm: { height: 22, paddingH: 8, fontSize: 10, iconSize: 12, dotSize: 6 },
  md: { height: 28, paddingH: 10, fontSize: 12, iconSize: 14, dotSize: 7 },
  lg: { height: 34, paddingH: 14, fontSize: 14, iconSize: 16, dotSize: 8 },
};

const TRUST_LEVELS = [
  {
    min: 90,
    label: 'PLATINUM',
    colors: ['#E5E4E2', '#B0B0B0'],
    icon: 'shield-crown',
  },
  {
    min: 70,
    label: 'GOLD',
    colors: ['#FFD700', '#FDB931'],
    icon: 'shield-star',
  },
  {
    min: 50,
    label: 'SILVER',
    colors: ['#C0C0C0', '#E0E0E0'],
    icon: 'shield-check',
  },
  {
    min: 0,
    label: 'MEMBER',
    colors: ['#CD7F32', '#A0522D'],
    icon: 'shield-outline',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

export const TMBadge: React.FC<TMBadgeProps> = ({
  type = 'label',
  label,
  variant = 'default',
  size = 'md',
  icon,
  showDot = false,
  pulse = false,
  trustScore,
  count,
  maxCount = 99,
  style,
  testID,
}) => {
  // Pulse animation for status type
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (type === 'status' && pulse) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [pulse, type, pulseOpacity]);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Render based on type
  switch (type) {
    case 'notification':
      return (
        <NotificationBadgeInternal
          count={count || 0}
          max={maxCount}
          style={style}
          testID={testID}
        />
      );

    case 'trust':
      return (
        <TrustBadgeInternal
          score={trustScore || 0}
          size={size}
          style={style}
          testID={testID}
        />
      );

    case 'status':
      return (
        <StatusBadgeInternal
          label={label || ''}
          variant={variant as StatusVariant}
          size={size}
          icon={icon}
          showDot={showDot}
          pulse={pulse}
          dotAnimatedStyle={dotAnimatedStyle}
          style={style}
          testID={testID}
        />
      );

    case 'label':
    default:
      return (
        <LabelBadgeInternal
          label={label || ''}
          variant={variant as LabelVariant}
          size={size}
          icon={icon}
          showDot={showDot}
          style={style}
          testID={testID}
        />
      );
  }
};

// ═══════════════════════════════════════════════════════════════════
// Internal Components
// ═══════════════════════════════════════════════════════════════════

interface LabelBadgeInternalProps {
  label: string;
  variant: LabelVariant;
  size: BadgeSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  showDot: boolean;
  style?: ViewStyle;
  testID?: string;
}

const LabelBadgeInternal: React.FC<LabelBadgeInternalProps> = ({
  label,
  variant,
  size,
  icon,
  showDot,
  style,
  testID,
}) => {
  const config = LABEL_VARIANT_CONFIG[variant] || LABEL_VARIANT_CONFIG.default;
  const sizeConf = SIZE_CONFIG[size];

  return (
    <View
      style={[
        styles.labelContainer,
        {
          backgroundColor: config.bg,
          paddingHorizontal: sizeConf.paddingH,
          paddingVertical: sizeConf.height / 4,
        },
        style,
      ]}
      testID={testID}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeConf.dotSize,
              height: sizeConf.dotSize,
              backgroundColor: config.text,
            },
          ]}
        />
      )}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sizeConf.iconSize}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.labelText,
          { color: config.text, fontSize: sizeConf.fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

interface StatusBadgeInternalProps {
  label: string;
  variant: StatusVariant;
  size: BadgeSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  showDot: boolean;
  pulse: boolean;
  dotAnimatedStyle: { opacity: number };
  style?: ViewStyle;
  testID?: string;
}

const StatusBadgeInternal: React.FC<StatusBadgeInternalProps> = ({
  label,
  variant,
  size,
  icon,
  showDot,
  pulse,
  dotAnimatedStyle,
  style,
  testID,
}) => {
  const config =
    STATUS_VARIANT_CONFIG[variant] || STATUS_VARIANT_CONFIG.neutral;
  const sizeConf = SIZE_CONFIG[size];

  return (
    <View
      style={[
        styles.statusContainer,
        {
          height: sizeConf.height,
          paddingHorizontal: sizeConf.paddingH,
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
      testID={testID}
    >
      {showDot && (
        <Animated.View
          style={[
            styles.statusDot,
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
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sizeConf.iconSize}
          color={config.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.statusText,
          { fontSize: sizeConf.fontSize, color: config.text },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

interface TrustBadgeInternalProps {
  score: number;
  size: BadgeSize;
  style?: ViewStyle;
  testID?: string;
}

const TrustBadgeInternal: React.FC<TrustBadgeInternalProps> = ({
  score,
  size,
  style,
  testID,
}) => {
  const level = useMemo(() => {
    for (const l of TRUST_LEVELS) {
      if (score >= l.min) return l;
    }
    return TRUST_LEVELS[TRUST_LEVELS.length - 1];
  }, [score]);

  const sizeConf = SIZE_CONFIG[size];

  return (
    <LinearGradient
      colors={level.colors as unknown as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.trustContainer,
        {
          paddingHorizontal: sizeConf.paddingH,
          paddingVertical: sizeConf.height / 6,
        },
        style,
      ]}
      testID={testID}
    >
      <MaterialCommunityIcons
        name={level.icon as any}
        size={sizeConf.iconSize}
        color="#333"
      />
      <Text style={[styles.trustText, { fontSize: sizeConf.fontSize }]}>
        {level.label} • {score}
      </Text>
    </LinearGradient>
  );
};

interface NotificationBadgeInternalProps {
  count: number;
  max: number;
  style?: ViewStyle;
  testID?: string;
}

const NotificationBadgeInternal: React.FC<NotificationBadgeInternalProps> = ({
  count,
  max,
  style,
  testID,
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <View style={[styles.notificationBadge, style]} testID={testID}>
      <Text style={styles.notificationText}>{displayCount}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Label badge
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
  },
  labelText: {
    fontWeight: '600',
  },
  dot: {
    borderRadius: 3,
    marginRight: 6,
  },
  icon: {
    marginRight: 4,
  },

  // Status badge
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.full,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Trust badge
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  trustText: {
    color: '#333',
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Notification badge
  notificationBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
});

// ═══════════════════════════════════════════════════════════════════
// Convenience Exports (backward compatible)
// ═══════════════════════════════════════════════════════════════════

/** @deprecated Use TMBadge with type="status" variant="error" pulse showDot */
export const LiveStatusBadge: React.FC<{
  label?: string;
  style?: ViewStyle;
}> = ({ label = 'CANLI', style }) => (
  <TMBadge
    type="status"
    variant="error"
    label={label}
    size="sm"
    showDot
    pulse
    style={style}
  />
);

/** @deprecated Use TMBadge with type="status" variant="success" icon="check-decagram" */
export const VerifiedBadge: React.FC<{
  size?: BadgeSize;
  style?: ViewStyle;
}> = ({ size = 'sm', style }) => (
  <TMBadge
    type="status"
    variant="success"
    label="Onaylı"
    size={size}
    icon="check-decagram"
    style={style}
  />
);

/** @deprecated Use TMBadge with type="status" variant="premium" icon="crown" */
export const PremiumBadge: React.FC<{
  size?: BadgeSize;
  style?: ViewStyle;
}> = ({ size = 'sm', style }) => (
  <TMBadge
    type="status"
    variant="premium"
    label="Premium"
    size={size}
    icon="crown"
    style={style}
  />
);

export default TMBadge;
