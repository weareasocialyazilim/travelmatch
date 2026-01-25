import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface RemoveCardModalProps {
  visible: boolean;
  onCancel: () => void;
  onRemove: () => void;
  cardLast4?: string;
}

export const RemoveCardModal: React.FC<RemoveCardModalProps> = ({
  visible,
  onCancel,
  onRemove,
  cardLast4: _cardLast4 = '4242',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <View style={styles.backdrop} />

        {/* Modal Content */}
        <View style={styles.modalContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={'delete' as IconName}
              size={32}
              color={COLORS.feedback.error}
            />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Remove card?</Text>

          {/* Body Text */}
          <Text style={styles.bodyText}>You can add it again anytime.</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              activeOpacity={0.8}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay60,
  },
  modalContent: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: COLORS.bg.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.errorRedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    paddingTop: 16,
  },
  removeButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  cancelButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.utility.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});
