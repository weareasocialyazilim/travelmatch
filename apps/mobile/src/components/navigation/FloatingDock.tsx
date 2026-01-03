import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/theme/colors';

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
 * FloatingDock - Liquid Glass Navigation Bar
 *
 * Awwwards-quality floating navigation dock with:
 * - Glassmorphism blur effect
 * - Neon glow on active state
 * - Silky smooth spring animations
 * - Elevated center action button
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
    (routeName: string, focused: boolean): { name: string; type: 'ionicon' | 'material' } => {
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
    []
  );

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]}>
      {/* Neon Glow Layer */}
      <View style={styles.glowLayer} />

      {/* Main Dock Container */}
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <View style={styles.container}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
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
  getTabIcon: (name: string, focused: boolean) => { name: string; type: 'ionicon' | 'material' };
  showBadge?: boolean;
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
  getTabIcon,
  showBadge,
}) => {
  const scale = useSharedValue(1);
  const { name: iconName, type: iconType } = getTabIcon(routeName, isFocused);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const iconColor = isFocused
    ? COLORS.brand.primary
    : COLORS.text.muted;

  return (
    <AnimatedTouchable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
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
          <MaterialCommunityIcons name={iconName as any} size={28} color={iconColor} />
        )}

        {/* Active Indicator Dot */}
        {isFocused && (
          <Animated.View style={styles.activeDot} />
        )}

        {/* Notification Badge */}
        {showBadge && (
          <View style={styles.badge}>
            <View style={styles.badgeInner} />
          </View>
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

const CenterButton: React.FC<CenterButtonProps> = ({ onPress, onLongPress }) => {
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

  return (
    <View style={styles.centerButtonWrapper}>
      {/* Glow Effect */}
      <Animated.View style={[styles.centerButtonGlow, animatedGlowStyle]} />

      {/* Button */}
      <AnimatedTouchable
        accessibilityRole="button"
        accessibilityLabel="Create new moment"
        onPress={onPress}
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
