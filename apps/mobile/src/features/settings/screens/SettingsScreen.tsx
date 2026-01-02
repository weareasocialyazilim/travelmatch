import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/logger';

// Dark theme colors for this screen
const DARK_COLORS = {
  background: '#121212',
  surface: 'rgba(255,255,255,0.05)',
  surfaceLight: 'rgba(255,255,255,0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.2)',
  divider: 'rgba(255,255,255,0.08)',
  brand: '#FF6B6B',
  verified: '#00D4FF',
  verifiedBg: 'rgba(0, 212, 255, 0.2)',
  error: '#E85555',
  errorBg: 'rgba(232, 85, 85, 0.1)',
  errorBorder: 'rgba(232, 85, 85, 0.3)',
  switchTrack: '#3e3e3e',
};

// Settings item types
interface BaseSettingsItem {
  id: string;
  icon: string;
  label: string;
}

interface LinkSettingsItem extends BaseSettingsItem {
  type: 'link';
  badge?: string;
}

interface SwitchSettingsItem extends BaseSettingsItem {
  type: 'switch';
  defaultValue: boolean;
}

interface ValueSettingsItem extends BaseSettingsItem {
  type: 'value';
  displayValue: string;
}

type SettingsItem = LinkSettingsItem | SwitchSettingsItem | ValueSettingsItem;

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SECTIONS: SettingsSection[] = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: 'person-outline', label: 'Edit Profile', type: 'link' },
      { id: 'wallet', icon: 'wallet-outline', label: 'Wallet & Cards', type: 'link' },
      { id: 'verification', icon: 'shield-checkmark-outline', label: 'Verification (KYC)', type: 'link', badge: 'Verified' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', icon: 'notifications-outline', label: 'Push Notifications', type: 'switch', defaultValue: true },
      { id: 'biometric', icon: 'finger-print', label: 'FaceID / TouchID', type: 'switch', defaultValue: true },
      { id: 'currency', icon: 'cash-outline', label: 'Currency', type: 'value', displayValue: 'USD ($)' },
      { id: 'language', icon: 'globe-outline', label: 'Language', type: 'value', displayValue: 'English' },
    ],
  },
  {
    title: 'Support & Legal',
    items: [
      { id: 'help', icon: 'help-buoy-outline', label: 'Help Center', type: 'link' },
      { id: 'terms', icon: 'document-text-outline', label: 'Terms of Service', type: 'link' },
      { id: 'privacy', icon: 'lock-closed-outline', label: 'Privacy Policy', type: 'link' },
    ],
  },
];

interface SettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // State management for switches
  const [preferences, setPreferences] = useState({
    notifications: true,
    biometric: true,
  });

  const toggleSwitch = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'profile':
        navigation.navigate('EditProfile');
        break;
      case 'wallet':
        navigation.navigate('Wallet');
        break;
      case 'verification':
        navigation.navigate('IdentityVerification');
        break;
      case 'currency':
        // TODO: Navigate to currency selection
        break;
      case 'language':
        // TODO: Navigate to language selection or show bottom sheet
        break;
      case 'help':
        navigation.navigate('FAQ');
        break;
      case 'terms':
        navigation.navigate('TermsOfService');
        break;
      case 'privacy':
        navigation.navigate('PrivacyPolicy');
        break;
      default:
        break;
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to disconnect from the vibe? 🥺",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              logger.error('Sign out failed', error);
              showToast('Failed to sign out', 'error');
            }
          }
        }
      ]
    );
  };

  const renderItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemRow}
      onPress={() => item.type !== 'switch' && handleItemPress(item.id)}
      disabled={item.type === 'switch'}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon as any} size={20} color="white" />
        </View>
        <Text style={styles.itemLabel}>{item.label}</Text>
      </View>

      <View style={styles.itemRight}>
        {item.type === 'link' && (
          <>
            {item.badge && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={DARK_COLORS.textSecondary} />
          </>
        )}

        {item.type === 'value' && (
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{item.displayValue}</Text>
            <Ionicons name="chevron-forward" size={20} color={DARK_COLORS.textSecondary} />
          </View>
        )}

        {item.type === 'switch' && (
          <Switch
            trackColor={{ false: DARK_COLORS.switchTrack, true: DARK_COLORS.brand }}
            thumbColor={preferences[item.id as keyof typeof preferences] ? "#000" : "#f4f3f4"}
            ios_backgroundColor={DARK_COLORS.switchTrack}
            onValueChange={() => toggleSwitch(item.id)}
            value={preferences[item.id as keyof typeof preferences]}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // User display info
  const displayName = user?.name || 'Traveler';
  const displayEmail = user?.email || 'traveler@travelmatch.app';
  const avatarUrl = user?.photoUrl || user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* SETTINGS GROUPS */}
        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <BlurView intensity={20} tint="light" style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderItem(item)}
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </BlurView>
          </View>
        ))}

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>TravelMatch v2.0.0 (Build 2026)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: DARK_COLORS.background,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: DARK_COLORS.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: DARK_COLORS.surface,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: DARK_COLORS.divider,
    marginLeft: 60,
  },

  // Badges & Values
  badgeContainer: {
    backgroundColor: DARK_COLORS.verifiedBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: DARK_COLORS.verified,
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    color: DARK_COLORS.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },

  // Footer
  signOutButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.errorBg,
    borderWidth: 1,
    borderColor: DARK_COLORS.errorBorder,
  },
  signOutText: {
    color: DARK_COLORS.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: DARK_COLORS.textMuted,
    fontSize: 12,
    marginTop: 24,
  },
});

export default SettingsScreen;
