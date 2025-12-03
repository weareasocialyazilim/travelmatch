import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, Image, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  showVerified?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = COLORS.success,
  showVerified = false,
  style,
}) => {
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
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              borderWidth: 2,
              borderColor: COLORS.surfaceLight,
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
};

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
  verified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 999,
  },
});

export default Avatar;
