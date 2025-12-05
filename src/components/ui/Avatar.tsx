/**
 * Avatar Component
 * Displays user profile images with fallback to initials,
 * optional status badge, and verification indicator.
 */

import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Image, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/** Avatar size options - maps to pixel values */
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  /** Image URL for the avatar */
  source?: string;
  /** User's name - used for generating initials fallback */
  name?: string;
  /** Avatar size - xs(24), sm(32), md(48), lg(64), xl(96) */
  size?: AvatarSize;
  /** Show online/status badge indicator */
  showBadge?: boolean;
  /** Badge indicator color */
  badgeColor?: string;
  /** Show verified checkmark overlay */
  showVerified?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

/**
 * Avatar - User profile image component
 *
 * Features:
 * - Image with URL or initials fallback
 * - Online status badge
 * - Verification indicator
 * - Multiple size options
 *
 * @example
 * ```tsx
 * // With image
 * <Avatar source="https://example.com/photo.jpg" size="lg" />
 *
 * // With initials fallback
 * <Avatar name="John Doe" size="md" />
 *
 * // With badge and verified
 * <Avatar
 *   source="https://example.com/photo.jpg"
 *   showBadge
 *   showVerified
 * />
 * ```
 */
export const Avatar = memo<AvatarProps>(function Avatar({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = COLORS.success,
  showVerified = false,
  style,
}) {
  const sizeValue = SIZE_MAP[size];
  const badgeSize = Math.max(sizeValue * 0.3, 8);
  const verifiedSize = Math.max(sizeValue * 0.4, 16);

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      style={[{ width: sizeValue, height: sizeValue }, style]}
      accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: COLORS.primaryMuted,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: sizeValue * 0.4, color: COLORS.primary },
            ]}
          >
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            styles.badgeBorder,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}

      {showVerified && (
        <View
          style={[
            styles.verified,
            {
              width: verifiedSize,
              height: verifiedSize,
              borderRadius: verifiedSize / 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={verifiedSize}
            color={COLORS.primary}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  badgeBorder: {
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  verified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 999,
  },
});

export default Avatar;
