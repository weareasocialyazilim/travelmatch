import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSelectionBottomSheet } from '../components/LanguageSelectionBottomSheet';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';
import { withErrorBoundary } from '../../../components/withErrorBoundary';
import { useNetworkStatus } from '../../../context/NetworkContext';
import { OfflineState } from '../../../components/OfflineState';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const { isConnected, refresh: refreshNetwork } = useNetworkStatus();

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true);

  // KYC status from auth context
  const isIdentityVerified = user?.kyc === 'Verified';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : '2024';

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageSheetVisible, setIsLanguageSheetVisible] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Navigation is typically handled by the auth state change in AppNavigator
          } catch (error) {
            logger.error('Sign out failed', error);
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Offline Banner */}
      {!isConnected && (
        <OfflineState 
          compact 
          onRetry={refreshNetwork}
          message="İnternet bağlantısı yok"
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
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

          <View style={styles.settingsCard}>
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
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDesc}>
                  {pushEnabled
                    ? 'All notifications are enabled'
                    : 'All notifications are disabled'}
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(value) => {
                  setPushEnabled(value);
                  // If turning off push, disable all sub-notifications
                  if (!value) {
                    setChatNotifications(false);
                    setRequestNotifications(false);
                    setMarketingNotifications(false);
                  }
                }}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Only show sub-notifications if push is enabled */}
            {pushEnabled && (
              <>
                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingIconPlaceholder} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Chat Messages</Text>
                    <Text style={styles.settingDesc}>
                      New message notifications
                    </Text>
                  </View>
                  <Switch
                    value={chatNotifications}
                    onValueChange={setChatNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingIconPlaceholder} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Request Updates</Text>
                    <Text style={styles.settingDesc}>
                      Gift requests and proofs
                    </Text>
                  </View>
                  <Switch
                    value={requestNotifications}
                    onValueChange={setRequestNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingItem}>
                  <View style={styles.settingIconPlaceholder} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Marketing</Text>
                    <Text style={styles.settingDesc}>
                      Tips, offers, and news
                    </Text>
                  </View>
                  <Switch
                    value={marketingNotifications}
                    onValueChange={setMarketingNotifications}
                    trackColor={{ false: COLORS.border, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>

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
                  {profileVisible
                    ? 'Others can discover your profile'
                    : 'Your profile is hidden from search'}
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

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LANGUAGE</Text>

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
                <Text style={styles.settingLabel}>App Language</Text>
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

        {/* Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHARE</Text>

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
                <Text style={styles.settingDesc}>
                  Share TravelMatch with friends
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STORAGE</Text>

          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.background },
                ]}
              >
                <MaterialCommunityIcons
                  name="broom"
                  size={20}
                  color={COLORS.text}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDesc}>
                  Images will be re-downloaded
                </Text>
              </View>
              <Text style={styles.cacheSize}>24.5 MB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0 (Build 100)</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Member Since</Text>
              </View>
              <Text style={styles.memberSinceText}>{memberSince}</Text>
            </View>

            <View style={styles.divider} />

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

            <View style={styles.divider} />

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

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Open Source Licenses</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <View style={styles.settingsCard}>
            {/* Identity Verification */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                !isIdentityVerified &&
                navigation.navigate('IdentityVerification')
              }
              disabled={isIdentityVerified}
            >
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: isIdentityVerified
                      ? COLORS.mintTransparent
                      : COLORS.warningLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isIdentityVerified ? 'shield-check' : 'shield-account'}
                  size={20}
                  color={isIdentityVerified ? COLORS.mint : COLORS.warning}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Identity Verification</Text>
                <Text style={styles.settingDesc}>
                  {isIdentityVerified
                    ? 'Your identity has been verified'
                    : 'Verify your identity to unlock full features'}
                </Text>
              </View>
              {isIdentityVerified ? (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color={COLORS.white}
                  />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              ) : (
                <View style={styles.verifyBadge}>
                  <Text style={styles.verifyBadgeText}>Verify</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.warningLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={COLORS.warning}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Sign Out</Text>
                <Text style={styles.settingDesc}>Log out of your account</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('DeleteAccount')}
            >
              <View
                style={[
                  styles.settingIcon,
                  { backgroundColor: COLORS.errorLight },
                ]}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color={COLORS.error}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: COLORS.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingDesc}>
                  Permanently delete your account
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
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
  settingIconPlaceholder: {
    width: 36,
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
    marginLeft: 62,
  },
  cacheSize: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  versionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  memberSinceText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.white,
  },
  verifyBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verifyBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.warning,
  },

  bottomSpacer: {
    height: 40,
  },
});

// Wrap with ErrorBoundary for settings screen
export default withErrorBoundary(AppSettingsScreen, { 
  fallbackType: 'generic',
  displayName: 'AppSettingsScreen' 
});
