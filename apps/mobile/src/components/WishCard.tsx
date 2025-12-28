/**
 * WishCard Component (Redesigned MomentCard)
 *
 * A visually appealing card for displaying gift wishes/moments.
 * Features hero image, trust ring, KYC badge, story text, and gift button.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OptimizedImage } from './ui/OptimizedImage';
import { TrustRing } from './TrustRing';
import { KYCBadge, KYCLevel } from './KYCBadge';
import { GiftButton } from './GiftButton';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.25; // 4:5 aspect ratio

interface WishCardUser {
  id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  kycLevel: KYCLevel;
}

interface WishCardLocation {
  name: string;
  city: string;
}

interface WishCardData {
  id: string;
  title: string;
  story?: string;
  imageUrl: string;
  location: WishCardLocation;
  price: number;
  currency?: string;
  user: WishCardUser;
}

interface WishCardProps {
  /** Wish/moment data */
  wish: WishCardData;
  /** Callback when gift button is pressed */
  onGift: () => void;
  /** Callback when card is pressed (navigate to detail) */
  onPress: () => void;
  /** Callback when save/bookmark is toggled */
  onSave: () => void;
  /** Whether this wish is saved/bookmarked */
  isSaved?: boolean;
}

export const WishCard: React.FC<WishCardProps> = memo(
  ({ wish, onGift, onPress, onSave, isSaved = false }) => {
    const scale = useSharedValue(1);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, { damping: 15 });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, [scale]);

    const handleCardPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }, [onPress]);

    const handleSavePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSave();
    }, [onSave]);

    return (
      <Animated.View style={[styles.container, cardAnimatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleCardPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {/* Hero Image */}
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: wish.imageUrl }}
              style={styles.image}
              contentFit="cover"
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            />

            {/* Save/Bookmark Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BlurView intensity={60} tint="light" style={styles.saveBlur}>
                <MaterialCommunityIcons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isSaved ? COLORS.brand.primary : COLORS.utility.white}
                />
              </BlurView>
            </TouchableOpacity>

            {/* User Badge with Trust Ring */}
            <View style={styles.userBadge}>
              <BlurView intensity={80} tint="dark" style={styles.userBlur}>
                <View style={styles.avatarContainer}>
                  <TrustRing
                    score={wish.user.trustScore}
                    size={48}
                    strokeWidth={2}
                  >
                    <OptimizedImage
                      source={{
                        uri:
                          wish.user.avatar || 'https://via.placeholder.com/40',
                      }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  </TrustRing>
                  <KYCBadge
                    level={wish.user.kycLevel}
                    size={12}
                    offset={{ bottom: -1, right: -1 }}
                  />
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {wish.user.name}
                  </Text>
                  <View style={styles.trustRow}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={12}
                      color={COLORS.feedback.success}
                    />
                    <Text style={styles.trustText}>{wish.user.trustScore}</Text>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Content Overlay */}
            <View style={styles.contentOverlay}>
              <Text style={styles.wishTitle} numberOfLines={2}>
                {wish.title}
              </Text>
              {wish.story && (
                <Text style={styles.wishStory} numberOfLines={2}>
                  "{wish.story}"
                </Text>
              )}
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.locationText}>
                  {wish.location.name}, {wish.location.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.priceTag}>
              <Text style={styles.priceLabel}>yaklaşık</Text>
              <Text style={styles.priceValue}>
                {wish.currency || '₺'}
                {wish.price}
              </Text>
            </View>
            <View style={styles.giftButtonContainer}>
              <GiftButton onPress={onGift} size="medium" fullWidth />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

WishCard.displayName = 'WishCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.utility.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  saveBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userBadge: {
    position: 'absolute',
    bottom: 80,
    left: 16,
  },
  userBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingLeft: 8,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    color: COLORS.utility.white,
    fontSize: 14,
    fontWeight: '600',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trustText: {
    color: COLORS.feedback.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  wishTitle: {
    color: COLORS.utility.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    lineHeight: 28,
  },
  wishStory: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 4,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  priceTag: {
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.text.primaryMuted,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  giftButtonContainer: {
    flex: 1,
  },
});

export default WishCard;
