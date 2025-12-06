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
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);

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
      Alert.alert(
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
      Alert.alert('Error', 'You cannot revoke your current session.');
      return;
    }

    Alert.alert(
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
    Alert.alert(
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
            color={COLORS.text}
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
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setBiometricEnabled(!biometricEnabled)}
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
                <Text style={styles.menuLabel}>Biometric Login</Text>
                <Text style={styles.menuDesc}>
                  Use Face ID or Touch ID to sign in
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.background },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color={COLORS.text}
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
                  { backgroundColor: COLORS.coralTransparent },
                ]}
              >
                <MaterialCommunityIcons
                  name="bell-alert"
                  size={20}
                  color={COLORS.coral}
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
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
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
                      color={session.isCurrent ? COLORS.mint : COLORS.text}
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  revokeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.coral,
    marginBottom: 12,
  },

  // KYC Card
  kycCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  kycSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  verifiedBadge: {
    backgroundColor: COLORS.mintTransparent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mint,
  },
  kycDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  kycDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  kycDetailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  kycDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  verifyButton: {
    backgroundColor: COLORS.coral,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Menu Card
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },

  // Sessions
  sessionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
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
    backgroundColor: COLORS.background,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
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
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default SecurityScreen;
