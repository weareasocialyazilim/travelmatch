/**
 * TravelMatch Awwwards Design System 2026 - Moment Card
 *
 * Premium card with:
 * - Glassmorphism overlay
 * - Gradient price badge
 * - Smooth scale animations
 * - Trust indicators
 *
 * Designed for Awwwards Best UI nomination
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Dimensions,
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
// TYPES
// ============================================
interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onGiftPress: (moment: Moment) => void;
  onSharePress?: (moment: Moment) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
const MomentCard: React.FC<MomentCardProps> = memo(
  ({ moment, onPress, onGiftPress, onSharePress }) => {
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
        <Reanimated.View style={[styles.card, animatedStyle]}>
          {/* Image Container */}
          <View style={styles.imageContainer}>
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

            {/* Share Button */}
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
                  contentFit="cover"
                  style={styles.userAvatar}
                  transition={150}
                  priority="normal"
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

            {/* Price Badge */}
            <View style={styles.priceBadgeContainer}>
              <LinearGradient
                colors={GRADIENTS.gift}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.priceBadge}
              >
                <Text style={styles.priceText}>${moment.price}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {moment.title}
            </Text>

            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={COLORS.text.secondary}
              />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {moment.location?.city || 'Unknown location'}
              </Text>
            </View>

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
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <Pressable
                style={styles.primaryButton}
                onPress={handleGiftPress}
              >
                <LinearGradient
                  colors={GRADIENTS.gift}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <MaterialCommunityIcons
                    name="gift-outline"
                    size={18}
                    color={PALETTE.white}
                  />
                  <Text style={styles.primaryButtonText}>Hediye et</Text>
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
// STYLES
// ============================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000', // black
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
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
    ...TYPE_SCALE.label.small,
    color: PALETTE.white,
    fontWeight: '600',
  },
  verifiedBadge: {
    color: COLORS.trust.primary,
    fontSize: 12,
  },
  userRole: {
    ...TYPE_SCALE.body.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
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
    ...TYPE_SCALE.mono.priceSmall,
    color: PALETTE.white,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    ...TYPE_SCALE.display.h3,
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  cardLocation: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
    flex: 1,
  },
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
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
  },
  cardActions: {
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    ...TYPE_SCALE.label.large,
    color: PALETTE.white,
    fontWeight: '600',
  },
});

MomentCard.displayName = 'MomentCard';

export default MomentCard;
