import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { Moment } from '../types';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';
import { useHaptics } from '../hooks/useHaptics';
import { usePressScale } from '../utils/animations';
import Animated from 'react-native-reanimated';

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onGiftPress: (moment: Moment) => void;
  onSharePress?: (moment: Moment) => void;
}

const MomentCard: React.FC<MomentCardProps> = memo(
  ({ moment, onPress, onGiftPress, onSharePress }) => {
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
        impact('medium');
        onGiftPress(moment);
      },
      [moment, onGiftPress, impact],
    );

    const handleSharePress = useCallback(
      async (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        impact('light');

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
            Alert.alert('Error', 'Could not share this moment');
          }
        }
      },
      [moment, onSharePress, impact],
    );

    const handleMaybeLater = useCallback(
      (e: unknown) => {
        if (e && typeof e === 'object' && 'stopPropagation' in e) {
          (e as { stopPropagation: () => void }).stopPropagation();
        }
        impact('light');
      },
      [impact],
    );

    const handleCardPress = useCallback(() => {
      impact('light');
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
            <Image
              source={{ uri: moment.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
              accessibilityLabel={`Photo of ${moment.title}`}
            />

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePress}
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
              <Image
                source={{
                  uri: moment.user?.avatar || 'https://via.placeholder.com/150',
                }}
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
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardDetails: {
    borderTopColor: COLORS.glassBorder,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  cardImage: {
    height: 200,
    width: '100%',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: spacing.xs,
  },
  shareButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
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
    gap: spacing.sm,
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
    bottom: spacing.sm,
    flexDirection: 'row',
    left: spacing.sm,
    paddingRight: 12,
    paddingLeft: 6,
    paddingVertical: 6,
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  userInfo: {
    marginLeft: spacing.xs,
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
