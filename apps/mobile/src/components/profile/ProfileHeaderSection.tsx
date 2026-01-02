/**
 * TravelMatch Awwwards Design System 2026 - Profile Header
 *
 * Premium profile header with Twilight Zinc dark theme:
 * - Large avatar with animated neon trust ring
 * - Glassmorphism stat cards
 * - Floating edit button with glow
 * - Dark gradient background with neon accents
 *
 * Designed for Awwwards Best UI nomination
 */

import React, { useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from 'react-native';
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
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { useTranslation } from '../../hooks/useTranslation';

// Twilight Zinc + Neon Energy theme colors
const HEADER_COLORS = {
  background: {
    primary: '#121214',
    secondary: '#1E1E20',
    tertiary: '#27272A',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
  },
  neon: {
    lime: '#DFFF00',
    violet: '#A855F7',
    cyan: '#06B6D4',
    rose: '#F43F5E',
  },
  glass: {
    background: 'rgba(30, 30, 32, 0.85)',
    backgroundLight: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
  },
  trust: {
    platinum: '#E5E4E2',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
};

// Spring animation configs
const SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
  gentle: { damping: 20, stiffness: 120, mass: 0.5 },
};

// Get trust ring colors based on score
const getTrustRingColors = (score: number): [string, string] => {
  if (score >= 90) return [HEADER_COLORS.trust.platinum, HEADER_COLORS.neon.cyan];
  if (score >= 70) return [HEADER_COLORS.trust.gold, HEADER_COLORS.neon.lime];
  if (score >= 50) return [HEADER_COLORS.trust.silver, HEADER_COLORS.neon.violet];
  return [HEADER_COLORS.trust.bronze, HEADER_COLORS.neon.rose];
};

// ============================================
// TYPES
// ============================================
interface UserShape {
  id?: string;
  name?: string;
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
  location?: string | { city?: string; country?: string };
  isVerified?: boolean;
  trustScore?: number;
  momentsCount?: number;
  exchangesCount?: number;
  responseRate?: number;
  onEditPress?: () => void;
  onTrustGardenPress?: () => void;
  onSettingsPress?: () => void;
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
  size = 120,
  strokeWidth = 4,
  children,
}) => {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const glowPulse = useSharedValue(0);

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
      withSequence(
        withTiming(360, { duration: 20000, easing: Easing.linear })
      ),
      -1,
      false
    );

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [score, progress, rotation, glowPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.1]) }],
  }));

  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.trustRingContainer, { width: size, height: size }]}>
      {/* Neon Glow Effect */}
      <Reanimated.View
        style={[
          styles.ringGlow,
          { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 },
          glowStyle,
        ]}
      />

      {/* Background Circle */}
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={HEADER_COLORS.glass.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
      </Svg>

      {/* Animated Progress Ring */}
      <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors[0]} />
              <Stop offset="100%" stopColor={colors[1]} />
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
      <View style={[styles.avatarWrapper, { width: size - 16, height: size - 16 }]}>
        {children}
      </View>

      {/* Trust Badge */}
      <View style={[styles.trustBadge, { backgroundColor: colors[1] }]}>
        <Text style={styles.trustBadgeText}>{score}</Text>
      </View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = memo(
  ({
    user,
    avatarUrl,
    userName,
    location,
    isVerified,
    trustScore,
    onEditPress,
    onTrustGardenPress,
    onSettingsPress,
  }) => {
    const editButtonScale = useSharedValue(1);
    const { t } = useTranslation();

    // Normalize values to support both `user` shape and individual props
    const resolvedAvatar = avatarUrl || user?.avatar || '';
    const resolvedName = userName || user?.name || '';
    const resolvedLocation =
      typeof location === 'string'
        ? location
        : (location as { city?: string })?.city ||
          (user && typeof user.location === 'string'
            ? user.location
            : (user?.location as { city?: string })?.city) ||
          '';
    const resolvedVerified =
      typeof isVerified === 'boolean' ? isVerified : !!user?.kyc || !!user?.isVerified;
    const resolvedTrust =
      typeof trustScore === 'number'
        ? trustScore
        : (user?.trust_score ?? 0);

    const handleEditPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEditPress?.();
    }, [onEditPress]);

    const handleTrustPress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTrustGardenPress?.();
    }, [onTrustGardenPress]);

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
        {/* Dark Gradient Background with Neon Hints */}
        <LinearGradient
          colors={[
            HEADER_COLORS.background.primary,
            HEADER_COLORS.background.secondary,
            `${HEADER_COLORS.neon.lime}08`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Subtle neon accent glow */}
        <View style={styles.accentGlow} />

        {/* Avatar Section */}
        <Pressable onPress={handleTrustPress} style={styles.avatarSection}>
          <AnimatedTrustRing score={resolvedTrust} size={130}>
            <Image
              testID="profile-avatar"
              source={{ uri: resolvedAvatar }}
              style={styles.avatar}
            />
          </AnimatedTrustRing>
        </Pressable>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{resolvedName}</Text>
            {resolvedVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={HEADER_COLORS.neon.cyan}
                />
              </View>
            )}
          </View>

          {resolvedLocation && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={HEADER_COLORS.text.secondary}
              />
              <Text style={styles.location}>{resolvedLocation}</Text>
            </View>
          )}

          {/* Bio placeholder for premium feel */}
          <Text style={styles.bio}>
            Hayatı keşfetmeye hazır gezgin
          </Text>
        </View>

        {/* Edit Button - Floating with Neon Glow */}
        {onEditPress && (
          <Reanimated.View style={[styles.editButtonContainer, editButtonAnimatedStyle]}>
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
                tint="dark"
                style={styles.editButtonBlur}
              >
                <Ionicons
                  name="pencil"
                  size={18}
                  color={HEADER_COLORS.neon.lime}
                />
              </BlurView>
            </Pressable>
          </Reanimated.View>
        )}
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
    paddingBottom: 24,
    paddingTop: 12,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  accentGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: HEADER_COLORS.neon.lime,
    opacity: 0.03,
    transform: [{ translateX: 50 }, { translateY: -50 }],
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  trustRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringGlow: {
    position: 'absolute',
    backgroundColor: HEADER_COLORS.neon.lime,
    ...Platform.select({
      ios: {
        shadowColor: HEADER_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {},
    }),
  },
  avatarWrapper: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: HEADER_COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: HEADER_COLORS.background.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  trustBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: HEADER_COLORS.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: HEADER_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: HEADER_COLORS.background.primary,
    letterSpacing: -0.3,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: HEADER_COLORS.text.primary,
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    ...Platform.select({
      ios: {
        shadowColor: HEADER_COLORS.neon.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {},
    }),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontSize: 14,
    color: HEADER_COLORS.text.secondary,
  },
  bio: {
    fontSize: 14,
    color: HEADER_COLORS.text.tertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  editButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: HEADER_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  editButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEADER_COLORS.glass.background,
    borderWidth: 1,
    borderColor: HEADER_COLORS.glass.borderActive,
    borderRadius: 22,
  },
});

export default ProfileHeaderSection;
// Named export for tests that import { ProfileHeaderSection }
export { ProfileHeaderSection };
