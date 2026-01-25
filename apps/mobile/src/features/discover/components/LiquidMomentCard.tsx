/**
 * LiquidMomentCard - Awwwards Quality Compact Moment Card
 *
 * Premium card combining:
 * - High-resolution visuals with silky gradients
 * - Subscription tier badges (Platinum, Pro glow effects)
 * - Glass info panel for 40+ demographic clarity
 * - Liquid glass effects for depth perception
 * - Creator-set price with currency display (Wanted Gift)
 *
 * Ghost Logic Cleanup: Replaced VIP badge with subscription_tier system
 */

import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import type { SubscriptionTier } from '@/features/moments/services/momentsService';

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

// Subscription tier styling configuration
const TIER_CONFIG: Record<
  SubscriptionTier,
  {
    label: string;
    icon: string;
    borderColor: string;
    glowColor: string;
    showBadge: boolean;
  }
> = {
  free: {
    label: '',
    icon: '',
    borderColor: 'transparent',
    glowColor: 'transparent',
    showBadge: false,
  },
  premium: {
    label: 'PREMIUM',
    icon: 'star',
    borderColor: '#7B61FF',
    glowColor: 'rgba(123, 97, 255, 0.4)',
    showBadge: true,
  },
  platinum: {
    label: 'PLATINUM',
    icon: 'crown',
    borderColor: '#FFB800',
    glowColor: 'rgba(255, 184, 0, 0.4)',
    showBadge: true,
  },
};

export interface LiquidMomentCardProps {
  momentId?: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  hostSubscriptionTier?: SubscriptionTier;
  isSubscriberOnly?: boolean;
  onPress?: () => void;
  onGiftPress?: () => void;
}

/**
 * Awwwards standardında Liquid Moment Card.
 * Görsel derinlik ve ipeksi glass paneller içerir.
 * Creator-set price ile "🎁 X ile Destekle" butonu gösterir.
 * Subscription tier badge ile premium host gösterimi.
 */
export const LiquidMomentCard: React.FC<LiquidMomentCardProps> = memo(
  ({
    momentId: _momentId,
    title,
    location,
    price,
    currency = 'TRY',
    imageUrl,
    hostSubscriptionTier = 'free',
    isSubscriberOnly = false,
    onPress,
    onGiftPress,
  }) => {
    // Format price with currency symbol
    const formattedPrice = useMemo(() => {
      const symbol = CURRENCY_SYMBOLS[currency] || currency;
      return `${symbol}${price.toLocaleString()}`;
    }, [price, currency]);

    // Get tier styling
    const tierConfig = TIER_CONFIG[hostSubscriptionTier];
    const hasPremiumBorder = tierConfig.showBadge;

    // Premium border style
    const premiumBorderStyle = useMemo(
      () =>
        hasPremiumBorder
          ? {
              borderWidth: 2,
              borderColor: tierConfig.borderColor,
              shadowColor: tierConfig.borderColor,
              shadowOpacity: 0.6,
              shadowRadius: 12,
            }
          : null,
      [hasPremiumBorder, tierConfig.borderColor],
    );

    return (
      <TouchableOpacity
        style={[styles.container, premiumBorderStyle]}
        activeOpacity={0.9}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${location}, ${formattedPrice}${tierConfig.showBadge ? `, ${tierConfig.label}` : ''}`}
        accessibilityHint="Tap to view moment details"
      >
        <AnimatedImageBackground
          source={{
            uri:
              imageUrl ||
              'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
          }}
          style={styles.backgroundImage}
          imageStyle={styles.imageStyle}
        >
          {/* Top Scrim with Subscription Badge */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent']}
            style={styles.topScrim}
          >
            <View style={styles.badgeRow}>
              {/* Subscription Tier Badge */}
              {tierConfig.showBadge && (
                <View
                  style={[
                    styles.tierBadge,
                    { backgroundColor: tierConfig.borderColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={tierConfig.icon as any}
                    size={10}
                    color="#FFFFFF"
                  />
                  <Text style={styles.tierBadgeText}>{tierConfig.label}</Text>
                </View>
              )}

              {/* Subscriber Only Badge */}
              {isSubscriberOnly && (
                <View style={styles.subscriberOnlyBadge}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={10}
                    color="#FFFFFF"
                  />
                  <Text style={styles.subscriberOnlyText}>ABONE ÖZEL</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Bottom Section with Liquid Glass Info Panel */}
          <View style={styles.bottomSection}>
            <GlassCard intensity={30} tint="dark" style={styles.glassInfo}>
              <View style={styles.infoRow}>
                <View style={styles.textContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-sharp"
                      size={12}
                      color={COLORS.primary}
                    />
                    <Text style={styles.locationText}>{location}</Text>
                  </View>
                </View>

                {/* Wanted Gift Button with Creator-Set Price */}
                <TouchableOpacity
                  style={styles.giftButton}
                  onPress={onGiftPress}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Gift ${formattedPrice}`}
                  accessibilityHint="Opens gift payment flow"
                >
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={16}
                    color={COLORS.text.primary}
                  />
                  <Text style={styles.giftButtonText}>{formattedPrice}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </AnimatedImageBackground>
      </TouchableOpacity>
    );
  },
);

LiquidMomentCard.displayName = 'LiquidMomentCard';

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: COLORS.surface.base,
    // Premium shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 32,
  },
  topScrim: {
    height: 80,
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subscriberOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 97, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  subscriberOnlyText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Legacy: keeping for backward compatibility
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 20, 0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
    // Neon glow effect
    shadowColor: COLORS.primary,
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  instantText: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomSection: {
    padding: 12,
  },
  glassInfo: {
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    color: COLORS.text.onDarkSecondary,
    fontSize: FONT_SIZES.bodySmall,
    fontFamily: FONTS.body.regular,
  },
  // Gift Button with Creator-Set Price
  giftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    // Neon glow for gift button
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  giftButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: '900',
    fontFamily: FONTS.mono.medium,
  },
});

export default LiquidMomentCard;
