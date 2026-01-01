/**
 * ImmersiveMomentCard - TravelMatch: The Rebirth
 *
 * Full-screen moment card for TikTok-style vertical feed
 * Features:
 * - Full screen visual with gradient overlay
 * - TikTok-style sidebar actions (like, comment, share)
 * - Gift and Counter-Offer buttons
 * - User badge with verification
 * - Location and price tags
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/theme/colors';
import type { Moment } from '@/hooks/useMoments';

const { width, height } = Dimensions.get('window');

// Props interface
export interface ImmersiveMomentCardProps {
  item: Moment;
  onGiftPress: () => void;
  onCounterOfferPress: () => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onUserPress?: () => void;
}

// Format large numbers (e.g., 2400 -> 2.4k)
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// Sidebar Action Button Component
interface SidebarButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  count?: string;
  onPress?: () => void;
  isLiked?: boolean;
}

const SidebarButton = memo(
  ({ icon, count, onPress, isLiked }: SidebarButtonProps) => (
    <TouchableOpacity
      style={styles.sidebarButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={32}
        color={isLiked ? COLORS.feedback.error : 'white'}
      />
      {count && <Text style={styles.sidebarText}>{count}</Text>}
    </TouchableOpacity>
  ),
);

// Main Component
export const ImmersiveMomentCard = memo(
  ({
    item,
    onGiftPress,
    onCounterOfferPress,
    onLikePress,
    onCommentPress,
    onSharePress,
    onUserPress,
  }: ImmersiveMomentCardProps) => {
    // Get the first image or use a placeholder
    const imageUrl =
      item.images?.[0] || item.image || 'https://via.placeholder.com/400x800';

    // Get location string
    const locationString =
      typeof item.location === 'string'
        ? item.location
        : item.location?.city || 'Unknown Location';

    // Get price
    const price = item.price || item.pricePerGuest || 0;

    return (
      <View style={styles.container}>
        {/* 1. Full Screen Visual */}
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        {/* 2. Gradient Overlay (for readability) */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />

        {/* 3. Content Layout */}
        <View style={styles.contentOverlay}>
          {/* User Badge */}
          <TouchableOpacity
            style={styles.userInfo}
            onPress={onUserPress}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: item.hostAvatar || 'https://via.placeholder.com/40',
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>@{item.hostName || 'unknown'}</Text>
            {item.hostRating && item.hostRating > 4.5 && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={14}
                  color={COLORS.brand.primary}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Moment Details (Bottom Left) */}
          <View style={styles.detailsContainer}>
            {/* Location Tag */}
            <View style={styles.locationTag}>
              <Ionicons name="location-sharp" size={14} color="white" />
              <Text style={styles.locationText}>{locationString}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Price Tag */}
            <View style={styles.priceTag}>
              <Text style={styles.priceLabel}>Estimated Cost</Text>
              <Text style={styles.priceValue}>
                ${price}
                {item.currency && item.currency !== 'USD' && ` ${item.currency}`}
              </Text>
            </View>
          </View>

          {/* 4. Action Sidebar (Right Side - Like TikTok) */}
          <View style={styles.sidebar}>
            <SidebarButton
              icon={item.isSaved ? 'heart' : 'heart-outline'}
              count={formatCount(item.saves || 0)}
              onPress={onLikePress}
              isLiked={item.isSaved}
            />

            <SidebarButton
              icon="chatbubble-ellipses"
              count={formatCount(item.requestCount || 0)}
              onPress={onCommentPress}
            />

            <SidebarButton icon="share-social" count="Share" onPress={onSharePress} />
          </View>

          {/* 5. Main Actions (Gift vs Counter-Offer) */}
          <View style={styles.bottomActions}>
            {/* Counter-Offer / Suggest Swap Button */}
            <TouchableOpacity
              style={styles.recommendButton}
              onPress={onCounterOfferPress}
              activeOpacity={0.8}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={30} style={styles.glassInner}>
                  <MaterialCommunityIcons
                    name="swap-horizontal-bold"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.recommendText}>Suggest Swap</Text>
                </BlurView>
              ) : (
                <View style={[styles.glassInner, styles.androidGlass]}>
                  <MaterialCommunityIcons
                    name="swap-horizontal-bold"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.recommendText}>Suggest Swap</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Direct Gift Button */}
            <TouchableOpacity
              style={styles.giftButton}
              onPress={onGiftPress}
              activeOpacity={0.8}
            >
              <Text style={styles.giftText}>Gift This</Text>
              <Text style={styles.giftEmoji}>🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height, // Full Screen
    backgroundColor: 'black',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%', // Bottom 50% darkening
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 110, // Space for dock
    paddingHorizontal: 20,
  },

  // User Info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  verifiedBadge: {
    marginTop: 2,
  },

  // Details Container
  detailsContainer: {
    width: '80%',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  priceValue: {
    color: COLORS.brand.primary, // Neon Lime
    fontSize: 20,
    fontWeight: '900',
  },

  // Sidebar
  sidebar: {
    position: 'absolute',
    right: 10,
    bottom: 180, // Above action buttons
    alignItems: 'center',
    gap: 20,
  },
  sidebarButton: {
    alignItems: 'center',
  },
  sidebarText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  recommendButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  glassInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  androidGlass: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
  },
  recommendText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  giftButton: {
    flex: 1.5, // Wider
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  giftText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 18,
  },
  giftEmoji: {
    fontSize: 18,
  },
});

export default ImmersiveMomentCard;
