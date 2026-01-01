/**
 * TravelMatch Vibe Room - Glass Segmented Control
 *
 * Premium glassmorphism tab switcher with animated indicator.
 * Switches between "Active Matches" and "Requests"
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { VIBE_ROOM_COLORS, INBOX_SPACING, INBOX_SPRINGS } from '../constants/theme';
import type { InboxTab } from '../types/inbox.types';

interface GlassSegmentedControlProps {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  requestCount?: number;
}

const GlassSegmentedControl: React.FC<GlassSegmentedControlProps> = memo(
  ({ activeTab, onTabChange, requestCount = 0 }) => {
    const indicatorPosition = useSharedValue(activeTab === 'active' ? 0 : 1);

    const handleTabPress = useCallback(
      (tab: InboxTab) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        indicatorPosition.value = withSpring(tab === 'active' ? 0 : 1, INBOX_SPRINGS.snappy);
        onTabChange(tab);
      },
      [onTabChange, indicatorPosition]
    );

    const indicatorStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            indicatorPosition.value,
            [0, 1],
            [4, INDICATOR_WIDTH + 8],
            Extrapolation.CLAMP
          ),
        },
      ],
    }));

    const activeTextStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        indicatorPosition.value,
        [0, 1],
        [1, 0.6],
        Extrapolation.CLAMP
      ),
    }));

    const requestsTextStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        indicatorPosition.value,
        [0, 1],
        [0.6, 1],
        Extrapolation.CLAMP
      ),
    }));

    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          {/* Animated indicator */}
          <Animated.View style={[styles.indicator, indicatorStyle]} />

          {/* Active Matches Tab */}
          <Pressable
            style={styles.tab}
            onPress={() => handleTabPress('active')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'active' }}
            accessibilityLabel="Active Matches"
          >
            <Animated.Text style={[styles.tabText, activeTextStyle]}>
              Active Matches
            </Animated.Text>
          </Pressable>

          {/* Requests Tab */}
          <Pressable
            style={styles.tab}
            onPress={() => handleTabPress('requests')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'requests' }}
            accessibilityLabel={`Requests${requestCount > 0 ? `, ${requestCount} new` : ''}`}
          >
            <View style={styles.tabContent}>
              <Animated.Text style={[styles.tabText, requestsTextStyle]}>
                Requests
              </Animated.Text>
              {requestCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {requestCount > 9 ? '9+' : requestCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    );
  }
);

// Calculate indicator width based on container
const INDICATOR_WIDTH = 160;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: INBOX_SPACING.screenPadding,
    marginBottom: 20,
  },
  wrapper: {
    flexDirection: 'row',
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundLight,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INBOX_SPACING.tabHeight - 8,
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundMedium,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.borderActive,
  },
  tab: {
    flex: 1,
    height: INBOX_SPACING.tabHeight - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: VIBE_ROOM_COLORS.neon.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontSize: 10,
    fontWeight: '800',
  },
});

GlassSegmentedControl.displayName = 'GlassSegmentedControl';

export default GlassSegmentedControl;
