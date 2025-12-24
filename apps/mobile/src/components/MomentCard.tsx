import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { OptimizedImage } from './ui/OptimizedImage';
import { analytics } from '../services/analytics';
import { getMomentImageProps, getAvatarImageProps, IMAGE_VARIANTS_BY_CONTEXT } from '../utils/cloudflareImageHelpers';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { spacing, SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { useHaptics } from '../hooks/useHaptics';
import { usePressScale } from '../utils/animations';
import { useToast } from '@/context/ToastContext';
import type { Moment } from '../types';

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onGiftPress: (moment: Moment) => void;
  onSharePress?: (moment: Moment) => void;
}

const MomentCard: React.FC<MomentCardProps> = memo(
  ({ moment, onPress, onGiftPress, onSharePress }) => {
    const { showToast } = useToast();
    const { impact } = useHaptics();
    const {
      animatedStyle: cardScale,
      onPressIn: onCardPressIn,
      onPressOut: onCardPressOut,
    } = usePressScale();

    // Memoize gift button handler to prevent recreating on every render
    const handleGiftPress = useCallback(
      (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        void impact('medium');

        // Track gift button click
        analytics.trackEvent('gift_moment_clicked', {
          momentId: moment.id,
          momentTitle: moment.title,
          price: moment.price,
          location: moment.location?.city || 'unknown',
        });

        onGiftPress(moment);
      },
      [moment, onGiftPress, impact],
    );

    const handleSharePress = useCallback(
      async (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        void impact('light');

        if (onSharePress) {
          onSharePress(moment);
          return;
        }

        // Default share behavior
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
      [moment, onSharePress, impact, showToast],
    );

    const handleMaybeLater = useCallback(
      (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        void impact('light');
      },
      [impact],
    );

    const handleCardPress = useCallback(() => {
      void impact('light');
      onPress();
    }, [onPress, impact]);

    return (
      <TouchableOpacity
        onPress={handleCardPress}
        onPressIn={onCardPressIn}
        onPressOut={onCardPressOut}
        activeOpacity={1}
        accessibilityLabel={`Moment: ${moment.title} by ${
          moment.user?.name || 'Unknown'
        }`}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.card, cardScale]}>
          <View style={styles.cardImageContainer}>
            <OptimizedImage
              {...getMomentImageProps(moment, IMAGE_VARIANTS_BY_CONTEXT.CARD_SINGLE)}
              contentFit="cover"
              style={styles.cardImage}
              transition={200}
              priority="high"
              accessibilityLabel={`Photo of ${moment.title}`}
            />

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
              accessibilityLabel="Share this moment"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>

            <View style={styles.userBadge}>
              <OptimizedImage
                {...getAvatarImageProps(
                  moment.user || {},
                  IMAGE_VARIANTS_BY_CONTEXT.AVATAR_SMALL,
                  'https://via.placeholder.com/150'
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
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {moment.title}
            </Text>
            <Text style={styles.cardLocation}>{moment.location.city}</Text>

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {moment.location.name}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {moment.availability}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.priceText}>${moment.price}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={handleGiftPress}
              >
                <Text style={styles.primaryButtonText}>Gift this moment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={handleMaybeLater}
              >
                <Text style={styles.secondaryButtonText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: radii.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardDetails: {
    borderTopColor: COLORS.glassBorder,
    borderTopWidth: 1,
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  cardImage: {
    height: 200,
    width: '100%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  shareButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.overlay50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  detailText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: radii.full,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: radii.full,
    height: 44,
    justifyContent: 'center',
    width: 120,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  userAvatar: {
    borderColor: COLORS.white,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 36,
    width: 36,
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay75,
    borderRadius: 18,
    bottom: SPACING.sm,
    flexDirection: 'row',
    left: SPACING.sm,
    paddingRight: 12,
    paddingLeft: 6,
    paddingVertical: 6,
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  userInfo: {
    marginLeft: SPACING.xs,
  },
  userName: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedBadge: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 3,
  },
  userRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite80,
    fontSize: 11,
    marginTop: 1,
  },
});

MomentCard.displayName = 'MomentCard';

export default MomentCard;
