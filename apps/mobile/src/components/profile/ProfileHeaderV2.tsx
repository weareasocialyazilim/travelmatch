/**
 * TravelMatch Awwwards Design System 2026 - Profile Header V2
 *
 * Modern profile header with:
 * - Large avatar with animated trust ring
 * - Glassmorphism stat cards
 * - Floating edit button
 * - Gradient background
 *
 * Designed for Awwwards Best UI nomination
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import {
  COLORS_V2,
  GRADIENTS_V2,
  PALETTE,
  getTrustRingColors,
  getTrustLevel,
} from '../../constants/colors-v2';
import { TYPE_SCALE } from '../../constants/typography-v2';
import { SPRINGS } from '../../hooks/useAnimationsV2';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
export interface ProfileUser {
  id: string;
  name: string;
  avatar: string;
  location?: string;
  isVerified?: boolean;
  trustScore: number;
  momentsCount: number;
  exchangesCount: number;
  responseRate: number;
}

export interface ProfileHeaderV2Props {
  user: ProfileUser;
  onEditPress: () => void;
  onTrustGardenPress: () => void;
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

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const colors = getTrustRingColors(score);
  const trustLevel = getTrustLevel(score);

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
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.trustRingContainer, { width: size, height: size }]}>
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
      <View style={[styles.trustBadge, { backgroundColor: colors[0] }]}>
        <Text style={styles.trustBadgeText}>{score}</Text>
      </View>
    </View>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  value: string | number;
  label: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, SPRINGS.gentle);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
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
};

// ============================================
// MAIN COMPONENT
// ============================================
export const ProfileHeaderV2: React.FC<ProfileHeaderV2Props> = ({
  user,
  onEditPress,
  onTrustGardenPress,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();
  const editButtonScale = useSharedValue(1);

  const handleEditPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditPress();
  }, [onEditPress]);

  const handleTrustPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTrustGardenPress();
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={GRADIENTS_V2.gift}
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

      {/* Avatar Section */}
      <Pressable onPress={handleTrustPress} style={styles.avatarSection}>
        <AnimatedTrustRing score={user.trustScore}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </AnimatedTrustRing>
      </Pressable>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.isVerified && (
            <MaterialCommunityIcons
              name="check-decagram"
              size={22}
              color={COLORS_V2.trust.primary}
            />
          )}
        </View>

        {user.location && (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.location}>{user.location}</Text>
          </View>
        )}
      </View>

      {/* Stats Row - Glass Cards */}
      <View style={styles.statsRow}>
        <StatCard value={user.momentsCount} label="Dilekler" delay={0} />
        <StatCard value={user.exchangesCount} label="Hediyeler" delay={100} />
        <StatCard value={`${user.responseRate}%`} label="Yanıt" delay={200} />
      </View>

      {/* Edit Button - Floating */}
      <Reanimated.View style={[styles.editButtonContainer, editButtonAnimatedStyle]}>
        <Pressable
          onPress={handleEditPress}
          onPressIn={handleEditPressIn}
          onPressOut={handleEditPressOut}
          style={styles.editButton}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 30 : 80}
            tint="light"
            style={styles.editButtonBlur}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={PALETTE.white}
            />
          </BlurView>
        </Pressable>
      </Reanimated.View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 24,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    height: 44,
  },
  headerSpacer: {
    width: 36,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginTop: 8,
  },
  trustRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
    borderColor: PALETTE.white,
  },
  trustBadgeText: {
    ...TYPE_SCALE.label.small,
    color: PALETTE.white,
    fontSize: 11,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    ...TYPE_SCALE.display.h2,
    color: PALETTE.white,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
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
    top: 80,
    right: 20,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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

export default ProfileHeaderV2;
