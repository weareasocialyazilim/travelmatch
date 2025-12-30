/**
 * Badge Component - Status and Feature Badges
 *
 * Implements UX best practices:
 * - Clear visual hierarchy with consistent sizing
 * - Color-coded variants for different statuses
 * - Support for moment card badges (Featured, Popular, New)
 * - Kanban-style status badges (Interview, Approved, Rejected)
 */

import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../../constants/colors';

// Standard variants + Moment card variants + Kanban status variants
type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'primary'
  // Moment card badges
  | 'featured'      // "Öne Çıkan" - Hot choice
  | 'popular'       // "Popüler" - Guests Favorite
  | 'new'           // "Yeni" - Newly listed
  | 'premium'       // "Premium" - Prime Pick
  // Kanban status badges
  | 'interview'     // Mülakat
  | 'approved'      // Onaylandı
  | 'rejected'      // Reddedildi
  | 'pending';      // Beklemede

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
      // Standard variants
      case 'success':
        return { bg: primitives.emerald[50], text: primitives.emerald[600] };
      case 'warning':
        return { bg: primitives.amber[50], text: primitives.amber[600] };
      case 'error':
        return { bg: primitives.red[50], text: primitives.red[600] };
      case 'info':
        return { bg: primitives.blue[50], text: primitives.blue[600] };
      case 'primary':
        return { bg: primitives.amber[50], text: primitives.amber[600] };

      // Moment card badges (from design images)
      case 'featured':
        // "Öne Çıkan" - olive/dark green like "Hot choice"
        return { bg: '#3D4A3A', text: COLORS.white };
      case 'popular':
        // "Popüler" - teal/seafoam like "Guests Favorite"
        return { bg: primitives.seafoam[500], text: COLORS.white };
      case 'new':
        // "Yeni" - dark/charcoal like "Newly listed"
        return { bg: primitives.stone[800], text: COLORS.white };
      case 'premium':
        // "Premium" - amber/gold like "Prime Pick"
        return { bg: primitives.amber[500], text: COLORS.white };

      // Kanban status badges (from Workhub design)
      case 'interview':
        // Blue for interview status
        return { bg: primitives.blue[500], text: COLORS.white };
      case 'approved':
        // Green for approved
        return { bg: primitives.emerald[500], text: COLORS.white };
      case 'rejected':
        // Red for rejected
        return { bg: primitives.red[500], text: COLORS.white };
      case 'pending':
        // Amber for pending
        return { bg: primitives.amber[500], text: COLORS.white };

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
