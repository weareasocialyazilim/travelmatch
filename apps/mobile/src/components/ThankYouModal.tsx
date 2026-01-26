import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
  giverName: string;
  amount?: number;
}

/**
 * ThankYouModal - Trust Note Confirmation Modal
 * Shows a confirmation after leaving a trust note for a received gift
 */
export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  visible,
  onClose,
  giverName,
  amount,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="heart-circle"
              size={64}
              color={COLORS.brand.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Tesekkur Notu Gonderildi</Text>

          {/* Message */}
          <Text style={styles.message}>
            {giverName} hediye gonderdi
            {amount ? ` (${amount.toLocaleString('tr-TR')} TL)` : ''}.
          </Text>

          <Text style={styles.subtitle}>
            Deneyimini gerçekleştir ve kanıtını paylaş!
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.bg.primary,
  },
});

export default ThankYouModal;
