import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
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

  const handleTabPress = (screen: keyof RootStackParamList) => {
    void impact('light');
    navigation.navigate(screen as never);
  };

  return (
    <View style={styles.bottomNav}>
      {/* Discover Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('Discover')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Discover' }}
        accessibilityLabel="Discover tab"
        accessibilityHint="Browse moments and hosts"
      >
        <MaterialCommunityIcons
          name={activeTab === 'Discover' ? 'compass' : 'compass-outline'}
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
          Discover
        </Text>
      </TouchableOpacity>

      {/* Requests Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('Requests')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Requests' }}
        accessibilityLabel="Requests tab"
        accessibilityHint="View pending requests"
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={activeTab === 'Requests' ? 'inbox-full' : 'inbox-outline'}
            size={24}
            color={
              activeTab === 'Requests' ? COLORS.primary : COLORS.textSecondary
            }
          />
          {requestsBadge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {requestsBadge > 9 ? '9+' : requestsBadge}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={
            activeTab === 'Requests' ? styles.navTextActive : styles.navText
          }
        >
          Requests
        </Text>
      </TouchableOpacity>

      {/* Create/+ Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress('CreateMoment')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'Create' }}
        accessibilityLabel="Create moment"
        accessibilityHint="Create a new moment"
      >
        <View style={styles.createButton}>
          <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {/* Messages Tab */}
      <TouchableOpacity
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
              <Text style={styles.badgeText}>
                {messagesBadge > 9 ? '9+' : messagesBadge}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={
            activeTab === 'Messages' ? styles.navTextActive : styles.navText
          }
        >
          Messages
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
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
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 48,
  },
  iconContainer: {
    position: 'relative',
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    minWidth: 60, // Increased touch target width
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
