/**
 * FloatingDock - TravelMatch: The Rebirth
 *
 * A premium floating navigation bar with:
 * - Glassmorphism background
 * - Animated active states
 * - Special "Create" button that floats above the dock
 * - TikTok-inspired design
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width } = Dimensions.get('window');

// Tab configuration
interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  isSpecial?: boolean;
  screen: keyof RootStackParamList;
}

const TABS: TabConfig[] = [
  {
    name: 'Discover',
    icon: 'compass-outline',
    activeIcon: 'compass',
    screen: 'Discover',
  },
  {
    name: 'Search',
    icon: 'search-outline',
    activeIcon: 'search',
    screen: 'Discover', // TODO: Change to Search screen when available
  },
  {
    name: 'Create',
    icon: 'add',
    activeIcon: 'add',
    isSpecial: true,
    screen: 'CreateMoment',
  },
  {
    name: 'Inbox',
    icon: 'chatbubble-outline',
    activeIcon: 'chatbubble',
    screen: 'Messages',
  },
  {
    name: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
    screen: 'Profile',
  },
];

// Spring animation config
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

// Animated Tab Button
interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}

const TabButton = memo(({ tab, isActive, onPress }: TabButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.85, SPRING_CONFIG);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${tab.name} tab`}
    >
      <Animated.View style={[styles.tabButtonInner, animatedStyle]}>
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={24}
          color={isActive ? COLORS.brand.primary : COLORS.text.secondary}
        />
        {isActive && <View style={styles.activeDot} />}
      </Animated.View>
    </TouchableOpacity>
  );
});

// Special Create Button (The Drop)
interface CreateButtonProps {
  onPress: () => void;
}

const CreateButton = memo(({ onPress }: CreateButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, SPRING_CONFIG);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.createButtonWrapper}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel="Create new moment"
    >
      <Animated.View style={[styles.specialButton, animatedStyle]}>
        <MaterialCommunityIcons name="plus" size={32} color="black" />
      </Animated.View>
    </TouchableOpacity>
  );
});

// Main FloatingDock Component
export const FloatingDock = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  // Determine active tab from current route
  const activeTab = route.name || 'Discover';

  const handleTabPress = useCallback(
    (screen: keyof RootStackParamList) => {
      // Type-safe navigation for screens without required params
      (navigation.navigate as (screen: string) => void)(screen);
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('CreateMoment');
  }, [navigation]);

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 10) + 10 }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
          <View style={styles.dockInner}>
            {TABS.map((tab, index) => {
              if (tab.isSpecial) {
                return <CreateButton key={index} onPress={handleCreatePress} />;
              }

              return (
                <TabButton
                  key={index}
                  tab={tab}
                  isActive={activeTab === tab.name}
                  onPress={() => handleTabPress(tab.screen)}
                />
              );
            })}
          </View>
        </BlurView>
      ) : (
        // Android fallback without BlurView
        <View style={[styles.blurContainer, styles.androidBackground]}>
          <View style={styles.dockInner}>
            {TABS.map((tab, index) => {
              if (tab.isSpecial) {
                return <CreateButton key={index} onPress={handleCreatePress} />;
              }

              return (
                <TabButton
                  key={index}
                  tab={tab}
                  isActive={activeTab === tab.name}
                  onPress={() => handleTabPress(tab.screen)}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: width * 0.85, // 85% of screen width
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  blurContainer: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(20, 20, 20, 0.75)', // Glass Black Base
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 35,
    overflow: 'hidden',
  },
  androidBackground: {
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
  },
  dockInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 15,
  },
  tabButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.brand.primary,
    marginTop: 4,
  },
  createButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brand.primary, // Neon Lime
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Float above the dock
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#000', // Contrast border
  },
});

export default FloatingDock;
