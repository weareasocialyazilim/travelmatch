/**
 * TravelMatch Awwwards Design System 2026 - Bottom Navigation V2
 *
 * Floating glass tab bar with:
 * - Glassmorphism effect
 * - Animated morphing icons
 * - Badge indicators
 * - Elevated create button with pulse
 * - Haptic feedback
 *
 * Designed for Awwwards-level visual polish
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS_V2, GRADIENTS_V2, SHADOWS_V2, PALETTE } from '../constants/colors-v2';
import { TYPE_SCALE } from '../constants/typography-v2';
import { SPRINGS } from '../hooks/useAnimationsV2';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
export type TabName = 'Discover' | 'Requests' | 'Create' | 'Messages' | 'Profile';

export interface BottomNavV2Props {
  activeTab: TabName;
  requestsBadge?: number;
  messagesBadge?: number;
  onTabPress: (tab: TabName) => void;
}

interface TabItemProps {
  icon: string;
  iconActive: string;
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}

// ============================================
// TAB ITEM COMPONENT
// ============================================
const TabItem: React.FC<TabItemProps> = ({
  icon,
  iconActive,
  label,
  active,
  badge = 0,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, SPRINGS.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Quick bounce on the icon
    iconScale.value = withSequence(
      withSpring(0.8, SPRINGS.snappy),
      withSpring(1.1, SPRINGS.bouncy),
      withSpring(1, SPRINGS.gentle)
    );
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Reanimated.View style={[styles.tabIconContainer, animatedStyle]}>
        <Reanimated.View style={iconAnimatedStyle}>
          <MaterialCommunityIcons
            name={active ? iconActive as keyof typeof MaterialCommunityIcons.glyphMap : icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={active ? COLORS_V2.interactive.primary : COLORS_V2.text.muted}
          />
        </Reanimated.View>

        {/* Badge */}
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </Reanimated.View>

      <Text
        style={[
          styles.tabLabel,
          active && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// ============================================
// CREATE BUTTON COMPONENT
// ============================================
interface CreateButtonProps {
  onPress: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Subtle pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, SPRINGS.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <Reanimated.View style={[styles.createButtonWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.createButton, SHADOWS_V2.buttonPrimary]}
        accessibilityRole="button"
        accessibilityLabel="Create new wish"
      >
        <LinearGradient
          colors={GRADIENTS_V2.gift}
          style={styles.createButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={28}
            color={PALETTE.white}
          />
        </LinearGradient>
      </Pressable>
    </Reanimated.View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const BottomNavV2: React.FC<BottomNavV2Props> = ({
  activeTab,
  requestsBadge = 0,
  messagesBadge = 0,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  // Tab configurations
  const tabs = [
    {
      name: 'Discover' as TabName,
      icon: 'gift-outline',
      iconActive: 'gift',
      label: 'Dilekler',
    },
    {
      name: 'Requests' as TabName,
      icon: 'heart-outline',
      iconActive: 'heart',
      label: 'Hediyeler',
      badge: requestsBadge,
    },
    {
      name: 'Create' as TabName, // This is special - rendered as center button
      icon: 'plus',
      iconActive: 'plus',
      label: '',
    },
    {
      name: 'Messages' as TabName,
      icon: 'chat-outline',
      iconActive: 'chat',
      label: 'Sohbet',
      badge: messagesBadge,
    },
    {
      name: 'Profile' as TabName,
      icon: 'account-outline',
      iconActive: 'account',
      label: 'Profil',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="light"
        style={styles.tabBar}
      >
        <View style={styles.tabBarInner}>
          {tabs.map((tab, index) => {
            if (tab.name === 'Create') {
              return (
                <CreateButton
                  key={tab.name}
                  onPress={() => onTabPress('Create')}
                />
              );
            }

            return (
              <TabItem
                key={tab.name}
                icon={tab.icon}
                iconActive={tab.iconActive}
                label={tab.label}
                active={activeTab === tab.name}
                badge={tab.badge}
                onPress={() => onTabPress(tab.name)}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  tabBar: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 252, 247, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabLabel: {
    ...TYPE_SCALE.body.caption,
    color: COLORS_V2.text.muted,
  },
  tabLabelActive: {
    color: COLORS_V2.interactive.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS_V2.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    color: PALETTE.white,
    fontWeight: '700',
  },
  createButtonWrapper: {
    marginTop: -24, // Elevate above the bar
    marginHorizontal: 8,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  createButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================
// COMPACT VARIANT (for smaller screens)
// ============================================
export interface BottomNavCompactV2Props extends BottomNavV2Props {
  showLabels?: boolean;
}

export const BottomNavCompactV2: React.FC<BottomNavCompactV2Props> = ({
  showLabels = false,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Discover' as TabName, icon: 'gift-outline', iconActive: 'gift' },
    { name: 'Requests' as TabName, icon: 'heart-outline', iconActive: 'heart', badge: props.requestsBadge },
    { name: 'Create' as TabName, icon: 'plus', iconActive: 'plus' },
    { name: 'Messages' as TabName, icon: 'chat-outline', iconActive: 'chat', badge: props.messagesBadge },
    { name: 'Profile' as TabName, icon: 'account-outline', iconActive: 'account' },
  ];

  return (
    <View
      style={[
        stylesCompact.container,
        { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12 },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="light"
        style={stylesCompact.tabBar}
      >
        <View style={stylesCompact.tabBarInner}>
          {tabs.map((tab) => {
            const isActive = props.activeTab === tab.name;

            if (tab.name === 'Create') {
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => props.onTabPress('Create')}
                  style={stylesCompact.createButton}
                >
                  <LinearGradient
                    colors={GRADIENTS_V2.gift}
                    style={stylesCompact.createButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={PALETTE.white}
                    />
                  </LinearGradient>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={tab.name}
                onPress={() => props.onTabPress(tab.name)}
                style={stylesCompact.tabItem}
              >
                <View style={stylesCompact.tabIconContainer}>
                  <MaterialCommunityIcons
                    name={isActive ? tab.iconActive as keyof typeof MaterialCommunityIcons.glyphMap : tab.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={22}
                    color={isActive ? COLORS_V2.interactive.primary : COLORS_V2.text.muted}
                  />
                  {tab.badge && tab.badge > 0 && (
                    <View style={stylesCompact.badge}>
                      <Text style={stylesCompact.badgeText}>
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const stylesCompact = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
  },
  tabBar: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 252, 247, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    padding: 8,
  },
  tabIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS_V2.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    color: PALETTE.white,
    fontWeight: '700',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: -16,
    ...SHADOWS_V2.buttonPrimary,
  },
  createButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNavV2;
