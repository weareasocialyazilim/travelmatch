/**
 * KYCBadge Component
 *
 * Displays verification level badges on user avatars.
 * Part of iOS 26.3 design system for TravelMatch.
 *
 * Badge Levels:
 * - Bronze: Email verified
 * - Silver: Phone verified
 * - Gold: Full KYC (ID verified)
 * - Platinum: 10+ successful gifts + Gold KYC
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

export type KYCLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface KYCBadgeProps {
  /** Verification level */
  level: KYCLevel;
  /** Badge size */
  size?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Position offset from bottom-right */
  offset?: { bottom?: number; right?: number };
  /** Whether to show glow animation for gold/platinum */
  animated?: boolean;
}

const KYC_CONFIG = {
  none: {
    color: 'transparent',
    icon: 'shield-outline' as const,
    label: 'Doğrulanmamış',
  },
  bronze: {
    color: COLORS.kycBronze,
    icon: 'shield-check' as const,
    label: 'Email Doğrulandı',
  },
  silver: {
    color: COLORS.kycSilver,
    icon: 'shield-check' as const,
    label: 'Telefon Doğrulandı',
  },
  gold: {
    color: COLORS.kycGold,
    icon: 'shield-check' as const,
    label: 'Kimlik Doğrulandı',
  },
  platinum: {
    color: COLORS.kycPlatinum,
    icon: 'shield-star' as const,
    label: 'Platinum Üye',
  },
};

export const KYCBadge: React.FC<KYCBadgeProps> = ({
  level,
  size = 16,
  style,
  offset = { bottom: -2, right: -2 },
  animated = true,
}) => {
  const config = KYC_CONFIG[level];
  const glowOpacity = useSharedValue(0.3);

  // Glow animation for gold and platinum
  React.useEffect(() => {
    if (animated && (level === 'gold' || level === 'platinum')) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
        ),
        -1,
        true,
      );
    }
  }, [level, animated, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Don't render anything for 'none' level (after all hooks)
  if (level === 'none') return null;

  const showGlow = animated && (level === 'gold' || level === 'platinum');
  const containerSize = size + 8; // Padding for the badge container
  const iconSize = size;

  return (
    <View
      style={[
        styles.badge,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: config.color,
          bottom: offset.bottom,
          right: offset.right,
        },
        style,
      ]}
    >
      {/* Glow effect for premium badges */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: containerSize + 4,
              height: containerSize + 4,
              borderRadius: (containerSize + 4) / 2,
              backgroundColor: config.color,
            },
            glowStyle,
          ]}
        />
      )}

      {/* Badge icon */}
      <MaterialCommunityIcons
        name={config.icon}
        size={iconSize}
        color={COLORS.white}
      />
    </View>
  );
};

/**
 * Get the label for a KYC level
 */
export const getKYCLabel = (level: KYCLevel): string => {
  return KYC_CONFIG[level].label;
};

/**
 * Get the next KYC level for upgrade prompts
 */
export const getNextKYCLevel = (current: KYCLevel): KYCLevel | null => {
  const levels: KYCLevel[] = ['none', 'bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = levels.indexOf(current);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  glow: {
    position: 'absolute',
  },
});

export default KYCBadge;
