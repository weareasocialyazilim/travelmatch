/**
 * TMAvatar - TravelMatch Ultimate Design System 2026
 * Avatar component with fallback initials, status indicator, and verified badge
 *
 * Features:
 * - Image with fallback to initials
 * - Multiple sizes (xxs → profile)
 * - Online/offline/away status indicator
 * - Verified badge overlay
 * - Border option
 * - Accessibility support
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '@/constants/colors';
import { SIZES } from '@/constants/spacing';

export type AvatarSize =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'hero'
  | 'profile';

export type AvatarStatus = 'online' | 'offline' | 'away';

// Size configuration matching the guide
const SIZE_CONFIG: Record<AvatarSize, number> = {
  xxs: SIZES.avatarXXS, // 24
  xs: SIZES.avatarXS, // 28
  sm: SIZES.avatarSM, // 36
  md: SIZES.avatarMD, // 48
  lg: SIZES.avatarLG, // 64
  xl: SIZES.avatarXL, // 80
  hero: SIZES.avatarHero, // 100
  profile: SIZES.avatar2XL, // 120
};

// Font sizes for initials based on avatar size
const INITIAL_FONT_SIZE: Record<AvatarSize, number> = {
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 16,
  lg: 22,
  xl: 28,
  hero: 36,
  profile: 44,
};

// Status indicator sizes
const STATUS_SIZE: Record<AvatarSize, number> = {
  xxs: 8,
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  hero: 18,
  profile: 20,
};

// Verified badge sizes
const VERIFIED_SIZE: Record<AvatarSize, number> = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  hero: 24,
  profile: 28,
};

export interface TMAvatarProps {
  /** Image source URL */
  source?: string;
  /** User's name for generating initials fallback */
  name?: string;
  /** Avatar size preset */
  size?: AvatarSize;
  /** Show border around avatar */
  showBorder?: boolean;
  /** Border color (default: white) */
  borderColor?: string;
  /** Show status indicator */
  showStatus?: boolean;
  /** User status */
  status?: AvatarStatus;
  /** Show verified badge */
  showVerified?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Get initials from a name (up to 2 characters)
 */
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Get a consistent background color based on name
 */
const getBackgroundColor = (name: string): string => {
  const colors = [
    primitives.amber[400],
    primitives.magenta[400],
    primitives.seafoam[400],
    primitives.emerald[400],
    primitives.blue[400],
    primitives.purple[400],
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Get status indicator color
 */
const getStatusColor = (status: AvatarStatus): string => {
  switch (status) {
    case 'online':
      return COLORS.success;
    case 'away':
      return COLORS.warning;
    case 'offline':
    default:
      return primitives.stone[400];
  }
};

export const TMAvatar: React.FC<TMAvatarProps> = ({
  source,
  name = '',
  size = 'md',
  showBorder = false,
  borderColor = COLORS.white,
  showStatus = false,
  status = 'offline',
  showVerified = false,
  style,
  testID,
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarSize = SIZE_CONFIG[size];
  const showInitials = !source || imageError;

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    ...(showBorder && {
      borderWidth: size === 'xxs' || size === 'xs' ? 1.5 : 2,
      borderColor,
    }),
  };

  return (
    <View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      accessible
      accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
      accessibilityRole="image"
    >
      {/* Image or Initials Fallback */}
      {showInitials ? (
        <View
          style={[
            styles.initialsContainer,
            {
              width: avatarSize - (showBorder ? 4 : 0),
              height: avatarSize - (showBorder ? 4 : 0),
              borderRadius: (avatarSize - (showBorder ? 4 : 0)) / 2,
              backgroundColor: name
                ? getBackgroundColor(name)
                : primitives.stone[300],
            },
          ]}
        >
          <Text
            style={[styles.initials, { fontSize: INITIAL_FONT_SIZE[size] }]}
          >
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: avatarSize - (showBorder ? 4 : 0),
              height: avatarSize - (showBorder ? 4 : 0),
              borderRadius: (avatarSize - (showBorder ? 4 : 0)) / 2,
            },
          ]}
          onError={() => setImageError(true)}
        />
      )}

      {/* Status Indicator */}
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            size === 'xxs' ? styles.statusBorderThin : styles.statusBorderNormal,
            {
              width: STATUS_SIZE[size],
              height: STATUS_SIZE[size],
              borderRadius: STATUS_SIZE[size] / 2,
              backgroundColor: getStatusColor(status),
            },
          ]}
          accessibilityLabel={`Status: ${status}`}
        />
      )}

      {/* Verified Badge */}
      {showVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: VERIFIED_SIZE[size],
              height: VERIFIED_SIZE[size],
              borderRadius: VERIFIED_SIZE[size] / 2,
            },
          ]}
          accessibilityLabel="Verified user"
        >
          <MaterialCommunityIcons
            name="check-decagram"
            size={VERIFIED_SIZE[size]}
            color={COLORS.trust.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: {
    backgroundColor: primitives.stone[200],
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: COLORS.white,
  },
  statusBorderThin: {
    borderWidth: 1,
  },
  statusBorderNormal: {
    borderWidth: 2,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TMAvatar;
