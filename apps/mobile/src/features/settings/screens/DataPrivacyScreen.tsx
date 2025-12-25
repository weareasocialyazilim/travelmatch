import React, { useState, useEffect } from 'react';
import { TYPOGRAPHY } from '@/theme/typography';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Share as _Share,
  Platform,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { documentDirectory, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/config/supabase';
import { callRpc } from '@/services/supabaseRpc';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/context/ToastContext';

interface ConsentSettings {
  gdprConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  privacyPolicyVersion: string | null;
  termsAcceptedAt: string | null;
}

const DataPrivacyScreen = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<ConsentSettings>({
    gdprConsent: false,
    marketingConsent: false,
    analyticsConsent: true,
    privacyPolicyVersion: null,
    termsAcceptedAt: null,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadConsentSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConsentSettings = async () => {
    try {
      const res = await supabase
        .from('profiles')
        .select(
          'gdpr_consent_at, marketing_consent, analytics_consent, privacy_policy_version, terms_accepted_at',
        )
        .eq('id', user?.id)
        .single();

      if (res.error) throw res.error;

      const dataAny: any = res.data;

      setConsents({
        gdprConsent: !!dataAny.gdpr_consent_at,
        marketingConsent: dataAny.marketing_consent || false,
        analyticsConsent: dataAny.analytics_consent ?? true,
        privacyPolicyVersion: dataAny.privacy_policy_version,
        termsAcceptedAt: dataAny.terms_accepted_at,
      });
    } catch (error) {
      logger.error('Error loading consent settings:', error);
      showToast('Failed to load privacy settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (
    consentType: 'marketing' | 'analytics',
    value: boolean,
  ) => {
    try {
      // Record consent in history
      const { data: _rpcData, error } = await callRpc('record_consent', {
        target_user_id: user?.id,
        consent_type: consentType,
        consented: value,
        version: '1.0',
      });

      if (error) throw error as Error;

      // Update local state
      if (consentType === 'marketing') {
        setConsents((prev) => ({ ...prev, marketingConsent: value }));
      } else {
        setConsents((prev) => ({ ...prev, analyticsConsent: value }));
      }

      showToast('Privacy preferences updated', 'success');
    } catch (error) {
      logger.error('Error updating consent:', error);
      showToast('Failed to update privacy preferences', 'error');
    }
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Your Data',
      'We will prepare a comprehensive copy of all your data (profile, moments, messages, transactions, etc.) in JSON format. This process is GDPR-compliant and includes all your personal data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setExportLoading(true);
            try {
              // Call GDPR-compliant export function
              const { data: exportData, error } =
                await userService.exportData();

              if (error) throw error;

              // Generate filename with timestamp
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const filename = `travelmatch-data-export-${timestamp}.json`;

              if (Platform.OS === 'web') {
                // Web: Create download link
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
              } else {
                // Mobile: Save to file and share
                const fileUri = `${documentDirectory}${filename}`;
                await FileSystem.writeAsStringAsync(
                  fileUri,
                  JSON.stringify(exportData, null, 2),
                  { encoding: EncodingType.UTF8 },
                );

                // Check if sharing is available
                const isSharingAvailable = await Sharing.isAvailableAsync();
                if (isSharingAvailable) {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Save Your Data Export',
                    UTI: 'public.json',
                  });
                } else {
                  // Fallback: Show file location
                  Alert.alert(
                    'Export Saved',
                    `Your data has been saved to:\n${fileUri}`,
                    [{ text: 'OK' }],
                  );
                }
              }

              // Log successful export for compliance
              Alert.alert(
                'Export Completed',
                `Your data export includes:\n\n` +
                  `• Profile information\n` +
                  `• ${exportData.metadata.totalMoments} moments\n` +
                  `• ${exportData.metadata.totalRequests} requests\n` +
                  `• ${exportData.metadata.totalMessages} messages\n` +
                  `• ${exportData.metadata.totalTransactions} transactions\n` +
                  `• ${exportData.metadata.totalReviews} reviews\n\n` +
                  `This file is valid for 7 days as per GDPR requirements.`,
                [{ text: 'OK' }],
              );
            } catch (error) {
              logger.error('[DataPrivacy] Error exporting data:', error);
              Alert.alert(
                'Export Failed',
                error instanceof Error
                  ? error.message
                  : 'Failed to export data. Please try again or contact support.',
                [{ text: 'OK' }],
              );
            } finally {
              setExportLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action will:\n\n' +
        '• Schedule your account for deletion in 30 days\n' +
        '• Anonymize your personal data\n' +
        '• Remove your trips and messages\n' +
        '• You can cancel within 30 days\n\n' +
        'This action cannot be undone after the grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              const { data: _rpcData2, error } = await callRpc(
                'schedule_account_deletion',
                {
                  target_user_id: user?.id,
                  deletion_reason: 'User requested deletion',
                },
              );

              if (error) throw error as Error;

              Alert.alert(
                'Account Deletion Scheduled',
                'Your account will be deleted in 30 days. You can cancel this request anytime before then.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Optionally navigate to a confirmation screen or logout
                    },
                  },
                ],
              );
            } catch (error) {
              logger.error('Error scheduling deletion:', error);
              showToast('Failed to schedule account deletion', 'error');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleViewConsentHistory = async () => {
    try {
      // SECURITY: Explicit column selection
      const { data, error } = await supabase
        .from('consent_history')
        .select(
          `
          id,
          user_id,
          consent_type,
          consent_given,
          ip_address,
          user_agent,
          created_at
        `,
        )
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Navigate to consent history screen or show modal
      Alert.alert(
        'Consent History',
        `You have ${data.length} consent records. View them in the app.`,
      );
    } catch (error) {
      logger.error('Error fetching consent history:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GDPR Rights</Text>
        <Text style={styles.sectionDescription}>
          Under GDPR, you have the right to access, export, and delete your
          personal data.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportData}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Export My Data</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleDeleteAccount}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Preferences</Text>

        <View style={styles.consentRow}>
          <View style={styles.consentInfo}>
            <Text style={styles.consentTitle}>Marketing Communications</Text>
            <Text style={styles.consentDescription}>
              Receive emails about new features, tips, and special offers
            </Text>
          </View>
          <Switch
            value={consents.marketingConsent}
            onValueChange={(value) => updateConsent('marketing', value)}
            trackColor={{ false: '#ccc', true: '#2563eb' }}
          />
        </View>

        <View style={styles.consentRow}>
          <View style={styles.consentInfo}>
            <Text style={styles.consentTitle}>Analytics & Performance</Text>
            <Text style={styles.consentDescription}>
              Help us improve by sharing anonymous usage data
            </Text>
          </View>
          <Switch
            value={consents.analyticsConsent}
            onValueChange={(value) => updateConsent('analytics', value)}
            trackColor={{ false: '#ccc', true: '#2563eb' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Documents</Text>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Privacy Policy</Text>
          {consents.privacyPolicyVersion && (
            <Text style={styles.versionText}>
              v{consents.privacyPolicyVersion}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Terms of Service</Text>
          {consents.termsAcceptedAt && (
            <Text style={styles.versionText}>
              Accepted {new Date(consents.termsAcceptedAt).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewConsentHistory}
        >
          <Text style={styles.linkText}>View Consent History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.footerText}>
          Your privacy is important to us. We are committed to protecting your
          personal data in accordance with GDPR and other privacy regulations.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  consentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  consentInfo: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  consentDescription: {
    ...TYPOGRAPHY.caption,
    color: '#6b7280',
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  linkText: {
    ...TYPOGRAPHY.bodyLarge,
    color: '#2563eb',
    fontWeight: '500',
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: '#9ca3af',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
});

// Wrap with ScreenErrorBoundary for GDPR-critical functionality
const DataPrivacyScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <DataPrivacyScreen />
  </ScreenErrorBoundary>
);

export default DataPrivacyScreenWithErrorBoundary;
