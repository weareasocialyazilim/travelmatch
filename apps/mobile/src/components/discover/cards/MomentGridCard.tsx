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

interface MomentGridCardProps {
  moment: HookMoment;
  index: number;
  onPress: (moment: HookMoment) => void;
}

const MomentGridCard: React.FC<MomentGridCardProps> = memo(
  ({ moment, index, onPress }) => {
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
      <View
        style={index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight}
      >
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => onPress(moment)}
          activeOpacity={0.95}
        >
          <OptimizedImage
            {...getMomentImageProps(
              moment,
              IMAGE_VARIANTS_BY_CONTEXT.CARD_GRID,
              imageUrl,
            )}
            contentFit="cover"
            style={styles.gridImage}
            transition={200}
            priority="high"
            accessibilityLabel={`Photo of ${moment.title}`}
          />
          <View style={styles.gridContent}>
            <View style={styles.gridCreatorRow}>
              <OptimizedImage
                {...getAvatarImageProps(
                  hostUser,
                  IMAGE_VARIANTS_BY_CONTEXT.AVATAR_SMALL,
                  'https://via.placeholder.com/24',
                )}
                contentFit="cover"
                style={styles.gridAvatar}
                transition={150}
                priority="low"
                accessibilityLabel={`${hostName}'s avatar`}
              />
              <Text style={styles.gridCreatorName} numberOfLines={1}>
                {hostName.split(' ')[0]}
              </Text>
              {moment.hostRating > 4.5 && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={10}
                  color={COLORS.mint}
                />
              )}
            </View>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {moment.title}
            </Text>
            {moment.description && (
              <Text style={styles.gridStory} numberOfLines={1}>
                {moment.description}
              </Text>
            )}
            <View style={styles.gridFooter}>
              <View style={styles.gridLocationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={10}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.gridDistance}>{locationCity}</Text>
              </View>
              <Text style={styles.gridPrice}>${price}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.moment.pricePerGuest === nextProps.moment.pricePerGuest &&
    prevProps.index === nextProps.index,
);

MomentGridCard.displayName = 'MomentGridCard';

const styles = StyleSheet.create({
  gridItemLeft: {
    width: '50%',
    paddingRight: 6,
    marginBottom: 12,
  },
  gridItemRight: {
    width: '50%',
    paddingLeft: 6,
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridContent: {
    padding: 10,
  },
  gridCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  gridCreatorName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 17,
    marginBottom: 4,
  },
  gridStory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDistance: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  gridPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mint,
  },
});

export { MomentGridCard };
export default MomentGridCard;
