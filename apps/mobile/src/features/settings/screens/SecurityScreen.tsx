import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { showAlert } from '@/stores/modalStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { useBiometric } from '@/context/BiometricAuthContext';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const {
    biometricAvailable,
    biometricEnabled,
    biometricTypeName,
    isLoading: isLoadingBiometric,
    enableBiometric,
    disableBiometric,
  } = useBiometric();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

  const handleBiometricToggle = async (newValue: boolean) => {
    if (!biometricAvailable) {
      showAlert(
        'Not Available',
        'Biometric authentication is not available on this device. Please ensure you have Face ID, Touch ID, or fingerprint authentication set up in your device settings.',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      if (newValue) {
        // Enable biometric
        const success = await enableBiometric();

        if (success) {
          showAlert(
            'Enabled',
            `${biometricTypeName} authentication has been enabled. You can now use it to unlock the app and verify sensitive actions.`,
            [{ text: 'OK' }],
          );
        } else {
          showAlert(
            'Authentication Failed',
            `Could not verify your ${biometricTypeName.toLowerCase()}. Please try again.`,
            [{ text: 'OK' }],
          );
        }
      } else {
        // Disable biometric
        showAlert(
          `Disable ${biometricTypeName}`,
          `Are you sure you want to disable ${biometricTypeName} authentication? You will need to enter your password for future logins.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await disableBiometric();
              },
            },
          ],
        );
      }
    } catch (error) {
      logger.error('SecurityScreen', 'Biometric toggle failed', error);
      showAlert(
        'Error',
        'Failed to update biometric settings. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  // Mock KYC data
  const kycStatus = {
    verified: true,
    level: 'Full',
    verifiedDate: 'March 15, 2024',
  };

  // Mock active sessions
  const activeSessions: ActiveSession[] = [
    {
      id: '1',
      device: 'iPhone 16 Pro',
      location: 'New York, USA',
      lastActive: 'Now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'New York, USA',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Chrome on Windows',
      location: 'Los Angeles, USA',
      lastActive: '3 days ago',
      isCurrent: false,
    },
  ];

  const handleTwoFactorSetup = () => {
    if (twoFactorEnabled) {
      showAlert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setTwoFactorEnabled(false),
          },
        ],
      );
    } else {
      navigation.navigate('TwoFactorSetup');
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleRevokeSession = (session: ActiveSession) => {
    if (session.isCurrent) {
      showToast('You cannot revoke your current session.', 'error');
      return;
    }

    showAlert(
      'Revoke Session',
      `Are you sure you want to sign out from ${session.device}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => {
            logger.debug('Session revoked:', session.id);
          },
        },
      ],
    );
  };

  const handleRevokeAll = () => {
    showAlert(
      'Sign Out All Devices',
      'This will sign you out from all devices except this one. You will need to sign in again on those devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: () => {
            logger.debug('All sessions revoked');
          },
        },
      ],
    );
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone')) return 'cellphone';
    if (device.toLowerCase().includes('macbook')) return 'laptop';
    if (device.toLowerCase().includes('ipad')) return 'tablet';
    return 'desktop-tower-monitor';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KYC Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDENTITY VERIFICATION</Text>

          <View style={styles.kycCard}>
            <View style={styles.kycHeader}>
              <View
                style={[
                  styles.kycIconContainer,
                  kycStatus.verified && styles.kycVerified,
                ]}
              >
                <MaterialCommunityIcons
                  name={kycStatus.verified ? 'shield-check' : 'shield-alert'}
                  size={24}
                  color={kycStatus.verified ? COLORS.mint : COLORS.softOrange}
                />
              </View>
              <View style={styles.kycInfo}>
                <Text style={styles.kycTitle}>KYC Verification</Text>
                <Text style={styles.kycSubtitle}>
                  {kycStatus.verified
                    ? `${kycStatus.level} verification completed`
                    : 'Verify your identity to unlock all features'}
                </Text>
              </View>
              {kycStatus.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              )}
            </View>

            {kycStatus.verified && (
              <View style={styles.kycDetails}>
                <View style={styles.kycDetailRow}>
                  <Text style={styles.kycDetailLabel}>Verification Level</Text>
                  <Text style={styles.kycDetailValue}>{kycStatus.level}</Text>
                </View>
                <View style={styles.kycDetailRow}>
                  <Text style={styles.kycDetailLabel}>Verified On</Text>
                  <Text style={styles.kycDetailValue}>
                    {kycStatus.verifiedDate}
                  </Text>
                </View>
              </View>
            )}

            {!kycStatus.verified && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => navigation.navigate('PaymentsKYC')}
              >
                <Text style={styles.verifyButtonText}>Start Verification</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTHENTICATION</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleTwoFactorSetup}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.mintTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="shield-lock"
                  size={20}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Two-Factor Authentication</Text>
                <Text style={styles.menuDesc}>
                  {twoFactorEnabled
                    ? 'Enabled via Authenticator App'
                    : 'Add extra security to your account'}
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleTwoFactorSetup}
                trackColor={{ false: COLORS.border.default, true: COLORS.mint }}
                thumbColor={COLORS.utility.white}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleBiometricToggle(!biometricEnabled)}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.softOrangeTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={20}
                  color={COLORS.softOrange}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{biometricTypeName} Login</Text>
                <Text style={styles.menuDesc}>
                  {biometricAvailable
                    ? `Use ${biometricTypeName.toLowerCase()} to sign in and verify actions`
                    : 'Not available on this device'}
                </Text>
              </View>
              {isLoadingBiometric ? (
                <ActivityIndicator size="small" color={COLORS.mint} />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={!biometricAvailable}
                  trackColor={{
                    false: COLORS.border.default,
                    true: COLORS.mint,
                  }}
                  thumbColor={COLORS.utility.white}
                />
              )}
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.bg.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color={COLORS.text.primary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Change Password</Text>
                <Text style={styles.menuDesc}>
                  Update your account password
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

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY ALERTS</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setLoginAlertsEnabled(!loginAlertsEnabled)}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.brand.secondaryTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="bell-alert"
                  size={20}
                  color={COLORS.brand.secondary}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Login Alerts</Text>
                <Text style={styles.menuDesc}>
                  Get notified of new sign-ins
                </Text>
              </View>
              <Switch
                value={loginAlertsEnabled}
                onValueChange={setLoginAlertsEnabled}
                trackColor={{ false: COLORS.border.default, true: COLORS.mint }}
                thumbColor={COLORS.utility.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVE SESSIONS</Text>
            <TouchableOpacity onPress={handleRevokeAll}>
              <Text style={styles.revokeAllText}>Sign Out All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sessionsCard}>
            {activeSessions.map((session, index) => (
              <React.Fragment key={session.id}>
                <TouchableOpacity
                  style={styles.sessionItem}
                  onPress={() => handleRevokeSession(session)}
                  disabled={session.isCurrent}
                >
                  <View style={styles.sessionIcon}>
                    <MaterialCommunityIcons
                      name={
                        getDeviceIcon(session.device) as React.ComponentProps<
                          typeof MaterialCommunityIcons
                        >['name']
                      }
                      size={20}
                      color={
                        session.isCurrent ? COLORS.mint : COLORS.text.primary
                      }
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionDevice}>{session.device}</Text>
                      {session.isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sessionDetails}>
                      {session.location} • {session.lastActive}
                    </Text>
                  </View>
                  {!session.isCurrent && (
                    <MaterialCommunityIcons
                      name="close"
                      size={18}
                      color={COLORS.softGray}
                    />
                  )}
                </TouchableOpacity>
                {index < activeSessions.length - 1 && (
                  <View style={styles.sessionDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
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
    color: COLORS.text.primary,
  },
  spacer: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  revokeAllText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.brand.secondary,
    marginBottom: 12,
  },

  // KYC Card
  kycCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softOrangeTransparent,
    marginRight: 12,
  },
  kycVerified: {
    backgroundColor: COLORS.mintTransparent,
  },
  kycInfo: {
    flex: 1,
  },
  kycTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  kycSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  verifiedBadge: {
    backgroundColor: COLORS.mintTransparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.mint,
  },
  kycDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  kycDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  kycDetailLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  kycDetailValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  verifyButton: {
    backgroundColor: COLORS.brand.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.utility.white,
  },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginLeft: 62,
  },

  // Sessions
  sessionsCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sessionDevice: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  currentBadge: {
    backgroundColor: COLORS.mintTransparent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.mint,
  },
  sessionDetails: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginLeft: 62,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default SecurityScreen;
