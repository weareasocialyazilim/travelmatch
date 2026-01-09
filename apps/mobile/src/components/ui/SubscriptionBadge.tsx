/**
 * SubscriptionBadge Component
 *
 * Tinder/Bumble tarzı subscription tier badge
 * Premium ve Platinum kullanıcılar için görsel ayrıcalık göstergesi
 *
 * Kullanım:
 * - ProfileHeaderSection'da avatar yanında
 * - DiscoverScreen header'da
 * - UserCards'da (chat, match vs.)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

export type SubscriptionTier = 'free' | 'premium' | 'platinum';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onPress?: () => void;
  style?: object;
}

const TIER_CONFIG = {
  free: {
    label: 'Ücretsiz',
    icon: 'account-outline' as const,
    colors: ['#64748B', '#475569'] as const,
    textColor: COLORS.text.secondary,
    borderColor: 'transparent',
  },
  premium: {
    label: 'Premium',
    icon: 'star' as const,
    colors: ['#FFD700', '#FFA500'] as const, // Gold gradient
    textColor: '#1A1A1A',
    borderColor: '#FFD700',
  },
  platinum: {
    label: 'Platinum',
    icon: 'diamond-stone' as const,
    colors: ['#E5E4E2', '#B8B8B8', '#E5E4E2'] as const, // Silver/Platinum shimmer
    textColor: '#1A1A1A',
    borderColor: '#E5E4E2',
  },
};

const SIZE_CONFIG = {
  small: {
    height: 20,
    paddingHorizontal: 6,
    iconSize: 12,
    fontSize: 10,
    borderRadius: 10,
  },
  medium: {
    height: 28,
    paddingHorizontal: 10,
    iconSize: 16,
    fontSize: 12,
    borderRadius: 14,
  },
  large: {
    height: 36,
    paddingHorizontal: 14,
    iconSize: 20,
    fontSize: 14,
    borderRadius: 18,
  },
};

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  tier,
  size = 'medium',
  showLabel = true,
  onPress,
  style,
}) => {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const shimmer = useSharedValue(0);

  // Platinum shimmer effect
  React.useEffect(() => {
    if (tier === 'platinum') {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [tier]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: tier === 'platinum' ? 0.3 + shimmer.value * 0.4 : 1,
  }));

  // Free tier - minimal display
  if (tier === 'free') {
    if (!onPress) return null;

    return (
      <TouchableOpacity
        style={[
          styles.upgradeButton,
          { height: sizeConfig.height, borderRadius: sizeConfig.borderRadius },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#DFFF00', '#C8E600']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientFill,
            { borderRadius: sizeConfig.borderRadius },
          ]}
        >
          <MaterialCommunityIcons
            name="crown"
            size={sizeConfig.iconSize}
            color="#1A1A1A"
          />
          {showLabel && (
            <Text
              style={[styles.upgradeText, { fontSize: sizeConfig.fontSize }]}
            >
              Yükselt
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const BadgeContent = (
    <Animated.View style={shimmerStyle}>
      <LinearGradient
        colors={config.colors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            borderRadius: sizeConfig.borderRadius,
            borderColor: config.borderColor,
            borderWidth: tier === 'platinum' ? 1 : 0,
          } as const,
          style,
        ]}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={sizeConfig.iconSize}
          color={config.textColor}
        />
        {showLabel && (
          <Text
            style={[
              styles.label,
              { color: config.textColor, fontSize: sizeConfig.fontSize },
            ]}
          >
            {config.label}
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
};

// Inline Upgrade CTA for Discover/Profile
interface SubscriptionUpgradeCTAProps {
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
  compact?: boolean;
}

export const SubscriptionUpgradeCTA: React.FC<SubscriptionUpgradeCTAProps> = ({
  currentTier,
  onUpgrade,
  compact = false,
}) => {
  if (currentTier !== 'free') return null;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCTA}
        onPress={onUpgrade}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(223, 255, 0, 0.15)', 'rgba(168, 85, 247, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.compactCTAGradient}
        >
          <MaterialCommunityIcons
            name="crown"
            size={18}
            color={COLORS.brand.primary}
          />
          <Text style={styles.compactCTAText}>Premium'a Yükselt</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={COLORS.text.secondary}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.fullCTA}
      onPress={onUpgrade}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#DFFF00', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fullCTAGradient}
      >
        <View style={styles.ctaContent}>
          <MaterialCommunityIcons name="crown" size={28} color="#1A1A1A" />
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>TravelMatch Premium</Text>
            <Text style={styles.ctaSubtitle}>
              Sınırsız teklif gönder, öncelikli eşleşme
            </Text>
          </View>
        </View>
        <View style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Keşfet</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontWeight: '700',
  },
  upgradeButton: {
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 4,
  },
  upgradeText: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  // Compact CTA
  compactCTA: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  compactCTAText: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Full CTA
  fullCTA: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default SubscriptionBadge;
