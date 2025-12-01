import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Moment } from '../types';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';

interface MomentCardProps {
  moment: Moment;
  onPress: () => void;
  onGiftPress: (moment: Moment) => void;
}

const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  onPress,
  onGiftPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: moment.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.userBadge}>
          <Image
            source={{ uri: moment.user.avatar }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {moment.user.name}
              </Text>
              {moment.user.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={14}
                  color={COLORS.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.userRole}>{moment.user.role}</Text>
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
            onPress={(e) => {
              e.stopPropagation();
              onGiftPress(moment);
            }}
          >
            <Text style={styles.primaryButtonText}>Gift this moment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.secondaryButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
    borderRadius: radii.full,
    height: 48,
    width: 48,
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: radii.full,
    bottom: spacing.md,
    flexDirection: 'row',
    left: spacing.md,
    padding: spacing.xs,
    position: 'absolute',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.md,
  },
  userName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flexShrink: 1,
    fontWeight: 'bold',
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  verifiedIcon: {
    marginLeft: spacing.xs,
  },
});

export default MomentCard;
