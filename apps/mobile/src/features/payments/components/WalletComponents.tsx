/**
 * Wallet UI Components
 *
 * Components for managing digital wallets in the payment flow.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { Wallet, WalletSettings } from '../types/payment-methods.types';

// ============================================================================
// WalletListItem
// ============================================================================

interface WalletListItemProps {
  wallet: Wallet;
  isDefault?: boolean;
  onPress: (wallet: Wallet) => void;
}

export const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  isDefault = false,
  onPress,
}) => {
  const getWalletIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'apple pay':
        return 'apple';
      case 'google pay':
        return 'google';
      default:
        return 'wallet';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.walletItem, isDefault && styles.walletItemDefault]}
      onPress={() => onPress(wallet)}
      activeOpacity={0.7}
    >
      <View style={styles.walletIcon}>
        <MaterialCommunityIcons
          name={getWalletIcon(wallet.name)}
          size={24}
          color={COLORS.brand.primary}
        />
      </View>
      <View style={styles.walletInfo}>
        <Text style={styles.walletName}>{wallet.name}</Text>
        <Text style={styles.walletStatus}>
          {wallet.status === 'connected' ? 'Bağlı' : 'Bağlantı kesildi'}
        </Text>
      </View>
      {isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
        </View>
      )}
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={COLORS.text.secondary}
      />
    </TouchableOpacity>
  );
};

// ============================================================================
// WalletConnectButton
// ============================================================================

interface WalletConnectButtonProps {
  onPress: () => void;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.connectButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="wallet-plus"
        size={24}
        color={COLORS.brand.primary}
      />
      <Text style={styles.connectButtonText}>Dijital Cüzdan Bağla</Text>
      <Text style={styles.connectButtonSubtext}>
        Apple Pay veya Google Pay ekleyin
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// WalletOptionsModal
// ============================================================================

interface WalletOptionsModalProps {
  visible: boolean;
  wallet: Wallet | null;
  onClose: () => void;
  onSetDefault: () => void;
  onDisconnect: () => void;
  onConfigure: () => void;
}

export const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
  visible,
  wallet,
  onClose,
  onSetDefault,
  onDisconnect,
  onConfigure,
}) => {
  if (!visible || !wallet) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{wallet.name} Seçenekleri</Text>

        <TouchableOpacity style={styles.modalOption} onPress={onSetDefault}>
          <MaterialCommunityIcons
            name="star"
            size={24}
            color={COLORS.text.primary}
          />
          <Text style={styles.modalOptionText}>Varsayılan Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalOption} onPress={onConfigure}>
          <MaterialCommunityIcons
            name="cog"
            size={24}
            color={COLORS.text.primary}
          />
          <Text style={styles.modalOptionText}>Ayarlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalOption, styles.modalOptionDanger]}
          onPress={onDisconnect}
        >
          <MaterialCommunityIcons
            name="link-off"
            size={24}
            color={COLORS.status.error}
          />
          <Text style={[styles.modalOptionText, styles.modalOptionTextDanger]}>
            Bağlantıyı Kes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
          <Text style={styles.modalCancelText}>İptal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// WalletConfigModal
// ============================================================================

interface WalletConfigModalProps {
  visible: boolean;
  wallet: Wallet | null;
  settings: WalletSettings;
  onClose: () => void;
  onSave: (settings: Partial<WalletSettings>) => void;
}

export const WalletConfigModal: React.FC<WalletConfigModalProps> = ({
  visible,
  wallet,
  settings,
  onClose,
  onSave,
}) => {
  if (!visible || !wallet) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{wallet.name} Ayarları</Text>

        <View style={styles.configOption}>
          <Text style={styles.configOptionLabel}>Varsayılan ödeme yöntemi</Text>
          <Text style={styles.configOptionValue}>
            {settings.isDefaultPayment ? 'Evet' : 'Hayır'}
          </Text>
        </View>

        <View style={styles.configOption}>
          <Text style={styles.configOptionLabel}>
            Kimlik doğrulama gerektir
          </Text>
          <Text style={styles.configOptionValue}>
            {settings.requireAuth ? 'Evet' : 'Hayır'}
          </Text>
        </View>

        <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
          <Text style={styles.modalCancelText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface.primary,
    borderRadius: 12,
    marginBottom: 8,
  },
  walletItemDefault: {
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  walletStatus: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.brand.primary + '20',
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  connectButton: {
    padding: 20,
    backgroundColor: COLORS.surface.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  connectButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  connectButtonSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.surface.primary,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  modalOptionText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  modalOptionDanger: {
    borderBottomWidth: 0,
  },
  modalOptionTextDanger: {
    color: COLORS.status.error,
  },
  modalCancel: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
  },
  configOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  configOptionLabel: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
  },
  configOptionValue: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
  },
});
