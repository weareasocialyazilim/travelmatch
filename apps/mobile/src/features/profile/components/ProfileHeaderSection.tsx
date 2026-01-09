/**
 * TravelMatch Awwwards Design System 2026 - Profile Header
 *
 * Modern profile header with:
 * - Large avatar with animated trust ring
 * - Glassmorphism stat cards
 * - Floating edit button
 * - Gradient background
 *
 * Designed for Awwwards Best UI nomination
 */

import React, { useCallback, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { TMAvatar } from '@/components/ui/TMAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';

import { COLORS, PALETTE, getTrustRingColors } from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { TYPE_SCALE } from '@/theme/typography';
import { SPRINGS } from '@/hooks/useAnimations';
import { SubscriptionBadge, type SubscriptionTier } from '@/components/ui';

// ============================================
// TYPES
// ============================================
interface UserShape {
  id?: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  location?: { city?: string; country?: string } | string;
  kyc?: boolean;
  trust_score?: number;
  isVerified?: boolean;
  momentsCount?: number;
  exchangesCount?: number;
  responseRate?: number;
}

interface ProfileHeaderSectionProps {
  user?: UserShape;
  avatarUrl?: string;
  userName?: string;
  username?: string;
  bio?: string;
  location?: string | { city?: string; country?: string };
  isVerified?: boolean;
  trustScore?: number;
  momentsCount?: number;
  exchangesCount?: number;
  responseRate?: number;
  subscriptionTier?: SubscriptionTier;
  onEditPress?: () => void;
  onTrustGardenPress?: () => void;
  onSettingsPress?: () => void;
  onSubscriptionPress?: () => void;
  // Parallax animation styles
  parallaxAvatarStyle?: object;
  parallaxTitleStyle?: object;
  parallaxSubtitleStyle?: object;
  parallaxContentStyle?: object;
}

// ============================================
// ANIMATED TRUST RING COMPONENT
// ============================================
interface AnimatedTrustRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}

const AnimatedTrustRing: React.FC<AnimatedTrustRingProps> = ({
  score,
  size = 104,
  strokeWidth = 4,
  children,
}) => {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const colors = getTrustRingColors(score);

  useEffect(() => {
    // Animate progress
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    });

    // Subtle rotation animation
    rotation.value = withRepeat(
      withSequence(withTiming(360, { duration: 20000, easing: Easing.linear })),
      -1,
      false,
    );
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.trustRingContainer, { width: size, height: size }]}>
      {/* Neon Glow Effect - Outer */}
      <View
        style={[
          styles.avatarGlow,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: colors.ring,
          },
        ]}
      />

      {/* Background Circle */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill as object}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
      </Svg>

      {/* Animated Progress Ring */}
      <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.ring} />
              <Stop offset="100%" stopColor={colors.glow} />
            </SvgGradient>
          </Defs>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#trustGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
      </Reanimated.View>

      {/* Avatar Container */}
      <View
        style={[styles.avatarWrapper, { width: size - 16, height: size - 16 }]}
      >
        {children}
      </View>

      {/* Trust Badge - Color indicator only, no number */}
    </View>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
interface _StatCardProps {
  value: string | number;
  label: string;
}

// StatCard is currently unused but kept for future use
const _StatCard: React.FC<_StatCardProps> = memo(({ value, label }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withSpring(0, SPRINGS.gentle);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SPRINGS.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.statCardPressable}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 20 : 80}
          tint="light"
          style={styles.statCard}
        >
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </BlurView>
      </Pressable>
    </Reanimated.View>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================
const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = memo(
  ({
    user,
    avatarUrl,
    userName,
    bio,
    location,
    isVerified,
    trustScore,
    momentsCount,
    exchangesCount,
    responseRate,
    subscriptionTier = 'free',
    onEditPress,
    onTrustGardenPress,
    onSettingsPress,
    onSubscriptionPress,
    parallaxAvatarStyle,
    parallaxTitleStyle,
    parallaxSubtitleStyle,
    parallaxContentStyle,
  }) => {
    const _insets = useSafeAreaInsets();
    const editButtonScale = useSharedValue(1);
    // Translation hook available for future i18n
    const { t: _t } = useTranslation();

    // Normalize values to support both `user` shape and individual props
    const resolvedAvatar = avatarUrl || user?.avatar || '';
    const resolvedName = userName || user?.name || '';
    const resolvedBio = bio || user?.bio || '';
    const resolvedLocation =
      typeof location === 'string'
        ? location
        : (location as any)?.city ||
          (user && typeof user.location === 'string'
            ? user.location
            : (user?.location as any)?.city) ||
          '';
    const resolvedVerified =
      typeof isVerified === 'boolean'
        ? isVerified
        : !!user?.kyc || !!user?.isVerified;
    const resolvedTrust =
      typeof trustScore === 'number' ? trustScore : (user?.trust_score ?? 0);
    // Stats values prepared for future stats display
    const _resolvedMoments = momentsCount ?? user?.momentsCount ?? 0;
    const _resolvedExchanges = exchangesCount ?? user?.exchangesCount ?? 0;
    const _resolvedResponse = responseRate ?? user?.responseRate ?? 0;

    const handleEditPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEditPress?.();
    }, [onEditPress]);

    const handleTrustPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTrustGardenPress?.();
    }, [onTrustGardenPress]);

    const handleSettingsPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSettingsPress?.();
    }, [onSettingsPress]);

    const editButtonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: editButtonScale.value }],
    }));

    const handleEditPressIn = () => {
      editButtonScale.value = withSpring(0.9, SPRINGS.snappy);
    };

    const handleEditPressOut = () => {
      editButtonScale.value = withSpring(1, SPRINGS.bouncy);
    };

    return (
      <View style={styles.container}>
        {/* Background Gradient - Twilight Zinc Dark Theme */}
        <LinearGradient
          colors={['#18181B', '#27272A', '#3F3F46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View style={styles.headerSpacer} />
          {onSettingsPress && (
            <Pressable
              onPress={handleSettingsPress}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BlurView
                intensity={Platform.OS === 'ios' ? 30 : 80}
                tint="light"
                style={styles.headerButtonBlur}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={22}
                  color={PALETTE.white}
                />
              </BlurView>
            </Pressable>
          )}
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Reanimated.View style={[parallaxAvatarStyle]}>
            <Pressable onPress={handleTrustPress} style={styles.avatarSection}>
              <AnimatedTrustRing score={resolvedTrust}>
                <TMAvatar
                  testID="profile-avatar"
                  source={resolvedAvatar}
                  name={resolvedName}
                  size="profile"
                  style={styles.avatar}
                />
              </AnimatedTrustRing>
            </Pressable>
          </Reanimated.View>

          <Reanimated.View style={[styles.userInfo, parallaxContentStyle]}>
            <Reanimated.View style={[styles.nameRow, parallaxTitleStyle]}>
              <Text style={styles.userName}>{resolvedName}</Text>
              {resolvedVerified && (
                <View style={styles.verifiedBadgeContainer}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
              )}
            </Reanimated.View>

            <Reanimated.View
              style={[styles.subscriptionRow, parallaxSubtitleStyle]}
            >
              <SubscriptionBadge
                tier={subscriptionTier}
                size="medium"
                showLabel
                onPress={onSubscriptionPress}
              />
            </Reanimated.View>

            {resolvedBio && (
              <Reanimated.Text style={[styles.bioText, parallaxSubtitleStyle]}>
                {resolvedBio}
              </Reanimated.Text>
            )}

            {resolvedLocation && (
              <Reanimated.View
                style={[styles.locationRow, parallaxSubtitleStyle]}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.location}>{resolvedLocation}</Text>
              </Reanimated.View>
            )}
          </Reanimated.View>

          {onEditPress && (
            <Reanimated.View
              style={[styles.editButtonContainer, editButtonAnimatedStyle]}
            >
              <Pressable
                testID="edit-button"
                onPress={handleEditPress}
                onPressIn={handleEditPressIn}
                onPressOut={handleEditPressOut}
                style={styles.editButton}
                accessibilityRole="button"
              >
                <BlurView
                  intensity={Platform.OS === 'ios' ? 30 : 80}
                  tint="light"
                  style={styles.editButtonBlur}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={22}
                    color={PALETTE.white}
                  />
                </BlurView>
              </Pressable>
            </Reanimated.View>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.user || nextProps.user) {
      const pUser = prevProps.user || {};
      const nUser = nextProps.user || {};
      return (
        pUser.avatar === nUser.avatar &&
        pUser.name === nUser.name &&
        JSON.stringify(pUser.location) === JSON.stringify(nUser.location) &&
        (pUser.kyc ?? false) === (nUser.kyc ?? false) &&
        (pUser.trust_score ?? undefined) === (nUser.trust_score ?? undefined)
      );
    }

    return (
      prevProps.avatarUrl === nextProps.avatarUrl &&
      prevProps.userName === nextProps.userName &&
      prevProps.location === nextProps.location &&
      prevProps.isVerified === nextProps.isVerified &&
      prevProps.trustScore === nextProps.trustScore
    );
  },
);

ProfileHeaderSection.displayName = 'ProfileHeaderSection';

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 12,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 0,
    height: 30,
  },
  headerSpacer: {
    width: 32,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
  },
  headerButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 2,
  },
  trustRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    opacity: 0,
  },
  avatarWrapper: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: PALETTE.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  // trustBadge styles reserved for future trust badge UI
  // trustBadge: {
  //   position: 'absolute',
  //   bottom: 4,
  //   right: 4,
  //   width: 32,
  //   height: 32,
  //   borderRadius: 16,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderWidth: 3,
  //   borderColor: PALETTE.white,
  // },
  // trustBadgeGlow: {
  //   shadowColor: COLORS.primary,
  //   shadowOffset: { width: 0, height: 0 },
  //   shadowOpacity: 0.8,
  //   shadowRadius: 8,
  //   elevation: 4,
  // },
  // trustBadgeText: {
  //   ...TYPE_SCALE.label.small,
  //   color: PALETTE.white,
  //   fontSize: 11,
  //   fontWeight: '700',
  // },
  userInfo: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscriptionRow: {
    marginTop: 6,
    alignItems: 'center',
  },
  userName: {
    ...TYPE_SCALE.display.h2,
    color: PALETTE.white,
    fontSize: 20,
  },
  verifiedBadgeContainer: {
    // Neon glow on verified badge
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  bioText: {
    ...TYPE_SCALE.body.small,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    ...TYPE_SCALE.body.base,
    color: 'rgba(255,255,255,0.8)',
  },
  // statsRow reserved for future stats display
  // statsRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   gap: 12,
  //   marginTop: 24,
  //   paddingHorizontal: 20,
  // },
  statCardPressable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 90,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    ...TYPE_SCALE.mono.priceSmall,
    color: PALETTE.white,
    fontSize: 20,
  },
  statLabel: {
    ...TYPE_SCALE.body.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  editButtonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default ProfileHeaderSection;
// Named export for tests that import { ProfileHeaderSection }
export { ProfileHeaderSection };
