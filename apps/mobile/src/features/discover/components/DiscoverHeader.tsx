/**
 * DiscoverHeader Component
 *
 * Awwwards standardında Discover Header.
 * Minimalist hiyerarşi ve premium boşluk kullanımı.
 *
 * 40+ yaş: Yüksek okunabilirlik, net hiyerarşi
 * GenZ: Estetik derinlik, modern tipografi
 *
 * Part of TravelMatch "Cinematic Trust Jewelry" Design System.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { useSmartMicrocopy } from '@/hooks/useSmartMicrocopy';
import type { DiscoverHeaderProps } from './types';

// Enhanced props interface for animated header
interface AnimatedDiscoverHeaderProps {
  /** Animated scroll position */
  scrollY: SharedValue<number>;
  /** Current location text */
  location: string;
  /** Callback when location is pressed */
  onLocationPress: () => void;
  /** Callback when search is pressed */
  onSearchPress: () => void;
  /** Custom title (default: "Wishes") */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
}

/**
 * AnimatedDiscoverHeader - New iOS 26.3 style header with scroll animations
 */
export const AnimatedDiscoverHeader: React.FC<AnimatedDiscoverHeaderProps> = ({
  scrollY,
  location,
  onLocationPress,
  onSearchPress,
  title = 'Wishes',
  subtitle = 'Bugün kimi mutlu edeceksin?',
}) => {
  const insets = useSafeAreaInsets();

  // Header height animation
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [140 + insets.top, 100 + insets.top],
      Extrapolate.CLAMP,
    );
    return { height };
  });

  // Title fade animation
  const titleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [0, -20],
      Extrapolate.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  // Compact title (visible when scrolled)
  const compactTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [40, 80],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const HeaderBackground = Platform.OS === 'ios' ? BlurView : View;
  const headerBgProps =
    Platform.OS === 'ios'
      ? { intensity: 90, tint: 'light' as const }
      : { style: { backgroundColor: COLORS.surface.glassBackground } };

  return (
    <Animated.View style={[styles.animatedHeader, headerStyle]}>
      <HeaderBackground {...headerBgProps} style={styles.blur}>
        <View style={[styles.animatedContent, { paddingTop: insets.top }]}>
          {/* Title Row */}
          <Animated.View style={[styles.titleRow, titleStyle]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>

          {/* Compact Title (when scrolled) */}
          <Animated.View style={[styles.compactTitle, compactTitleStyle]}>
            <Text style={styles.compactTitleText}>{title}</Text>
          </Animated.View>

          {/* Search Row */}
          <View style={styles.searchRow}>
            {/* Location Button */}
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={COLORS.brand.primary}
              />
              <Text style={styles.locationButtonText} numberOfLines={1}>
                {location}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={22}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </HeaderBackground>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// AWWWARDS STYLE HEADER - Premium Discover Experience
// ═══════════════════════════════════════════════════════════════════

interface AwwwardsDiscoverHeaderProps {
  /** User's name for greeting */
  userName?: string;
  /** User's avatar URL */
  userAvatar?: string;
  /** Greeting text (auto-detected by time if not provided) */
  greeting?: string;
  /** Notification count (shows dot if > 0) */
  notificationCount?: number;
  /** Active filters count (shows badge if > 0) */
  activeFiltersCount?: number;
  /** Callback when notifications are pressed */
  onNotificationsPress?: () => void;
  /** Callback when filter is pressed */
  onFilterPress?: () => void;
  /** Callback when avatar is pressed */
  onAvatarPress?: () => void;
}

// Time-based greeting is handled by useSmartMicrocopy hook

/**
 * AwwwardsDiscoverHeader - Awwwards standardında premium header
 *
 * Minimalist hiyerarşi ve premium boşluk kullanımı.
 * 40+ yaş için okunabilirlik, GenZ için estetik derinlik.
 */
export const AwwwardsDiscoverHeader: React.FC<AwwwardsDiscoverHeaderProps> = ({
  userName,
  userAvatar: _userAvatar,
  greeting: _customGreeting,
  notificationCount: _notificationCount = 0,
  activeFiltersCount: _activeFiltersCount = 0,
  onNotificationsPress: _onNotificationsPress,
  onFilterPress: _onFilterPress,
  onAvatarPress: _onAvatarPress,
}) => {
  const insets = useSafeAreaInsets();

  // Smart micro-copy based on context
  const { greeting, subtext } = useSmartMicrocopy({
    userName: userName || 'Explorer',
    city: 'şehir', // TODO: Get from user location
  });

  return (
    <View style={[awwwardsStyles.container, { paddingTop: insets.top + 8 }]}>
      {/* Smart greeting */}
      <Text style={awwwardsStyles.greeting}>{greeting}</Text>
      {subtext && <Text style={awwwardsStyles.subtext}>{subtext}</Text>}
    </View>
  );
};

const awwwardsStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.bg.primary,
  },
  greeting: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontWeight: '400',
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════
// LEGACY HEADERS - Backward Compatibility
// ═══════════════════════════════════════════════════════════════════

/**
 * DiscoverHeader - Legacy header for backward compatibility
 */
export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  location,
  activeFiltersCount,
  onLocationPress,
  onFilterPress,
}) => (
  <View style={styles.header}>
    {/* Location Selector */}
    <TouchableOpacity
      style={styles.locationSelector}
      onPress={onLocationPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="map-marker"
        size={18}
        color={COLORS.brand.primary}
      />
      <Text style={styles.locationText} numberOfLines={1}>
        {location}
      </Text>
      <MaterialCommunityIcons
        name="chevron-down"
        size={18}
        color={COLORS.text.secondary}
      />
    </TouchableOpacity>

    {/* Right Controls */}
    <View style={styles.headerControls}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.controlButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="filter-variant"
          size={22}
          color={COLORS.text.primary}
        />
        {(activeFiltersCount ?? 0) > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Legacy header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 6,
    marginRight: 2,
    flexShrink: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  // Animated header styles
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  animatedContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  titleRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  compactTitle: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    bottom: 60,
    justifyContent: 'flex-end',
  },
  compactTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '70%',
  },
  locationButtonText: {
    marginLeft: 8,
    marginRight: 4,
    fontSize: 15,
    color: COLORS.text.primary,
    fontWeight: '500',
    flexShrink: 1,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
