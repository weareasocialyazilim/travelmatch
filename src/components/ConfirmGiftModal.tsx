import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface Props {
  visible: boolean;
  amount: number;
  recipientName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmGiftModal: React.FC<Props> = ({
  visible,
  amount,
  recipientName,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={48}
              color={COLORS.success}
            />
          </View>

          <Text style={styles.title}>Confirm Gift</Text>
          <Text style={styles.message}>
            Send <Text style={styles.amount}>${amount.toFixed(2)}</Text> to
            {'\n'}
            <Text style={styles.recipient}>{recipientName}</Text>?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  amount: {
    color: COLORS.success,
    fontSize: 17,
    fontWeight: '700',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 14,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    maxWidth: LAYOUT.size.modalMax,
    padding: 32,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: LAYOUT.shadowOffset.xxl,
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 40,
    height: LAYOUT.size.iconSm,
    justifyContent: 'center',
    marginBottom: 20,
    width: LAYOUT.size.iconSm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  recipient: {
    color: COLORS.text,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
});
