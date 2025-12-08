/**
 * Memoized Moment Card Component
 * Optimized rendering for FlatList performance
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import type { Moment } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

interface MomentCardProps {
  moment: Moment;
  onPress: (moment: Moment) => void;
  onFavorite?: (momentId: string) => void;
  isFavorite?: boolean;
  variant?: 'single' | 'grid';
}

/**
 * Memoized Moment Card
 * Only re-renders when moment data or favorite state changes
 */
export const MemoizedMomentCard = memo<MomentCardProps>(
  ({ moment, onPress, onFavorite, isFavorite = false, variant = 'single' }) => {
    const handlePress = useCallback(() => {
      onPress(moment);
    }, [moment, onPress]);

    const handleFavorite = useCallback(() => {
      onFavorite?.(moment.id);
    }, [moment.id, onFavorite]);

    const isGrid = variant === 'grid';
    const cardWidth = isGrid ? GRID_CARD_WIDTH : CARD_WIDTH;
    const imageHeight = isGrid ? 120 : 200;

    // Get user info (could be user or creator)
    const momentUser = moment.user || moment.creator;
    const userName = momentUser?.name || 'Unknown host';
    const userAvatar = momentUser?.avatar;
    const isVerified = momentUser?.isVerified;

    // Get category label
    const categoryLabel =
      typeof moment.category === 'object'
        ? moment.category?.label
        : moment.category;

    return (
      <TouchableOpacity
        style={[styles.container, { width: cardWidth }]}
        onPress={handlePress}
        activeOpacity={0.9}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${moment.title} by ${userName}, $${moment.price} per person`}
      >
        {/* Image */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: moment.imageUrl || moment.image }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Favorite Button */}
          {onFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <MaterialCommunityIcons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={isGrid ? 20 : 24}
                color={isFavorite ? COLORS.error : COLORS.white}
              />
            </TouchableOpacity>
          )}

          {/* Category Badge */}
          {categoryLabel && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, isGrid && styles.titleGrid]}
            numberOfLines={isGrid ? 1 : 2}
          >
            {moment.title}
          </Text>

          {/* Host Info */}
          {momentUser && !isGrid && (
            <View style={styles.hostRow}>
              {userAvatar && (
                <Image source={{ uri: userAvatar }} style={styles.hostAvatar} />
              )}
              <Text style={styles.hostName} numberOfLines={1}>
                {userName}
              </Text>
              {isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={14}
                  color={COLORS.primary}
                />
              )}
            </View>
          )}

          {/* Location */}
          {moment.location && (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={isGrid ? 12 : 14}
                color={COLORS.textSecondary}
              />
              <Text
                style={[styles.locationText, isGrid && styles.locationTextGrid]}
                numberOfLines={1}
              >
                {typeof moment.location === 'string'
                  ? moment.location
                  : moment.location.city || moment.location.name}
              </Text>
            </View>
          )}

          {/* Distance & Price Row */}
          <View style={styles.bottomRow}>
            {moment.distance && (
              <View style={styles.distanceContainer}>
                <MaterialCommunityIcons
                  name="walk"
                  size={isGrid ? 12 : 14}
                  color={COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.distanceText,
                    isGrid && styles.distanceTextGrid,
                  ]}
                >
                  {moment.distance}
                </Text>
              </View>
            )}

            <Text style={[styles.price, isGrid && styles.priceGrid]}>
              ${moment.price}
              <Text style={styles.priceUnit}>/person</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison function for optimal performance
  (prevProps, nextProps) => {
    return (
      prevProps.moment.id === nextProps.moment.id &&
      prevProps.moment.title === nextProps.moment.title &&
      prevProps.moment.price === nextProps.moment.price &&
      prevProps.moment.distance === nextProps.moment.distance &&
      prevProps.isFavorite === nextProps.isFavorite &&
      prevProps.variant === nextProps.variant
    );
  },
);

MemoizedMomentCard.displayName = 'MemoizedMomentCard';

/**
 * Memoized Message Item for chat lists
 */
interface MessageItemProps {
  id: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  onPress: (id: string) => void;
}

export const MemoizedMessageItem = memo<MessageItemProps>(
  ({
    id,
    userName,
    userAvatar,
    lastMessage,
    timestamp,
    unreadCount = 0,
    isOnline,
    onPress,
  }) => {
    const handlePress = useCallback(() => {
      onPress(id);
    }, [id, onPress]);

    return (
      <TouchableOpacity
        style={styles.messageContainer}
        onPress={handlePress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${userName}, ${lastMessage}`}
      >
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.messageAvatar} />
          ) : (
            <View style={[styles.messageAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
          <Text
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.lastMessage === nextProps.lastMessage &&
      prevProps.timestamp === nextProps.timestamp &&
      prevProps.unreadCount === nextProps.unreadCount &&
      prevProps.isOnline === nextProps.isOnline
    );
  },
);

MemoizedMessageItem.displayName = 'MemoizedMessageItem';

const styles = StyleSheet.create({
  // Moment Card Styles
  avatarContainer: {
    position: 'relative',
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.sm,
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.md,
  },
  distanceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  distanceText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  distanceTextGrid: {
    fontSize: 11,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.overlay30,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 40,
  },
  hostAvatar: {
    borderRadius: 12,
    height: 24,
    marginRight: spacing.xs,
    width: 24,
  },
  hostName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: spacing.xs,
  },
  hostRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  lastMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  locationText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: spacing.xs,
  },
  locationTextGrid: {
    fontSize: 11,
  },
  messageAvatar: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  messageContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  messageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  onlineIndicator: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: 'absolute',
    right: 0,
    width: 12,
  },
  price: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '700',
  },
  priceGrid: {
    fontSize: 14,
  },
  priceUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  titleGrid: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
    paddingHorizontal: spacing.xs,
  },
  unreadCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: '600',
  },
  userName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    fontWeight: '600',
  },
});
