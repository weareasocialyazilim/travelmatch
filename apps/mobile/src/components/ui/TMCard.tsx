// components/ui/TMCard.tsx
// TravelMatch Ultimate Design System 2026
// Moment card component with "Soft Glass" aesthetic

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { RADIUS, SPACING, SIZES } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/hooks/useMotion';
import { TMTrustRing } from './TMTrustRing';

export interface MomentData {
  id: string;
  title: string;
  imageUrl: string;
  location: {
    city: string;
    name?: string;
  };
  price: number;
  currency?: string;
  user: {
    name: string;
    avatar: string;
    trustScore: number;
    isVerified?: boolean;
  };
  distance?: string;
  category?: string;
}

interface TMCardProps {
  moment: MomentData;
  onPress: () => void;
  onGiftPress?: () => void;
  variant?: 'default' | 'compact' | 'hero';
  showActions?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TMCard: React.FC<TMCardProps> = ({
  moment,
  onPress,
  onGiftPress,
  variant = 'default',
  showActions = true,
  style,
  testID,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, SPRING.snappy);
    runOnJS(HAPTIC.light)();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageHeight =
    variant === 'hero'
      ? SIZES.cardImageHeightLarge
      : variant === 'compact'
        ? SIZES.cardImageHeightSmall
        : SIZES.cardImageHeight;

  const currency = moment.currency || '$';

  return (
    <Animated.View
      style={[styles.cardWrapper, cardAnimatedStyle, style]}
      testID={testID}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, variant === 'hero' && styles.cardHero]}
      >
        {/* Image Section */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={GRADIENTS.cardOverlay}
            locations={[0, 0.5, 1]}
            style={styles.imageOverlay}
          />

          {/* Trust Ring - Top Right */}
          <View style={styles.trustRingPosition}>
            <TMTrustRing
              score={moment.user.trustScore}
              avatarUrl={moment.user.avatar}
              size="sm"
              showShimmer={moment.user.trustScore >= 70}
            />
          </View>

          {/* Location Badge - Bottom Left */}
          <BlurView intensity={20} style={styles.locationBadge}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={COLORS.utility.white}
            />
            <Text style={styles.locationText}>
              {moment.location.city}
              {moment.distance && ` • ${moment.distance}`}
            </Text>
          </BlurView>

          {/* Category Badge - Top Left (optional) */}
          {moment.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{moment.category}</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title */}
          <Text
            style={[styles.title, variant === 'compact' && styles.titleCompact]}
            numberOfLines={2}
          >
            {moment.title}
          </Text>

          {/* User Info */}
          <View style={styles.userRow}>
            <Text style={styles.userName}>{moment.user.name}</Text>
            {moment.user.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={COLORS.trust.primary}
              />
            )}
          </View>

          {/* Action Row */}
          {showActions && (
            <View style={styles.actionRow}>
              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Gift for</Text>
                <Text style={styles.price}>
                  {currency}
                  {moment.price}
                </Text>
              </View>

              {/* CTA Buttons */}
              <View style={styles.buttons}>
                <Pressable style={styles.secondaryButton} onPress={onPress}>
                  <Text style={styles.secondaryButtonText}>View</Text>
                </Pressable>

                {onGiftPress && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={onGiftPress}
                  >
                    <LinearGradient
                      colors={GRADIENTS.gift}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButtonGradient}
                    >
                      <MaterialCommunityIcons
                        name="gift"
                        size={16}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.primaryButtonText}>Send gift</Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
    ...SHADOWS.card,
  },
  cardHero: {
    borderRadius: RADIUS.cardHero,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  trustRingPosition: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  locationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.chip,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  locationText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.utility.white,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.chip,
  },
  categoryText: {
    ...TYPOGRAPHY.labelXSmall,
    color: COLORS.brand.primary,
  },
  content: {
    padding: SPACING.cardPadding,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  titleCompact: {
    ...TYPOGRAPHY.label,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.text.tertiary,
  },
  price: {
    ...TYPOGRAPHY.price,
    color: COLORS.brand.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.surface.baseMuted,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.text.primary,
  },
  primaryButton: {
    borderRadius: RADIUS.button,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.utility.white,
  },
});

export default TMCard;
