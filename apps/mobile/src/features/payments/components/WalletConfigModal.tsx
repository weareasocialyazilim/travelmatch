/**
 * WalletConfigModal Component
 * Modal for configuring wallet settings
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { Wallet, WalletSettings } from '../types/payment-methods.types';

interface WalletConfigModalProps {
  visible: boolean;
  wallet: Wallet | null;
  settings: WalletSettings;
  onClose: () => void;
  onSave: (settings: Partial<WalletSettings>) => void;
}

export const WalletConfigModal = ({
  visible,
  wallet,
  settings,
  onClose,
  onSave,
}: WalletConfigModalProps) => {
  const [isDefaultPayment, setIsDefaultPayment] = useState(settings.isDefaultPayment);
  const [requireAuth, setRequireAuth] = useState(settings.requireAuth);
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications);
  const [isLoading, setIsLoading] = useState(false);

  // Sync settings when modal opens
  useEffect(() => {
    if (visible) {
      setIsDefaultPayment(settings.isDefaultPayment);
      setRequireAuth(settings.requireAuth);
      setEnableNotifications(settings.enableNotifications);
    }
  }, [visible, settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        isDefaultPayment,
        requireAuth,
        enableNotifications,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    isDefaultPayment !== settings.isDefaultPayment ||
    requireAuth !== settings.requireAuth ||
    enableNotifications !== settings.enableNotifications;

  if (!wallet) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Wallet Settings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Wallet Info */}
          <View style={styles.walletInfo}>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons
                name="wallet"
                size={28}
                color={COLORS.utility.white}
              />
            </View>
            <View style={styles.walletDetails}>
              <Text style={styles.walletName}>{wallet.name}</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.feedback.success }]} />
                <Text style={styles.statusText}>{wallet.status}</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            {/* Default Payment */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="star-outline"
                  size={22}
                  color={COLORS.brand.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Default Payment</Text>
                  <Text style={styles.settingDescription}>
                    Use this wallet as your primary payment method
                  </Text>
                </View>
              </View>
              <Switch
                value={isDefaultPayment}
                onValueChange={setIsDefaultPayment}
                trackColor={{ false: COLORS.softGray, true: COLORS.brand.primaryLight }}
                thumbColor={isDefaultPayment ? COLORS.brand.primary : COLORS.utility.white}
              />
            </View>

            {/* Biometric Auth */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={22}
                  color={COLORS.brand.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Require Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Use Face ID or fingerprint for payments
                  </Text>
                </View>
              </View>
              <Switch
                value={requireAuth}
                onValueChange={setRequireAuth}
                trackColor={{ false: COLORS.softGray, true: COLORS.brand.primaryLight }}
                thumbColor={requireAuth ? COLORS.brand.primary : COLORS.utility.white}
              />
            </View>

            {/* Notifications */}
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={22}
                  color={COLORS.brand.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Payment Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when a payment is made
                  </Text>
                </View>
              </View>
              <Switch
                value={enableNotifications}
                onValueChange={setEnableNotifications}
                trackColor={{ false: COLORS.softGray, true: COLORS.brand.primaryLight }}
                thumbColor={enableNotifications ? COLORS.brand.primary : COLORS.utility.white}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (!hasChanges || isLoading) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.utility.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.softGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 16,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDetails: {
    flex: 1,
  },
  walletName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.feedback.success,
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 12,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  settingDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.bg.primary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.softGray,
  },
  saveButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});
