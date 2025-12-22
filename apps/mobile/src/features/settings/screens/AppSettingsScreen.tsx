import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSelectionBottomSheet } from '@/components/LanguageSelectionBottomSheet';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';
import { useToast } from '@/context/ToastContext';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_VERSION = '0.0.1';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();
  const { showToast } = useToast();

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true);

  // KYC status from auth context
  const isIdentityVerified = user?.kyc === 'Verified';

  // Get member since year from user creation date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : new Date().getFullYear().toString();

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageSheetVisible, setIsLanguageSheetVisible] = useState(false);

  const toggleNotifications = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotificationsExpanded(!notificationsExpanded);
  }, [notificationsExpanded]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            logger.error('Sign out failed', error);
            showToast('Failed to sign out', 'error');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  // Count enabled notifications
  const enabledNotificationsCount = [
    chatNotifications,
    requestNotifications,
    marketingNotifications,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offline Banner */}
      {!isConnected && (
        <OfflineState
          compact
          onRetry={refreshNetwork}
          message="No internet connection"
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Verification - Important, at top */}
        {!isIdentityVerified && (
          <TouchableOpacity
            style={styles.verificationBanner}
            onPress={() => navigation.navigate('IdentityVerification')}
          >
            <View style={styles.verificationIcon}>
              <MaterialCommunityIcons
                name="shield-account"
                size={24}
                color={COLORS.warning}
              />
            </View>
            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>Verify Your Identity</Text>
              <Text style={styles.verificationDesc}>
                Unlock all features and build trust
              </Text>
            </View>
            <View style={styles.verifyButton}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Notifications - Expandable */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingsCard}
            onPress={toggleNotifications}
            activeOpacity={0.7}
          >
            <View style={styles.settingItem}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.coralTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="bell"
                  size={20}
                  color={COLORS.coral}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDesc}>
                  {pushEnabled
                    ? `${enabledNotificationsCount} of 3 enabled`
                    : 'All disabled'}
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(value) => {
                  setPushEnabled(value);
                  if (!value) {
                    setChatNotifications(false);
                    setRequestNotifications(false);
                    setMarketingNotifications(false);
                  }
                }}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
              <MaterialCommunityIcons
                name={notificationsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.softGray}
                style={{ marginLeft: 8 }}
              />
            </View>

            {/* Expandable notification options */}
            {notificationsExpanded && pushEnabled && (
              <View style={styles.expandedContent}>
                <View style={styles.divider} />
                <View style={styles.subSettingItem}>
                  <Text style={styles.subSettingLabel}>Chat Messages</Text>
                  <Switch
                    value={chatNotifications}
                    onValueChange={setChatNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>
                <View style={styles.subSettingItem}>
                  <Text style={styles.subSettingLabel}>Request Updates</Text>
                  <Switch
                    value={requestNotifications}
                    onValueChange={setRequestNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>
                <View style={styles.subSettingItem}>
                  <Text style={styles.subSettingLabel}>Marketing</Text>
                  <Switch
                    value={marketingNotifications}
                    onValueChange={setMarketingNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.mintTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={20}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Profile Visibility</Text>
                <Text style={styles.settingDesc}>
                  {profileVisible ? 'Discoverable' : 'Hidden'}
                </Text>
              </View>
              <Switch
                value={profileVisible}
                onValueChange={setProfileVisible}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsLanguageSheetVisible(true)}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.softOrangeTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="translate"
                  size={20}
                  color={COLORS.softOrange}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDesc}>{selectedLanguage}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share */}
        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('InviteFriends')}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.mintTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={20}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Invite Friends</Text>
                <Text style={styles.settingDesc}>Share TravelMatch</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
            <View style={styles.dividerFull} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out & Delete Account - Side by Side */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color={COLORS.error}
            />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Footer with Version & Member Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TravelMatch v{APP_VERSION}</Text>
          <Text style={styles.footerText}>Member since {memberSince}</Text>
        </View>
      </ScrollView>

      <LanguageSelectionBottomSheet
        visible={isLanguageSheetVisible}
        onClose={() => setIsLanguageSheetVisible(false)}
        onLanguageChange={(lang: string) => {
          setSelectedLanguage(
            lang === 'en' ? 'English' : lang === 'tr' ? 'Türkçe' : lang,
          );
          setIsLanguageSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Verification Banner
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  verificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  verificationDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  verifyButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verifyButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Sections
  section: {
    marginBottom: 16,
  },

  // Settings Card
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 14,
  },
  dividerFull: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  // Expanded notifications
  expandedContent: {
    paddingBottom: 8,
  },
  subSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginLeft: 48,
  },
  subSettingLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  signOutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  deleteText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.error,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

export default withErrorBoundary(AppSettingsScreen, {
  fallbackType: 'generic',
  displayName: 'AppSettingsScreen',
});
