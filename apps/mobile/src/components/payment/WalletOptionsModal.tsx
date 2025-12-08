/**
 * WalletOptionsModal Component
 * Bottom sheet for wallet actions: Configure, Disconnect
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { Wallet } from './types';

interface WalletOptionsModalProps {
  visible: boolean;
  wallet: Wallet | null;
  onClose: () => void;
  onConfigure: () => void;
  onDisconnect: () => void;
}

export const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
  visible,
  wallet,
  onClose,
  onConfigure,
  onDisconnect,
}) => {
  if (!wallet) return null;

  const walletName =
    wallet.name || (Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay');

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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons
                name={Platform.OS === 'ios' ? 'apple' : 'google'}
                size={24}
                color={COLORS.text}
              />
            </View>
            <Text style={styles.modalTitle}>{walletName}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity style={styles.optionItem} onPress={onConfigure}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={24}
                color={COLORS.text}
              />
              <Text style={styles.optionText}>Configure {walletName}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, styles.destructiveOption]}
              onPress={onDisconnect}
            >
              <MaterialCommunityIcons
                name="link-variant-off"
                size={24}
                color={COLORS.error}
              />
              <Text style={[styles.optionText, styles.destructiveText]}>
                Disconnect {walletName}
              </Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  destructiveOption: {
    backgroundColor: '#FEE2E2',
  },
  destructiveText: {
    color: COLORS.error,
  },
});

export default WalletOptionsModal;
