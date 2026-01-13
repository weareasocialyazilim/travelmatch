/**
 * TMCard - TravelMatch Ultimate Design System 2026
 * Moment card component with "Soft Glass" aesthetic
 *
 * Implements UX best practices from design references:
 * - Clear font hierarchy (24px headline, 16px subheadline, 14px body)
 * - Balanced button text (16px)
 * - Readable content with consistent scaling
 * - Badge support (Featured, Popular, New, Premium)
 * - Turkish localization
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, GRADIENTS, SHADOWS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING, SIZES } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/hooks/useMotion';
import { TMTrustRing } from './TMTrustRing';

// Badge type for moment cards (inspired by property card designs)
export type MomentBadgeType = 'featured' | 'popular' | 'new' | 'premium' | null;

// Badge type config moved to component body for i18n support

export interface MomentData {
  id: string;
  title: string;
  description?: string; // Short description (14px body text)
  imageUrl: string;
  location: {
    city: string;
    name?: string;
  };
  price: number;
  currency?: string;
  user: {
    name: string;
    avatar: string;
    trustScore: number;
    isVerified?: boolean;
  };
  distance?: string;
  category?: string;
  badge?: MomentBadgeType; // Featured/Popular/New/Premium badge
  metadata?: {
    // Additional metadata (like property cards)
    duration?: string; // "20 dk"
    servings?: string; // "4 kişi"
    difficulty?: string; // "Orta"
    beds?: number;
    baths?: number;
    sqft?: number;
  };
}

interface TMCardProps {
  moment: MomentData;
  onPress: () => void;
  onGiftPress?: () => void;
  variant?: 'default' | 'compact' | 'hero';
  showActions?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TMCard: React.FC<TMCardProps> = ({
  moment,
  onPress,
  onGiftPress,
  variant = 'default',
  showActions = true,
  style,
  testID,
}) => {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  // Memoized badge config with i18n labels
  const badgeConfig: Record<
    'featured' | 'popular' | 'new' | 'premium',
    { label: string; bg: string; icon?: string }
  > = useMemo(
    () => ({
      featured: {
        label: t('moments.card.featured'),
        bg: '#3D4A3A',
        icon: 'fire',
      },
      popular: {
        label: t('moments.card.popular'),
        bg: '#14B8A6',
        icon: 'heart',
      },
      new: { label: t('moments.card.new'), bg: '#292524' },
      premium: {
        label: t('moments.card.premium'),
        bg: '#F59E0B',
        icon: 'star',
      },
    }),
    [t],
  );

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, SPRING.snappy);
    runOnJS(HAPTIC.light)();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageHeight =
    variant === 'hero'
      ? SIZES.cardImageHeightLarge
      : variant === 'compact'
        ? SIZES.cardImageHeightSmall
        : SIZES.cardImageHeight;

  const currency = moment.currency || '$';

  return (
    <Animated.View
      style={[styles.cardWrapper, cardAnimatedStyle, style]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, variant === 'hero' && styles.cardHero]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${moment.title}, ${moment.location.city}, ${currency}${moment.price}`}
        accessibilityHint={t('accessibility.tapToViewDetails')}
      >
        {/* Image Section */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel={`${moment.title} - ${moment.location.city}`}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={GRADIENTS.cardOverlay}
            locations={[0, 0.5, 1]}
            style={styles.imageOverlay}
          />

          {/* Trust Ring - Top Right */}
          <View style={styles.trustRingPosition}>
            <TMTrustRing
              score={moment.user.trustScore}
              avatarUrl={moment.user.avatar}
              size="sm"
              showShimmer={moment.user.trustScore >= 70}
            />
          </View>

          {/* Location Badge - Bottom Left */}
          <BlurView intensity={20} style={styles.locationBadge}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={COLORS.white}
            />
            <Text style={styles.locationText}>
              {moment.location.city}
              {moment.distance ? ` • ${moment.distance}` : ''}
            </Text>
          </BlurView>

          {/* Feature Badge - Top Left (Featured/Popular/New/Premium) */}
          {moment.badge && badgeConfig[moment.badge] && (
            <View
              style={[
                styles.featureBadge,
                { backgroundColor: badgeConfig[moment.badge].bg },
              ]}
            >
              {badgeConfig[moment.badge].icon ? (
                <MaterialCommunityIcons
                  name={
                    badgeConfig[moment.badge].icon as React.ComponentProps<
                      typeof MaterialCommunityIcons
                    >['name']
                  }
                  size={12}
                  color={COLORS.white}
                />
              ) : null}
              <Text style={styles.featureBadgeText}>
                {badgeConfig[moment.badge].label}
              </Text>
            </View>
          )}

          {/* Category Badge - Below feature badge if no feature badge */}
          {!moment.badge && moment.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{moment.category}</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title - 24px headline equivalent (h4 = 17px, using h3 for 20px) */}
          <Text
            style={[styles.title, variant === 'compact' && styles.titleCompact]}
            numberOfLines={2}
          >
            {moment.title}
          </Text>

          {/* Description - 14px body text */}
          {moment.description && (
            <Text style={styles.description} numberOfLines={2}>
              {moment.description}
            </Text>
          )}

          {/* Metadata Row (duration, servings, etc.) */}
          {moment.metadata && (
            <View style={styles.metadataRow}>
              {moment.metadata.duration && (
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.metadataText}>
                    {moment.metadata.duration}
                  </Text>
                </View>
              )}
              {moment.metadata.servings && (
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.metadataText}>
                    {moment.metadata.servings}
                  </Text>
                </View>
              )}
              {moment.metadata.difficulty && (
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="signal"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.metadataText}>
                    {moment.metadata.difficulty}
                  </Text>
                </View>
              )}
              {moment.metadata.beds && (
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="bed-outline"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.metadataText}>
                    {moment.metadata.beds}
                  </Text>
                </View>
              )}
              {moment.metadata.baths && (
                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="shower"
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.metadataText}>
                    {moment.metadata.baths}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* User Info */}
          <View style={styles.userRow}>
            <Text style={styles.userName}>{moment.user.name}</Text>
            {moment.user.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={COLORS.trust.primary}
              />
            )}
          </View>

          {/* Action Row */}
          {showActions && (
            <View style={styles.actionRow}>
              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>
                  {t('moments.card.giftFor')}
                </Text>
                <Text style={styles.price}>
                  {currency}
                  {moment.price}
                </Text>
              </View>

              {/* CTA Buttons - 16px balanced text */}
              <View style={styles.buttons}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={onPress}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={t('moments.card.view')}
                >
                  <Text style={styles.secondaryButtonText}>
                    {t('moments.card.view')}
                  </Text>
                </Pressable>

                {onGiftPress && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={onGiftPress}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={t('moments.card.sendGift')}
                    accessibilityHint={t('accessibility.sendGiftToUser', { name: moment.user.name })}
                  >
                    <LinearGradient
                      colors={GRADIENTS.gift}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      <MaterialCommunityIcons
                        name="gift"
                        size={16}
                        color={COLORS.white}
                      />
                      <Text style={styles.primaryButtonText}>
                        {t('moments.card.sendGift')}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.card,
  },
  cardHero: {
    borderRadius: RADIUS.cardHero,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  trustRingPosition: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  locationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.chip,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  locationText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.white,
  },
  // Feature badge (Featured/Popular/New/Premium)
  featureBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.chip,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.chip,
  },
  categoryText: {
    ...TYPOGRAPHY.labelXSmall,
    color: COLORS.primary,
  },
  content: {
    padding: SPACING.cardPadding,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  titleCompact: {
    ...TYPOGRAPHY.label,
  },
  // Description - 14px body text for readability
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  // Metadata row (duration, servings, etc.)
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.text.secondary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textTertiary,
  },
  price: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surfaceMuted,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.text.primary,
  },
  primaryButton: {
    borderRadius: RADIUS.button,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.white,
  },
});

export default TMCard;
