import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: VALUES.borderRadius * 2,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  gradient: {
    padding: LAYOUT.padding * 3,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: LAYOUT.padding * 1.5,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: LAYOUT.padding * 2,
    lineHeight: 24,
    opacity: 0.95,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 3,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: LAYOUT.padding,
    lineHeight: 20,
  },
  closeButton: {
    width: '100%',
  },
  whiteButton: {
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
