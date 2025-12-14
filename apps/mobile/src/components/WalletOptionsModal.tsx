/**
 * WalletOptionsModal Component
 * Modal for wallet management options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface WalletOptionsModalProps {
  visible: boolean;
  walletType?: 'apple_pay' | 'google_pay';
  isDefault?: boolean;
  onClose: () => void;
  onSetDefault?: () => void;
  onDisconnect?: () => void;
}

export const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
  visible,
  walletType,
  isDefault = false,
  onClose,
  onSetDefault,
  onDisconnect,
}) => {
  const walletLabel = walletType === 'apple_pay' ? 'Apple Pay' : 'Google Pay';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>{walletLabel} Options</Text>

              {!isDefault && (
                <TouchableOpacity style={styles.option} onPress={onSetDefault}>
                  <MaterialCommunityIcons
                    name="star-outline"
                    size={24}
                    color={COLORS.textPrimary}
                  />
                  <Text style={styles.optionText}>Set as Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.option, styles.dangerOption]}
                onPress={onDisconnect}
              >
                <MaterialCommunityIcons
                  name="link-variant-off"
                  size={24}
                  color={COLORS.error}
                />
                <Text style={[styles.optionText, styles.dangerText]}>Disconnect</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dangerOption: {
    backgroundColor: COLORS.error + '10',
  },
  dangerText: {
    color: COLORS.error,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default WalletOptionsModal;
