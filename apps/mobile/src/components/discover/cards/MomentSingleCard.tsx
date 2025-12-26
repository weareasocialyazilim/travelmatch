import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
  getMomentImageProps,
  getAvatarImageProps,
  IMAGE_VARIANTS_BY_CONTEXT,
} from '@/utils/cloudflareImageHelpers';
import { COLORS } from '@/constants/colors';
import type { Moment as HookMoment } from '@/hooks/useMoments';

interface MomentSingleCardProps {
  moment: HookMoment;
  onPress: (moment: HookMoment) => void;
}

const MomentSingleCard: React.FC<MomentSingleCardProps> = memo(
  ({ moment, onPress }) => {
    const imageUrl =
      moment.image || moment.images?.[0] || 'https://via.placeholder.com/400';
    const hostName = moment.hostName || 'Anonymous';
    const price = moment.price ?? moment.pricePerGuest ?? 0;
    const locationCity =
      typeof moment.location === 'string'
        ? moment.location
        : moment.location?.city || 'Unknown';

    // Prepare user object for avatar helper
    const hostUser = (() => {
      const m = moment as unknown as {
        hostAvatarCloudflareId?: string;
        hostAvatarBlurHash?: string;
      };
      return {
        avatar: moment.hostAvatar,
        avatarCloudflareId: m.hostAvatarCloudflareId,
        avatarBlurHash: m.hostAvatarBlurHash,
      };
    })();

    return (
      <TouchableOpacity
        style={styles.singleCard}
        onPress={() => onPress(moment)}
        activeOpacity={0.95}
      >
        <OptimizedImage
          {...getMomentImageProps(
            moment,
            IMAGE_VARIANTS_BY_CONTEXT.CARD_SINGLE,
            imageUrl,
          )}
          contentFit="cover"
          style={styles.singleImage}
          transition={200}
          priority="high"
          accessibilityLabel={`Photo of ${moment.title}`}
        />
        <View style={styles.singleContent}>
          <View style={styles.creatorRow}>
            <OptimizedImage
              {...getAvatarImageProps(
                hostUser,
                IMAGE_VARIANTS_BY_CONTEXT.AVATAR_SMALL,
                'https://via.placeholder.com/40',
              )}
              contentFit="cover"
              style={styles.creatorAvatar}
              transition={150}
              priority="normal"
              accessibilityLabel={`${hostName}'s avatar`}
            />
            <View style={styles.creatorInfo}>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>{hostName}</Text>
                {moment.hostRating > 4.5 && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={COLORS.mint}
                  />
                )}
              </View>
            </View>
          </View>
          <Text style={styles.singleTitle} numberOfLines={2}>
            {moment.title}
          </Text>
          {moment.description && (
            <Text style={styles.storyDescription} numberOfLines={2}>
              {moment.description}
            </Text>
          )}
          <View style={styles.locationDistanceRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.locationText}>{locationCity}</Text>
          </View>
          <Text style={styles.priceValue}>${price}</Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.moment.pricePerGuest === nextProps.moment.pricePerGuest,
);

MomentSingleCard.displayName = 'MomentSingleCard';

const styles = StyleSheet.create({
  singleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  singleContent: {
    padding: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  singleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  storyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: COLORS.textSecondary,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.mint,
  },
});

export { MomentSingleCard };
export default MomentSingleCard;
