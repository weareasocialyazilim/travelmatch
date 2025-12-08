/**
 * WalletSettingsModal Component
 * Modal for configuring wallet settings (default, auth, notifications)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { Wallet, WalletSettings } from './types';

interface WalletSettingsModalProps {
  visible: boolean;
  wallet: Wallet | null;
  settings: WalletSettings;
  onClose: () => void;
  onSettingsChange: (settings: WalletSettings) => void;
  onSave: () => void;
}

export const WalletSettingsModal: React.FC<WalletSettingsModalProps> = ({
  visible,
  wallet,
  settings,
  onClose,
  onSettingsChange,
  onSave,
}) => {
  if (!wallet) return null;

  const walletName =
    wallet.name || (Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay');

  const handleToggle = (key: keyof WalletSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

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
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{walletName} Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Default Payment Method</Text>
                <Text style={styles.settingDescription}>
                  Use {walletName} as your default payment method
                </Text>
              </View>
              <Switch
                value={settings.isDefaultPayment}
                onValueChange={() => handleToggle('isDefaultPayment')}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Require Authentication</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or Touch ID for payments
                </Text>
              </View>
              <Switch
                value={settings.requireAuth}
                onValueChange={() => handleToggle('requireAuth')}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Payment Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified about payments made with {walletName}
                </Text>
              </View>
              <Switch
                value={settings.enableNotifications}
                onValueChange={() => handleToggle('enableNotifications')}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
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
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingsList: {
    gap: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.softGray,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default WalletSettingsModal;
