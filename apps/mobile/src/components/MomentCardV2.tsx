/**
 * TravelMatch Awwwards Design System 2026 - Moment Card V2
 *
 * Premium card component for displaying moments/wishes with:
 * - Parallax image effect on scroll
 * - Animated trust ring around user avatar
 * - Glassmorphism category badge
 * - Animated gift button with pulse
 * - Micro-interactions on press
 *
 * This component is designed for Awwwards-level visual polish
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  COLORS_V2,
  GRADIENTS_V2,
  SHADOWS_V2,
  PALETTE,
  getTrustRingColors,
} from '../constants/colors-v2';
import { TYPE_SCALE } from '../constants/typography-v2';
import { SPRINGS } from '../hooks/useAnimationsV2';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
export interface MomentUser {
  id: string;
  name: string;
  avatar: string;
  isVerified?: boolean;
  trustScore?: number;
}

export interface MomentCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface MomentLocation {
  city: string;
  country?: string;
}

export interface Moment {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  currency?: string;
  user: MomentUser;
  category: MomentCategory;
  location: MomentLocation;
  createdAt?: string;
  isActive?: boolean;
}

export interface MomentCardV2Props {
  moment: Moment;
  onPress: (moment: Moment) => void;
  onGiftPress: (moment: Moment) => void;
  onSavePress?: (moment: Moment) => void;
  isSaved?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  scrollY?: SharedValue<number>;
  index?: number;
}

// ============================================
// TRUST RING COMPONENT
// ============================================
interface TrustRingProps {
  score: number;
  size?: number;
  children: React.ReactNode;
}

const TrustRing: React.FC<TrustRingProps> = ({ score, size = 48, children }) => {
  const colors = getTrustRingColors(score);
  const ringWidth = 3;

  return (
    <LinearGradient
      colors={colors}
      style={[
        styles.trustRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: ringWidth,
        },
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        style={[
          styles.trustRingInner,
          {
            borderRadius: (size - ringWidth * 2) / 2,
          },
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
};

// ============================================
// ANIMATED GIFT BUTTON
// ============================================
interface GiftButtonProps {
  onPress: () => void;
  price: number;
  currency?: string;
}

const GiftButton: React.FC<GiftButtonProps> = ({ onPress, price, currency = '$' }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Subtle pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, SPRINGS.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.giftButtonWrapper, SHADOWS_V2.buttonPrimary]}
      >
        <LinearGradient
          colors={GRADIENTS_V2.gift}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.giftButton}
        >
          <MaterialCommunityIcons name="gift" size={18} color={PALETTE.white} />
          <Text style={styles.giftButtonText}>
            {currency}{price}
          </Text>
        </LinearGradient>
      </Pressable>
    </Reanimated.View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const MomentCardV2: React.FC<MomentCardV2Props> = ({
  moment,
  onPress,
  onGiftPress,
  onSavePress,
  isSaved = false,
  variant = 'default',
  scrollY,
  index = 0,
}) => {
  const pressScale = useSharedValue(1);
  const saveScale = useSharedValue(1);

  // Card height based on variant
  const cardHeight = variant === 'featured' ? 380 : variant === 'compact' ? 220 : 320;

  // Press animation
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Parallax effect for image
  const imageAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const parallaxOffset = interpolate(
      scrollY.value,
      [-200, 0, 200],
      [20, 0, -20],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: parallaxOffset },
        { scale: 1.1 }, // Slightly oversized for parallax room
      ],
    };
  });

  // Save button animation
  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pressScale.value = withSpring(0.98, SPRINGS.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, SPRINGS.bouncy);
  }, []);

  const handlePress = useCallback(() => {
    onPress(moment);
  }, [moment, onPress]);

  const handleGiftPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGiftPress(moment);
  }, [moment, onGiftPress]);

  const handleSavePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveScale.value = withSequence(
      withSpring(0.8, SPRINGS.snappy),
      withSpring(1.2, SPRINGS.wobbly),
      withSpring(1, SPRINGS.bouncy)
    );
    onSavePress?.(moment);
  }, [moment, onSavePress]);

  return (
    <Reanimated.View style={[cardAnimatedStyle, styles.cardWrapper]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { height: cardHeight }, SHADOWS_V2.card]}
      >
        {/* Image Container with Parallax */}
        <View style={styles.imageContainer}>
          <Reanimated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
            <Image
              source={{ uri: moment.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </Reanimated.View>

          {/* Gradient Overlay */}
          <LinearGradient
            colors={GRADIENTS_V2.cardOverlay}
            locations={[0, 0.5, 1]}
            style={styles.imageOverlay}
          />

          {/* Category Badge - Glass Effect */}
          <BlurView
            intensity={Platform.OS === 'ios' ? 25 : 100}
            tint="light"
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryEmoji}>{moment.category.emoji}</Text>
            <Text style={styles.categoryText}>{moment.category.label}</Text>
          </BlurView>

          {/* User Badge with Trust Ring */}
          <View style={styles.userBadgeContainer}>
            <TrustRing score={moment.user.trustScore || 0}>
              <Image
                source={{ uri: moment.user.avatar }}
                style={styles.avatar}
              />
            </TrustRing>

            <BlurView
              intensity={Platform.OS === 'ios' ? 25 : 100}
              tint="light"
              style={styles.userInfo}
            >
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {moment.user.name}
                </Text>
                {moment.user.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={COLORS_V2.trust.primary}
                  />
                )}
              </View>
              <Text style={styles.userTrust}>
                Trust: {moment.user.trustScore || 0}%
              </Text>
            </BlurView>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {moment.title}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color={COLORS_V2.text.secondary}
            />
            <Text style={styles.location}>
              {moment.location.city}
              {moment.location.country ? `, ${moment.location.country}` : ''}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Bottom Row - Price + Actions */}
          <View style={styles.bottomRow}>
            {/* Price Label */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Gift for</Text>
              <Text style={styles.price}>
                ${moment.price}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {/* Save Button */}
              {onSavePress && (
                <Reanimated.View style={saveAnimatedStyle}>
                  <Pressable
                    onPress={handleSavePress}
                    style={styles.saveButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color={isSaved ? COLORS_V2.interactive.primary : COLORS_V2.text.secondary}
                    />
                  </Pressable>
                </Reanimated.View>
              )}

              {/* Gift Button */}
              <GiftButton
                onPress={handleGiftPress}
                price={moment.price}
                currency="$"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Reanimated.View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS_V2.surface.base,
    borderRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '55%',
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '120%', // Extra height for parallax
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    ...TYPE_SCALE.body.caption,
    color: PALETTE.white,
    fontWeight: '600',
  },
  userBadgeContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustRing: {
    zIndex: 2,
  },
  trustRingInner: {
    flex: 1,
    backgroundColor: COLORS_V2.surface.base,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginLeft: -12,
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    ...TYPE_SCALE.body.small,
    color: PALETTE.white,
    fontWeight: '600',
    maxWidth: 100,
  },
  userTrust: {
    ...TYPE_SCALE.body.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  title: {
    ...TYPE_SCALE.display.h3,
    color: COLORS_V2.text.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  location: {
    ...TYPE_SCALE.body.small,
    color: COLORS_V2.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS_V2.border.default,
    opacity: 0.5,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceLabel: {
    ...TYPE_SCALE.body.caption,
    color: COLORS_V2.text.muted,
  },
  price: {
    ...TYPE_SCALE.mono.price,
    color: COLORS_V2.interactive.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS_V2.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftButtonWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  giftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  giftButtonText: {
    ...TYPE_SCALE.label.base,
    color: PALETTE.white,
  },
});

export default MomentCardV2;
