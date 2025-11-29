import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
  giverName: string;
  amount?: number;
}

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
        <View style={styles.modal}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Icon name="check-circle" size={80} color={COLORS.white} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Thank You Sent!</Text>

            {/* Message */}
            <Text style={styles.message}>
              Your gratitude message has been sent to {giverName}
              {amount && ` for their ${amount} contribution`}.
            </Text>

            {/* Appreciation Note */}
            <View style={styles.noteCard}>
              <Icon name="heart" size={24} color={COLORS.error} />
              <Text style={styles.noteText}>
                Gratitude strengthens the bond of kindness
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.whiteButton}>
                <Text style={styles.closeButtonText}>Continue</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    width: '100%',
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  gradient: {
    alignItems: 'center',
    padding: LAYOUT.padding * 3,
  },
  iconContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  message: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 2,
    opacity: 0.95,
    textAlign: 'center',
  },
  modal: {
    borderRadius: VALUES.borderRadius * 2,
    overflow: 'hidden',
    width: '85%',
    ...VALUES.shadow,
  },
  noteCard: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 3,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
  },
  noteText: {
    color: COLORS.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: LAYOUT.padding,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: LAYOUT.padding * 1.5,
    textAlign: 'center',
  },
  whiteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    paddingVertical: LAYOUT.padding * 1.5,
  },
});
