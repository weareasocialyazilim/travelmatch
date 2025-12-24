/**
 * BottomNav Component - iOS 26.3 Redesigned
 *
 * Glass effect bottom navigation with updated icons for gift-moment concept.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

interface BottomNavProps {
  activeTab: 'Discover' | 'Requests' | 'Create' | 'Messages' | 'Profile';
  requestsBadge?: number;
  messagesBadge?: number;
}

const BottomNav: React.FC<BottomNavProps> = memo(function BottomNav({
  activeTab,
  requestsBadge = 0,
  messagesBadge = 0,
}) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { impact } = useHaptics();

  // Memoize tab press handler
  const handleTabPress = useCallback(
    (screen: keyof RootStackParamList) => {
      void impact('light');
      navigation.navigate(screen as never);
    },
    [navigation, impact],
  );

  // Memoize badge display text
  const requestsBadgeText = useMemo(
    () => (requestsBadge > 9 ? '9+' : requestsBadge),
    [requestsBadge],
  );

  const messagesBadgeText = useMemo(
    () => (messagesBadge > 9 ? '9+' : messagesBadge),
    [messagesBadge],
  );

  // Use BlurView on iOS, fallback to solid background on Android
  const NavContainer = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios'
    ? { intensity: 90, tint: 'light' as const }
    : {};

  return (
    <View style={styles.bottomNav}>
      <NavContainer {...containerProps} style={styles.navContent}>
        {/* Wishes Tab (renamed from Discover) */}
        <TouchableOpacity
          testID="nav-discover-tab"
          style={styles.navItem}
          onPress={() => handleTabPress('Discover')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'Discover' }}
          accessibilityLabel="Wishes tab"
          accessibilityHint="Browse wishes and gift moments"
        >
          <MaterialCommunityIcons
            name={activeTab === 'Discover' ? 'gift' : 'gift-outline'}
            size={24}
            color={
              activeTab === 'Discover' ? COLORS.primary : COLORS.textSecondary
            }
          />
          <Text
            style={
              activeTab === 'Discover' ? styles.navTextActive : styles.navText
            }
          >
            Wishes
          </Text>
        </TouchableOpacity>

        {/* Gifts Tab (renamed from Requests) */}
        <TouchableOpacity
          testID="nav-requests-tab"
          style={styles.navItem}
          onPress={() => handleTabPress('Requests')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'Requests' }}
          accessibilityLabel="Gifts tab"
          accessibilityHint="View your gifts"
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'Requests' ? 'heart' : 'heart-outline'}
              size={24}
              color={
                activeTab === 'Requests' ? COLORS.primary : COLORS.textSecondary
              }
            />
            {requestsBadge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requestsBadgeText}</Text>
              </View>
            )}
          </View>
          <Text
            style={
              activeTab === 'Requests' ? styles.navTextActive : styles.navText
            }
          >
            Gifts
          </Text>
        </TouchableOpacity>

        {/* Create/+ Tab with gradient */}
        <TouchableOpacity
          testID="nav-create-tab"
          style={styles.navItem}
          onPress={() => handleTabPress('CreateMoment')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'Create' }}
          accessibilityLabel="Create wish"
          accessibilityHint="Create a new wish"
        >
          <LinearGradient
            colors={GRADIENTS.giftButton}
            style={styles.createButton}
          >
            <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Messages Tab */}
        <TouchableOpacity
          testID="nav-messages-tab"
          style={styles.navItem}
          onPress={() => handleTabPress('Messages')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'Messages' }}
          accessibilityLabel="Messages tab"
          accessibilityHint="View your conversations"
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'Messages' ? 'chat' : 'chat-outline'}
              size={24}
              color={
                activeTab === 'Messages' ? COLORS.primary : COLORS.textSecondary
              }
            />
            {messagesBadge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{messagesBadgeText}</Text>
              </View>
            )}
          </View>
          <Text
            style={
              activeTab === 'Messages' ? styles.navTextActive : styles.navText
            }
          >
            Chat
          </Text>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          testID="nav-profile-tab"
          style={styles.navItem}
          onPress={() => handleTabPress('Profile')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'Profile' }}
          accessibilityLabel="Profile tab"
          accessibilityHint="Navigate to Profile screen"
        >
          <MaterialCommunityIcons
            name={activeTab === 'Profile' ? 'account' : 'account-outline'}
            size={24}
            color={
              activeTab === 'Profile' ? COLORS.primary : COLORS.textSecondary
            }
          />
          <Text
            style={
              activeTab === 'Profile' ? styles.navTextActive : styles.navText
            }
          >
            Profile
          </Text>
        </TouchableOpacity>
      </NavContainer>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.error,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -8,
    top: -4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: Platform.OS === 'android' ? COLORS.glassBackground : 'transparent',
  },
  createButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 48,
    elevation: 6,
  },
  iconContainer: {
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    minWidth: 60,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default BottomNav;
