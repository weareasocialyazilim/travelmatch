/**
 * Badge Component
 *
 * Small status indicator for counts, labels, or status
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/colors';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
type BadgeSize = 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';

interface BadgeProps {
  /** Content to display in badge */
  children?: React.ReactNode;
  /** Label text (alias for children) */
  label?: string;
  /** Numeric count to display */
  count?: number;
  /** Maximum count before showing + */
  maxCount?: number;
  /** Badge style variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Icon name (MaterialCommunityIcons) */
  icon?: string;
  /** Show as dot without content */
  dot?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: COLORS.background.tertiary, text: COLORS.text.secondary },
  primary: { bg: COLORS.accent.primary, text: '#FFFFFF' },
  success: { bg: COLORS.success, text: '#FFFFFF' },
  warning: { bg: COLORS.warning, text: '#000000' },
  error: { bg: COLORS.error, text: '#FFFFFF' },
  info: { bg: '#2196F3', text: '#FFFFFF' },
};

// Size map to normalize short and long size names
const normalizeSize = (size: BadgeSize): 'small' | 'medium' | 'large' => {
  switch (size) {
    case 'sm':
      return 'small';
    case 'md':
      return 'medium';
    case 'lg':
      return 'large';
    default:
      return size as 'small' | 'medium' | 'large';
  }
};

const sizeStyles: Record<
  'small' | 'medium' | 'large',
  { paddingH: number; paddingV: number; fontSize: number; minWidth: number }
> = {
  small: { paddingH: 6, paddingV: 2, fontSize: 10, minWidth: 16 },
  medium: { paddingH: 8, paddingV: 4, fontSize: 12, minWidth: 20 },
  large: { paddingH: 10, paddingV: 6, fontSize: 14, minWidth: 24 },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  label,
  count,
  maxCount = 99,
  variant = 'default',
  size = 'medium',
  icon: _icon,
  dot = false,
  style,
  textStyle,
}) => {
  const colors = variantColors[variant];
  const normalizedSize = normalizeSize(size);
  const sizing = sizeStyles[normalizedSize];

  // Determine display content (label takes precedence over children)
  let displayContent: React.ReactNode;
  if (dot) {
    displayContent = null;
  } else if (count !== undefined) {
    displayContent = count > maxCount ? `${maxCount}+` : count.toString();
  } else {
    displayContent = label || children;
  }

  // Dot style
  if (dot) {
    return <View style={[styles.dot, { backgroundColor: colors.bg }, style]} />;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizing.paddingH,
          paddingVertical: sizing.paddingV,
          minWidth: sizing.minWidth,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizing.fontSize,
          },
          textStyle,
        ]}
      >
        {displayContent}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

/**
 * NotificationBadge - Convenience wrapper for notification count badges
 * Shows count with optional max limit (defaults to 99+)
 */
interface NotificationBadgeProps {
  count: number;
  max?: number;
  style?: ViewStyle;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  style,
}) => {
  // Don't render for 0 or negative counts
  if (count <= 0) {
    return null;
  }

  return (
    <Badge
      count={count}
      maxCount={max}
      variant="error"
      size="small"
      style={style}
    />
  );
};

export default Badge;
