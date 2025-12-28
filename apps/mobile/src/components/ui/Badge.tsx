import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge = memo<BadgeProps>(function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  style,
}) {
  // Memoize variant styles
  const variantStyles = useMemo((): { bg: string; text: string } => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.mintTransparent, text: COLORS.feedback.success };
      case 'warning':
        return { bg: COLORS.softOrangeTransparent, text: COLORS.orange };
      case 'error':
        return {
          bg: COLORS.brand.secondaryTransparent,
          text: COLORS.feedback.error,
        };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: COLORS.feedback.info };
      case 'primary':
        return { bg: COLORS.primaryMuted, text: COLORS.brand.primary };
      default:
        return { bg: primitives.stone[100], text: primitives.stone[600] };
    }
  }, [variant]);

  // Memoize size styles
  const sizeStyles = useMemo((): {
    paddingH: number;
    paddingV: number;
    fontSize: number;
    iconSize: number;
  } => {
    switch (size) {
      case 'sm':
        return { paddingH: 8, paddingV: 2, fontSize: 10, iconSize: 12 };
      case 'md':
        return { paddingH: 10, paddingV: 4, fontSize: 12, iconSize: 14 };
      case 'lg':
        return { paddingH: 12, paddingV: 6, fontSize: 14, iconSize: 16 };
      default:
        return { paddingH: 10, paddingV: 4, fontSize: 12, iconSize: 14 };
    }
  }, [size]);

  // Memoize dot style
  const dotStyle = useMemo(
    () => [styles.dot, { backgroundColor: variantStyles.text }],
    [variantStyles.text],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.bg,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
        style,
      ]}
    >
      {dot && <View style={dotStyle} />}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: variantStyles.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

// Notification Badge (for tab bar, etc.)
interface NotificationBadgeProps {
  count: number;
  max?: number;
  style?: ViewStyle;
}

export const NotificationBadge = memo<NotificationBadgeProps>(
  function NotificationBadge({ count, max = 99, style }) {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
      <View style={[styles.notificationBadge, style]}>
        <Text style={styles.notificationText}>{displayCount}</Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '600',
  },
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

export default Badge;
