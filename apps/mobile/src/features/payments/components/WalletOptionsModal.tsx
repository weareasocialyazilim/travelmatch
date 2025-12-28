import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { Wallet, WalletSettings } from '../types/payment-methods.types';

interface WalletOptionsModalProps {
  visible: boolean;
  wallet: Wallet | null;
  settings: WalletSettings;
  onClose: () => void;
  onConfigure: () => void;
  onDisconnect: () => void;
}

export const WalletOptionsModal = ({
  visible,
  wallet,
  settings,
  onClose,
  onConfigure,
  onDisconnect,
}: WalletOptionsModalProps) => {
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
          style={styles.optionsContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragHandle} />
          <Text style={styles.optionsTitle}>{wallet.name}</Text>

          <ScrollView style={styles.optionsScroll}>
            <TouchableOpacity style={styles.optionItem} onPress={onConfigure}>
              <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.text.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Configure wallet</Text>
                <Text style={styles.optionDescription}>
                  Manage payment settings and preferences
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            {settings.isDefaultPayment && (
              <View style={styles.defaultIndicator}>
                <MaterialCommunityIcons name="star" size={20} color={COLORS.mint} />
                <Text style={styles.defaultText}>Default payment method</Text>
              </View>
            )}

            <TouchableOpacity style={styles.optionItemDanger} onPress={onDisconnect}>
              <MaterialCommunityIcons name="link-variant-off" size={24} color={COLORS.destructive} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitleDanger}>Disconnect wallet</Text>
                <Text style={styles.optionDescription}>
                  You can reconnect anytime
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.destructive} />
            </TouchableOpacity>
          </ScrollView>
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
  optionsContainer: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.softGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionsTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  optionsScroll: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.softGray,
    gap: 12,
  },
  optionItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  optionTitleDanger: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.destructive,
    marginBottom: 4,
  },
  optionDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  defaultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beige,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginVertical: 12,
  },
  defaultText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.mint,
  },
});
