/**
 * TravelMatch Awwwards Design System 2026 - Bottom Navigation
 *
 * Premium navigation with:
 * - Glassmorphism background
 * - Animated active indicator
 * - Floating create button with gradient
 * - Spring animations on tap
 *
 * Designed for Awwwards Best UI nomination
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, GRADIENTS, PALETTE } from '../constants/colors';
import { TYPE_SCALE } from '../theme/typography';
import { SPRINGS } from '../hooks/useAnimations';
import { useTranslation } from '../hooks/useTranslation';
import type { RootStackParamList } from '../navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

// ============================================
// TYPES
// ============================================
interface BottomNavProps {
  activeTab: 'Discover' | 'Requests' | 'Create' | 'Messages' | 'Profile';
  requestsBadge?: number;
  messagesBadge?: number;
}

type TabName = 'Discover' | 'Requests' | 'Messages' | 'Profile';

interface TabConfig {
  name: TabName;
  labelKey: string; // i18n translation key
  accessibilityKey: string; // i18n translation key for accessibility
  icon: IconName;
  iconActive: IconName;
  screen: keyof RootStackParamList;
}

// ============================================
// TAB CONFIGURATION (with translation keys)
// ============================================
const TAB_CONFIGS: Omit<TabConfig, 'label'>[] = [
  {
    name: 'Discover',
    labelKey: 'navigation.discover',
    accessibilityKey: 'navigation.discoverTab',
    icon: 'gift-outline',
    iconActive: 'gift',
    screen: 'Discover',
  },
  {
    name: 'Requests',
    labelKey: 'navigation.requests',
    accessibilityKey: 'navigation.requestsTab',
    icon: 'heart-outline',
    iconActive: 'heart',
    screen: 'Requests',
  },
  {
    name: 'Messages',
    labelKey: 'navigation.messages',
    accessibilityKey: 'navigation.messagesTab',
    icon: 'chat-outline',
    iconActive: 'chat',
    screen: 'Messages',
  },
  {
    name: 'Profile',
    labelKey: 'navigation.profile',
    accessibilityKey: 'navigation.profileTab',
    icon: 'account-outline',
    iconActive: 'account',
    screen: 'Profile',
  },
];

// ============================================
// TAB ITEM COMPONENT
// ============================================
interface TabItemProps {
  tab: Omit<TabConfig, 'label'>;
  label: string;
  accessibilityLabel: string;
  isActive: boolean;
  badge?: number;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = memo(
  ({ tab, label, accessibilityLabel, isActive, badge, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.9, SPRINGS.snappy);
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, SPRINGS.bouncy);
    }, []);

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }, [onPress]);

    return (
      <Pressable
        testID={`nav-${tab.name.toLowerCase()}-tab`}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.navItem}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={accessibilityLabel}
      >
        <Reanimated.View style={[styles.navItemContent, animatedStyle]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={isActive ? COLORS.brand.primary : COLORS.text.muted}
            />
            {badge && badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {badge > 9 ? '9+' : String(badge)}
                </Text>
              </View>
            )}
          </View>
          <Text style={isActive ? styles.navTextActive : styles.navText}>
            {label}
          </Text>
          {isActive && <View style={styles.activeIndicator} />}
        </Reanimated.View>
      </Pressable>
    );
  },
);

// ============================================
// CREATE BUTTON COMPONENT
// ============================================
interface CreateButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
}

const CreateButton: React.FC<CreateButtonProps> = memo(
  ({ onPress, accessibilityLabel }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
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
      <Pressable
        testID="nav-create-tab"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.createButtonWrapper}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Reanimated.View style={animatedStyle}>
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createButton}
          >
            <MaterialCommunityIcons
              name="plus"
              size={28}
              color={PALETTE.white}
            />
          </LinearGradient>
        </Reanimated.View>
      </Pressable>
    );
  },
);

// ============================================
// MAIN COMPONENT
// ============================================
const BottomNav: React.FC<BottomNavProps> = memo(function BottomNav({
  activeTab,
  requestsBadge = 0,
  messagesBadge = 0,
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleTabPress = useCallback(
    (screen: keyof RootStackParamList) => {
      navigation.navigate(screen as never);
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateMoment' as never);
  }, [navigation]);

  const getBadge = useCallback(
    (tabName: TabName): number | undefined => {
      switch (tabName) {
        case 'Requests':
          return requestsBadge;
        case 'Messages':
          return messagesBadge;
        default:
          return undefined;
      }
    },
    [requestsBadge, messagesBadge],
  );

  // Split tabs for left and right of create button
  const leftTabs = TAB_CONFIGS.slice(0, 2);
  const rightTabs = TAB_CONFIGS.slice(2);

  // Get translated create button label
  const createLabel = t('navigation.createMoment');

  // Render tab with translations
  const renderTab = (tab: (typeof TAB_CONFIGS)[0]) => (
    <TabItem
      key={tab.name}
      tab={tab}
      label={t(tab.labelKey)}
      accessibilityLabel={t(tab.accessibilityKey)}
      isActive={activeTab === tab.name}
      badge={getBadge(tab.name)}
      onPress={() => handleTabPress(tab.screen)}
    />
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <View style={styles.navContent}>
            {leftTabs.map(renderTab)}
            <CreateButton
              onPress={handleCreatePress}
              accessibilityLabel={createLabel}
            />
            {rightTabs.map(renderTab)}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, styles.androidBackground]}>
          <View style={styles.navContent}>
            {leftTabs.map(renderTab)}
            <CreateButton
              onPress={handleCreatePress}
              accessibilityLabel={createLabel}
            />
            {rightTabs.map(renderTab)}
          </View>
        </View>
      )}
    </View>
  );
});

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    overflow: 'hidden',
  },
  androidBackground: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 56,
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...TYPE_SCALE.body.caption,
    color: PALETTE.white,
    fontSize: 10,
    fontWeight: '700',
  },
  navText: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    fontSize: 10,
    marginTop: 2,
  },
  navTextActive: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.brand.primary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.brand.primary,
  },
  createButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B', // amber[500] - primary color
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
});

export default BottomNav;
