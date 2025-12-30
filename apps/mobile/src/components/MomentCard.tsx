/**
 * TravelMatch Awwwards Design System 2026 - Moment Card
 *
 * Premium card with:
 * - Glassmorphism overlay
 * - Gradient price badge
 * - Smooth scale animations
 * - Trust indicators
 * - Badge system (Hot Choice, Top Rated, Featured)
 * - Clear font hierarchy (24px headline, 16px subheadline, 14px body)
 *
 * Designed for Awwwards Best UI nomination
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { OptimizedImage } from './ui/OptimizedImage';
import { analytics } from '../services/analytics';
import {
  getMomentImageProps,
  getAvatarImageProps,
  IMAGE_VARIANTS_BY_CONTEXT,
} from '../utils/cloudflareImageHelpers';
import { COLORS, GRADIENTS, PALETTE } from '../constants/colors';
import { TYPE_SCALE } from '../theme/typography';
import { SPRINGS } from '../hooks/useAnimations';
import { useToast } from '@/context/ToastContext';
import type { Moment } from '../types';

// ============================================
// BADGE TYPES & CONFIG
// ============================================
type BadgeType = 'hot' | 'featured' | 'top_rated' | 'new' | 'trending' | 'verified';

interface BadgeConfig {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  hot: {
    label: 'Popüler',
    icon: 'fire',
    backgroundColor: COLORS.secondaryMuted,
    textColor: COLORS.secondary,
    borderColor: COLORS.secondaryLight,
  },
  featured: {
    label: 'Öne Çıkan',
    icon: 'star',
    backgroundColor: COLORS.primaryMuted,
    textColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  top_rated: {
    label: 'En Beğenilen',
    icon: 'heart',
    backgroundColor: COLORS.trustMuted,
    textColor: COLORS.trust.primary,
    borderColor: COLORS.trustLight,
  },
  new: {
    label: 'Yeni',
    icon: 'new-box',
    backgroundColor: COLORS.accentMuted,
    textColor: COLORS.accent,
    borderColor: COLORS.accentLight,
  },
  trending: {
    label: 'Trend',
    icon: 'trending-up',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    textColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  verified: {
    label: 'Onaylı',
    icon: 'check-decagram',
    backgroundColor: COLORS.trustMuted,
    textColor: COLORS.trust.primary,
    borderColor: COLORS.trustLight,
  },
};

// ============================================
// TYPES
// ============================================
interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onGiftPress: (moment: Moment) => void;
  onSharePress?: (moment: Moment) => void;
  /** Badge to display (hot, featured, top_rated, new, trending, verified) */
  badge?: BadgeType;
  /** Compact mode for grid layouts */
  compact?: boolean;
}

// ============================================
// BADGE COMPONENT
// ============================================
const MomentBadge: React.FC<{ type: BadgeType }> = memo(({ type }) => {
  const config = BADGE_CONFIGS[type];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <MaterialCommunityIcons
        name={config.icon}
        size={12}
        color={config.textColor}
      />
      <Text style={[styles.badgeText, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
});

MomentBadge.displayName = 'MomentBadge';

// ============================================
// MAIN COMPONENT
// ============================================
const MomentCard: React.FC<MomentCardProps> = memo(
  ({ moment, onPress, onGiftPress, onSharePress, badge, compact = false }) => {
    const { showToast } = useToast();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, SPRINGS.snappy);
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, SPRINGS.bouncy);
    }, []);

    const handleGiftPress = useCallback(
      (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        analytics.trackEvent('gift_moment_clicked', {
          momentId: moment.id,
          momentTitle: moment.title,
          price: moment.price,
          location: moment.location?.city || 'unknown',
        });

        onGiftPress(moment);
      },
      [moment, onGiftPress],
    );

    const handleSharePress = useCallback(
      async (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (onSharePress) {
          onSharePress(moment);
          return;
        }

        try {
          const shareUrl = `https://travelmatch.app/moment/${moment.id}`;
          const shareMessage = `Check out this moment on TravelMatch: ${moment.title}\n${shareUrl}`;

          await Share.share({
            message: shareMessage,
            url: shareUrl,
            title: moment.title,
          });
        } catch (error) {
          if ((error as Error).message !== 'User did not share') {
            showToast('Could not share this moment', 'error');
          }
        }
      },
      [moment, onSharePress, showToast],
    );

    const handleCardPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }, [onPress]);

    // Memoize computed badge type from moment data if not provided
    const computedBadge = useMemo(() => {
      if (badge) return badge;
      // Auto-detect badge based on moment properties
      if (moment.user?.isVerified) return 'verified';
      // Add more auto-detection logic as needed
      return undefined;
    }, [badge, moment.user?.isVerified]);

    return (
      <Pressable
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`Moment: ${moment.title} by ${
          moment.user?.name || 'Unknown'
        }`}
        accessibilityRole="button"
      >
        <Reanimated.View style={[
          styles.card,
          compact && styles.cardCompact,
          animatedStyle
        ]}>
          {/* Image Container */}
          <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
            <OptimizedImage
              {...getMomentImageProps(
                moment,
                IMAGE_VARIANTS_BY_CONTEXT.CARD_SINGLE,
              )}
              contentFit="cover"
              style={styles.cardImage}
              transition={200}
              priority="high"
              accessibilityLabel={`Photo of ${moment.title}`}
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageOverlay}
            />

            {/* Badge - Top Left */}
            {computedBadge && (
              <View style={styles.badgeContainer}>
                <MomentBadge type={computedBadge} />
              </View>
            )}

            {/* Share Button - Top Right */}
            <Pressable
              style={styles.shareButton}
              onPress={handleSharePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Share this moment"
              accessibilityRole="button"
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 20 : 80}
                tint="light"
                style={styles.shareButtonBlur}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={PALETTE.white}
                />
              </BlurView>
            </Pressable>

            {/* User Badge with Glass Effect */}
            <View style={styles.userBadgeContainer}>
              <BlurView
                intensity={Platform.OS === 'ios' ? 30 : 80}
                tint="dark"
                style={styles.userBadge}
              >
                <OptimizedImage
                  {...getAvatarImageProps(
                    moment.user || {},
                    IMAGE_VARIANTS_BY_CONTEXT.AVATAR_SMALL,
                    'https://via.placeholder.com/150',
                  )}
                  style={styles.userAvatar}
                  accessibilityLabel={`${moment.user?.name || 'User'}'s avatar`}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {moment.user?.name || 'Anonymous'}
                    {moment.user?.isVerified && (
                      <Text style={styles.verifiedBadge}> ✓</Text>
                    )}
                  </Text>
                  <Text style={styles.userRole} numberOfLines={1}>
                    {moment.user?.role || 'Traveler'}
                  </Text>
                </View>
              </BlurView>
            </View>

            {/* Price Badge - Bottom Right */}
            <View style={styles.priceBadgeContainer}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.priceBadge}
              >
                <Text style={styles.priceText}>
                  ₺{moment.price?.toLocaleString('tr-TR') || '0'}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Card Content */}
          <View style={[styles.cardContent, compact && styles.cardContentCompact]}>
            {/* Title - Headline (18-20px for mobile) */}
            <Text
              style={[styles.cardTitle, compact && styles.cardTitleCompact]}
              numberOfLines={compact ? 1 : 2}
            >
              {moment.title}
            </Text>

            {/* Location Row */}
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={COLORS.text.secondary}
              />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {moment.location?.city || 'Unknown location'}
              </Text>
            </View>

            {/* Details Row - Only in non-compact mode */}
            {!compact && (
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color={COLORS.text.muted}
                  />
                  <Text style={styles.detailText}>
                    {moment.availability || 'Flexible'}
                  </Text>
                </View>
                {moment.user?.trustScore && (
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={14}
                      color={COLORS.trust.primary}
                    />
                    <Text style={[styles.detailText, { color: COLORS.trust.primary }]}>
                      {moment.user.trustScore}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons - 16px Button text */}
            <View style={[styles.cardActions, compact && styles.cardActionsCompact]}>
              <Pressable
                style={styles.primaryButton}
                onPress={handleGiftPress}
              >
                <LinearGradient
                  colors={GRADIENTS.gift}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.primaryButtonGradient,
                    compact && styles.primaryButtonGradientCompact
                  ]}
                >
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={compact ? 16 : 18}
                    color={PALETTE.white}
                  />
                  <Text style={[
                    styles.primaryButtonText,
                    compact && styles.primaryButtonTextCompact
                  ]}>
                    Hediye et
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Reanimated.View>
      </Pressable>
    );
  },
);

// ============================================
// STYLES - Following design reference:
// Headline: 20px (mobile scale of 24px)
// Subheadline: 14px (mobile scale of 16px)
// Body: 12px-14px
// Button: 14px-16px
// ============================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 20, // Consistent rounded corners
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  cardCompact: {
    borderRadius: 16,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  imageContainerCompact: {
    height: 160,
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Badge styles - Top Left positioning like reference images
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Share button - Top Right
  shareButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  shareButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // User badge - Bottom Left
  userBadgeContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PALETTE.white,
  },
  userInfo: {
    marginLeft: 8,
  },
  userName: {
    fontSize: 13, // Subheadline scale
    fontWeight: '600',
    color: PALETTE.white,
  },
  verifiedBadge: {
    color: COLORS.trust.primary,
    fontSize: 12,
  },
  userRole: {
    fontSize: 11, // Caption
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },

  // Price badge - Bottom Right
  priceBadgeContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceText: {
    fontSize: 15, // Price emphasis
    fontWeight: '700',
    color: PALETTE.white,
    fontVariant: ['tabular-nums'],
  },

  // Content Section
  cardContent: {
    padding: 16,
  },
  cardContentCompact: {
    padding: 12,
  },

  // Title - Headline (20px for mobile, equivalent to 24px desktop)
  cardTitle: {
    fontSize: 18, // Mobile headline
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 6,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  cardTitleCompact: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },

  // Location - Body text (14px)
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 13, // Body small
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },

  // Details row
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12, // Caption
    color: COLORS.text.muted,
    lineHeight: 16,
  },

  // Actions
  cardActions: {
    marginTop: 16,
  },
  cardActionsCompact: {
    marginTop: 12,
  },

  // Primary Button - 16px button text
  primaryButton: {
    borderRadius: 24, // Pill shape
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonGradientCompact: {
    paddingVertical: 10,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 15, // Button text
    fontWeight: '600',
    color: PALETTE.white,
    letterSpacing: 0.3,
  },
  primaryButtonTextCompact: {
    fontSize: 13,
  },
});

MomentCard.displayName = 'MomentCard';

export default MomentCard;
export { MomentBadge, BADGE_CONFIGS };
export type { BadgeType, MomentCardProps };
