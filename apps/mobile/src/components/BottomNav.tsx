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

import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import type { RootStackParamList } from '../navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  label: string;
  icon: string;
  iconActive: string;
  screen: keyof RootStackParamList;
}

// ============================================
// TAB CONFIGURATION
// ============================================
const TABS: TabConfig[] = [
  {
    name: 'Discover',
    label: 'Dilekler',
    icon: 'gift-outline',
    iconActive: 'gift',
    screen: 'Discover',
  },
  {
    name: 'Requests',
    label: 'Hediyeler',
    icon: 'heart-outline',
    iconActive: 'heart',
    screen: 'Requests',
  },
  {
    name: 'Messages',
    label: 'Mesajlar',
    icon: 'chat-outline',
    iconActive: 'chat',
    screen: 'Messages',
  },
  {
    name: 'Profile',
    label: 'Profil',
    icon: 'account-outline',
    iconActive: 'account',
    screen: 'Profile',
  },
];

// ============================================
// TAB ITEM COMPONENT
// ============================================
interface TabItemProps {
  tab: TabConfig;
  isActive: boolean;
  badge?: number;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = memo(({ tab, isActive, badge, onPress }) => {
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
      accessibilityLabel={`${tab.label} tab`}
    >
      <Reanimated.View style={[styles.navItemContent, animatedStyle]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={isActive ? tab.iconActive : tab.icon}
            size={24}
            color={isActive ? COLORS.interactive.primary : COLORS.text.muted}
          />
          {badge && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badge > 9 ? '9+' : badge}
              </Text>
            </View>
          )}
        </View>
        <Text style={isActive ? styles.navTextActive : styles.navText}>
          {tab.label}
        </Text>
        {isActive && <View style={styles.activeIndicator} />}
      </Reanimated.View>
    </Pressable>
  );
});

// ============================================
// CREATE BUTTON COMPONENT
// ============================================
interface CreateButtonProps {
  onPress: () => void;
}

const CreateButton: React.FC<CreateButtonProps> = memo(({ onPress }) => {
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
      accessibilityLabel="Yeni dilek oluştur"
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
});

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

  const handleTabPress = useCallback(
    (screen: keyof RootStackParamList) => {
      navigation.navigate(screen as never);
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateMoment' as never);
  }, [navigation]);

  const getBadge = useCallback((tabName: TabName): number | undefined => {
    switch (tabName) {
      case 'Requests':
        return requestsBadge;
      case 'Messages':
        return messagesBadge;
      default:
        return undefined;
    }
  }, [requestsBadge, messagesBadge]);

  // Split tabs for left and right of create button
  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={80}
          tint="light"
          style={styles.blurContainer}
        >
          <View style={styles.navContent}>
            {leftTabs.map((tab) => (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={activeTab === tab.name}
                badge={getBadge(tab.name)}
                onPress={() => handleTabPress(tab.screen)}
              />
            ))}

            <CreateButton onPress={handleCreatePress} />

            {rightTabs.map((tab) => (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={activeTab === tab.name}
                badge={getBadge(tab.name)}
                onPress={() => handleTabPress(tab.screen)}
              />
            ))}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, styles.androidBackground]}>
          <View style={styles.navContent}>
            {leftTabs.map((tab) => (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={activeTab === tab.name}
                badge={getBadge(tab.name)}
                onPress={() => handleTabPress(tab.screen)}
              />
            ))}

            <CreateButton onPress={handleCreatePress} />

            {rightTabs.map((tab) => (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={activeTab === tab.name}
                badge={getBadge(tab.name)}
                onPress={() => handleTabPress(tab.screen)}
              />
            ))}
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
    color: COLORS.interactive.primary,
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
    backgroundColor: COLORS.interactive.primary,
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
    shadowColor: PALETTE.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
});

export default BottomNav;
