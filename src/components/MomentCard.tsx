import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
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
          <Image source={{ uri: moment.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{moment.user.name}</Text>
            <Text style={styles.userRole}>{moment.user.role}</Text>
          </View>
        </View>

        {/* Verified badge */}
        {moment.user.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.white} />
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
              <MaterialCommunityIcons name="map-marker" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{moment.place}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{moment.availability}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={18} color={COLORS.textSecondary} />
            <Text style={[styles.detailText, styles.priceText]}>${moment.price}</Text>
          </View>
        </View>

        {moment.giftCount && moment.giftCount > 0 && (
          <Text style={styles.socialProof}>
            {moment.giftCount} {moment.giftCount === 1 ? 'person' : 'people'} gifted this
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => onGiftPress?.(moment.id)}
            accessibilityRole="button"
            accessibilityLabel="Gift this moment"
            accessibilityHint={`Gift ${moment.title} for $${moment.price}`}>
            <Text style={styles.primaryButtonText}>Gift this moment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => onMaybeLaterPress?.(moment.id)}
            accessibilityRole="button"
            accessibilityLabel="Save for later">
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
    marginBottom: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.card.borderRadius,
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: LAYOUT.card.imageAspectRatio,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  userBadge: {
    position: 'absolute',
    top: LAYOUT.spacing.md,
    left: LAYOUT.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    paddingRight: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    paddingLeft: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.borderRadius.full,
    backgroundColor: COLORS.cardBackground,
    ...CARD_SHADOW,
  },
  userAvatar: {
    width: LAYOUT.avatar.size,
    height: LAYOUT.avatar.size,
    borderRadius: LAYOUT.avatar.borderRadius,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  verifiedBadge: {
    position: 'absolute',
    top: LAYOUT.spacing.md,
    right: LAYOUT.spacing.md,
    width: LAYOUT.verifiedBadge.size,
    height: LAYOUT.verifiedBadge.size,
    borderRadius: LAYOUT.verifiedBadge.borderRadius,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: LAYOUT.card.padding,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
    lineHeight: 26,
  },
  cardLocation: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.md,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  socialProof: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: LAYOUT.spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
    paddingTop: LAYOUT.spacing.sm,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: LAYOUT.borderRadius.full,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadius.full,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default memo(MomentCard);
