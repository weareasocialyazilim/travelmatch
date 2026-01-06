import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/constants/colors';

// Neon colors for gift badge
const NEON = {
  violet: '#A855F7',
  violetGlow: 'rgba(168, 85, 247, 0.6)',
};

const { width } = Dimensions.get('window');
const DOCK_HORIZONTAL_PADDING = 20;
const DOCK_HEIGHT = 70;
const DOCK_BORDER_RADIUS = 35;

// Spring animation config for buttery smooth feel
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Get pending gift offers count from app state
 * TODO: Replace with actual store/context in production
 * This shows on Profile tab when user has unread gift offers
 */
const getPendingGiftCount = (): number => {
  // In production, this would read from:
  // - Zustand store: useGiftStore.getState().pendingCount
  // - MMKV cache: storage.getNumber('pendingGiftCount')
  // - Or a context provider
  return 0; // Default to 0, will be populated by real data
};

/**
 * FloatingDock - Liquid Glass Navigation Bar
 *
 * Awwwards-quality floating navigation dock with:
 * - Glassmorphism blur effect
 * - Neon glow on active state
 * - Silky smooth spring animations
 * - Elevated center action button
 * - Gift badge with neon violet pulse on Profile tab
 */
export const FloatingDock: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 20);

  // Get icon for each tab
  const getTabIcon = useCallback(
    (
      routeName: string,
      focused: boolean,
    ): { name: string; type: 'ionicon' | 'material' } => {
      switch (routeName) {
        case 'Home':
          return {
            name: focused ? 'compass' : 'compass-outline',
            type: 'material',
          };
        case 'Search':
          return {
            name: focused ? 'map' : 'map-outline',
            type: 'ionicon',
          };
        case 'Create':
          return {
            name: 'add',
            type: 'ionicon',
          };
        case 'Inbox':
          return {
            name: focused ? 'chatbubble' : 'chatbubble-outline',
            type: 'ionicon',
          };
        case 'Profile':
          return {
            name: focused ? 'account-circle' : 'account-circle-outline',
            type: 'material',
          };
        default:
          return {
            name: 'ellipse',
            type: 'ionicon',
          };
      }
    },
    [],
  );

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]}>
      {/* Neon Glow Layer */}
      <View style={styles.glowLayer} />

      {/* Main Dock Container */}
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <View style={styles.container}>
          {state.routes.map((route, index) => {
            const { options: _options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = route.name === 'Create';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            if (isCenter) {
              return (
                <CenterButton
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            }

            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                getTabIcon={getTabIcon}
                showBadge={route.name === 'Inbox'}
                giftCount={route.name === 'Profile' ? getPendingGiftCount() : 0}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

/**
 * Individual Tab Item with animated states
 */
interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  getTabIcon: (
    name: string,
    focused: boolean,
  ) => { name: string; type: 'ionicon' | 'material' };
  showBadge?: boolean;
  giftCount?: number; // Pending gift offers count
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
  getTabIcon,
  showBadge,
  giftCount = 0,
}) => {
  const scale = useSharedValue(1);
  const giftPulse = useSharedValue(1);
  const { name: iconName, type: iconType } = getTabIcon(routeName, isFocused);

  // Pulse animation for gift badge
  useEffect(() => {
    if (giftCount > 0) {
      giftPulse.value = withRepeat(
        withSequence(
          withSpring(1.15, { damping: 8 }),
          withSpring(1, { damping: 8 }),
        ),
        -1,
        true,
      );
    } else {
      giftPulse.value = 1;
    }
  }, [giftCount, giftPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const giftBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftPulse.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    // Haptic feedback on tab transition
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconColor = isFocused ? COLORS.brand.primary : COLORS.text.muted;

  // Get accessible label for tab
  const getAccessibleLabel = (name: string): string => {
    const labels: Record<string, string> = {
      Home: 'Ana sayfa sekmesi',
      Search: 'Keşfet sekmesi',
      Create: 'Yeni an oluştur',
      Inbox: 'Mesajlar sekmesi',
      Profile: 'Profil sekmesi',
    };
    return labels[name] || `${name} sekmesi`;
  };

  return (
    <AnimatedTouchable
      accessibilityRole="tab"
      accessibilityLabel={getAccessibleLabel(routeName)}
      accessibilityState={{ selected: isFocused }}
      accessibilityHint={
        isFocused ? undefined : `${getAccessibleLabel(routeName)}ne git`
      }
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tab, animatedStyle]}
      activeOpacity={0.8}
    >
      <View style={styles.tabContent}>
        {iconType === 'ionicon' ? (
          <Ionicons name={iconName as any} size={26} color={iconColor} />
        ) : (
          <MaterialCommunityIcons
            name={iconName as any}
            size={28}
            color={iconColor}
          />
        )}

        {/* Active Indicator Dot */}
        {isFocused && <Animated.View style={styles.activeDot} />}

        {/* Notification Badge */}
        {showBadge && (
          <View style={styles.badge}>
            <View style={styles.badgeInner} />
          </View>
        )}

        {/* Gift Badge - Neon Violet with count */}
        {giftCount > 0 && (
          <Animated.View style={[styles.giftBadge, giftBadgeStyle]}>
            <Text style={styles.giftBadgeText}>
              {giftCount > 9 ? '9+' : giftCount}
            </Text>
          </Animated.View>
        )}
      </View>
    </AnimatedTouchable>
  );
};

/**
 * Center Action Button - Elevated with glow effect
 */
interface CenterButtonProps {
  onPress: () => void;
  onLongPress: () => void;
}

const CenterButton: React.FC<CenterButtonProps> = ({
  onPress,
  onLongPress,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIG);
    glowOpacity.value = withTiming(0.7, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
    glowOpacity.value = withTiming(0.4, { duration: 150 });
  };

  const handlePress = () => {
    // Medium haptic for center action (create moment)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.centerButtonWrapper}>
      {/* Glow Effect */}
      <Animated.View style={[styles.centerButtonGlow, animatedGlowStyle]} />

      {/* Button */}
      <AnimatedTouchable
        accessibilityRole="button"
        accessibilityLabel="Yeni an oluştur"
        accessibilityHint="Yeni bir deneyim paylaşmak için dokunun"
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.centerButton, animatedButtonStyle]}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color={COLORS.text.onLight} />
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: width,
    alignItems: 'center',
    paddingHorizontal: DOCK_HORIZONTAL_PADDING,
    zIndex: 100,
  },
  glowLayer: {
    position: 'absolute',
    top: 10,
    left: DOCK_HORIZONTAL_PADDING + 20,
    right: DOCK_HORIZONTAL_PADDING + 20,
    height: DOCK_HEIGHT - 10,
    borderRadius: DOCK_BORDER_RADIUS,
    backgroundColor: COLORS.brand.primary,
    opacity: 0.08,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  blurContainer: {
    width: '100%',
    height: DOCK_HEIGHT,
    borderRadius: DOCK_BORDER_RADIUS,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 32, 0.75)',
    borderRadius: DOCK_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.brand.primary,
    marginTop: 6,
    // Glow effect for active dot
    ...Platform.select({
      ios: {
        shadowColor: COLORS.brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(30, 30, 32, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.feedback.error,
    // Neon glow for badge
    ...Platform.select({
      ios: {
        shadowColor: COLORS.feedback.error,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  // Gift Badge - Neon Violet with pulse animation
  giftBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: NEON.violet,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 32, 0.9)',
    // Neon glow for gift badge
    ...Platform.select({
      ios: {
        shadowColor: NEON.violet,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  giftBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
  },
  centerButtonGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brand.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.background.primary,
    // Subtle inner shadow effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default FloatingDock;
