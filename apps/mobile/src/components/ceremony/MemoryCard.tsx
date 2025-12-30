/**
 * MemoryCard Component
 *
 * Shareable completion card showing the verified proof.
 * Generated after ceremony completion for social sharing.
 *
 * @example
 * ```tsx
 * <MemoryCard
 *   gift={gift}
 *   proofPhotos={proofData.photos}
 *   verifiedAt={new Date()}
 *   onShare={handleShare}
 *   onSave={handleSave}
 * />
 * ```
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { CEREMONY_COLORS, CEREMONY_SIZES } from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(CEREMONY_SIZES.memoryCard.width, SCREEN_WIDTH - 40);
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface Gift {
  id: string;
  momentTitle: string;
  giverName: string;
  receiverName?: string;
  amount: number;
  currency: string;
  location?: string;
}

interface MemoryCardProps {
  /** Gift information */
  gift: Gift;
  /** Proof photos */
  proofPhotos: string[];
  /** Verification timestamp */
  verifiedAt: Date;
  /** Share callback */
  onShare?: (cardUrl: string) => void;
  /** Save callback */
  onSave?: (cardUrl: string) => void;
  /** Is this the giver's view */
  isGiverView?: boolean;
  /** Test ID */
  testID?: string;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  gift,
  proofPhotos,
  verifiedAt,
  onShare,
  onSave,
  isGiverView = false,
  testID,
}) => {
  const viewShotRef = useRef<ViewShot>(null);
  const shimmerPosition = useSharedValue(0);

  // Shimmer animation for the badge
  React.useEffect(() => {
    shimmerPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (shimmerPosition.value * CARD_WIDTH) - CARD_WIDTH }],
  }));

  const captureCard = useCallback(async (): Promise<string | null> => {
    if (!viewShotRef.current) return null;

    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });
      return uri;
    } catch (error) {
      console.error('Error capturing card:', error);
      return null;
    }
  }, []);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const uri = await captureCard();

    if (uri) {
      try {
        await Share.share({
          url: uri,
          message: `${gift.momentTitle} deneyimimi TravelMatch'te tamamladım! 🎉`,
        });
        onShare?.(uri);
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const uri = await captureCard();

    if (uri) {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onSave?.(uri);
        }
      } catch (error) {
        console.error('Save error:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Card */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.cardContainer}
      >
        <LinearGradient
          colors={GRADIENTS.sunset}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Background pattern */}
          <View style={styles.pattern}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.patternLine} />
            ))}
          </View>

          {/* Verified badge */}
          <Animated.View style={styles.verifiedBadge}>
            <View style={styles.badgeContent}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={16}
                color={COLORS.white}
              />
              <Text style={styles.badgeText}>VERIFIED</Text>
            </View>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </Animated.View>

          {/* Main photo */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: proofPhotos[0] }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
            {/* Photo overlay gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.photoOverlay}
            />

            {/* Additional photos indicator */}
            {proofPhotos.length > 1 && (
              <View style={styles.morePhotos}>
                <Text style={styles.morePhotosText}>+{proofPhotos.length - 1}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Moment title */}
            <Text style={styles.momentTitle}>{gift.momentTitle}</Text>

            {/* Location */}
            {gift.location && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.locationText}>{gift.location}</Text>
              </View>
            )}

            {/* People involved */}
            <View style={styles.peopleRow}>
              <View style={styles.personBadge}>
                <MaterialCommunityIcons
                  name="gift"
                  size={12}
                  color={COLORS.white}
                />
                <Text style={styles.personText}>
                  {isGiverView ? gift.receiverName : gift.giverName}
                </Text>
              </View>
            </View>

            {/* Date */}
            <Text style={styles.dateText}>{formatDate(verifiedAt)}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.brandRow}>
              <MaterialCommunityIcons
                name="airplane-takeoff"
                size={14}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.brandText}>TravelMatch</Text>
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorTopLeft}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={20}
              color="rgba(255,255,255,0.2)"
            />
          </View>
          <View style={styles.decorBottomRight}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={16}
              color="rgba(255,255,255,0.15)"
            />
          </View>
        </LinearGradient>
      </ViewShot>

      {/* Actions */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="download"
            size={22}
            color={COLORS.text}
          />
          <Text style={styles.actionText}>Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButtonGradient}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={22}
              color={COLORS.white}
            />
            <Text style={styles.shareButtonText}>Paylaş</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Info text */}
      <Text style={styles.infoText}>
        Bu anı kartını arkadaşlarınla paylaşabilirsin
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  patternLine: {
    height: 1,
    backgroundColor: COLORS.white,
    marginVertical: 20,
    marginHorizontal: 20,
  },
  verifiedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoContainer: {
    height: '55%',
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  morePhotos: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  morePhotosText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  peopleRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  personBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 12,
  },
  personText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  decorTopLeft: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
  },
  decorBottomRight: {
    position: 'absolute',
    bottom: 60,
    right: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 25,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default MemoryCard;
