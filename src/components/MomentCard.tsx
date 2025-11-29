import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { Moment } from '../types';

interface MomentCardProps {
  moment: Moment;
  onGiftPress?: (momentId: string) => void;
  onMaybeLaterPress?: (momentId: string) => void;
}

const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onGiftPress,
  onMaybeLaterPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: moment.imageUrl || moment.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* User badge */}
        <View style={styles.userBadge}>
          <Image
            source={{ uri: moment.user.avatar }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{moment.user.name}</Text>
            <Text style={styles.userRole}>{moment.user.role}</Text>
          </View>
        </View>

        {/* Verified badge */}
        {moment.user.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={18}
              color={COLORS.white}
            />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {moment.title}
        </Text>
        <Text style={styles.cardLocation}>
          {typeof moment.location === 'string'
            ? moment.location
            : moment.location?.name}
        </Text>

        <View style={styles.cardDetails}>
          {moment.place && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={COLORS.textSecondary}
              />
              <Text style={styles.detailText}>{moment.place}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailText}>{moment.availability}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.detailText, styles.priceText]}>
              ${moment.price}
            </Text>
          </View>
        </View>

        {moment.giftCount && moment.giftCount > 0 && (
          <Text style={styles.socialProof}>
            {moment.giftCount} {moment.giftCount === 1 ? 'person' : 'people'}{' '}
            gifted this
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => onGiftPress?.(moment.id)}
            accessibilityRole="button"
            accessibilityLabel="Gift this moment"
            accessibilityHint={`Gift ${moment.title} for $${moment.price}`}
          >
            <Text style={styles.primaryButtonText}>Gift this moment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => onMaybeLaterPress?.(moment.id)}
            accessibilityRole="button"
            accessibilityLabel="Save for later"
          >
            <Text style={styles.secondaryButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

MomentCard.displayName = 'MomentCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: LAYOUT.card.borderRadius,
    marginBottom: LAYOUT.spacing.lg,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
    paddingTop: LAYOUT.spacing.sm,
  },
  cardContent: {
    padding: LAYOUT.card.padding,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  cardImageContainer: {
    aspectRatio: LAYOUT.card.imageAspectRatio,
    position: 'relative',
    width: '100%',
  },
  cardLocation: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: LAYOUT.spacing.md,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: LAYOUT.spacing.sm,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: LAYOUT.spacing.xs,
  },
  detailText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  priceText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.full,
    flex: 2,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: LAYOUT.borderRadius.full,
    flex: 1,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  socialProof: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginBottom: LAYOUT.spacing.md,
  },
  userAvatar: {
    borderRadius: LAYOUT.avatar.borderRadius,
    height: LAYOUT.avatar.size,
    width: LAYOUT.avatar.size,
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: LAYOUT.borderRadius.full,
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
    left: LAYOUT.spacing.md,
    paddingLeft: LAYOUT.spacing.xs,
    paddingRight: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    position: 'absolute',
    top: LAYOUT.spacing.md,
    ...CARD_SHADOW,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.verifiedBadge.borderRadius,
    height: LAYOUT.verifiedBadge.size,
    justifyContent: 'center',
    position: 'absolute',
    right: LAYOUT.spacing.md,
    top: LAYOUT.spacing.md,
    width: LAYOUT.verifiedBadge.size,
  },
});

export default memo(MomentCard);
