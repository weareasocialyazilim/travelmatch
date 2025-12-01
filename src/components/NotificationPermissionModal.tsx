import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const NotificationPermissionModal: React.FC<
  NotificationPermissionModalProps
> = ({ visible, onClose, onAllow }) => {
  const handleAllow = async () => {
    // Request notification permissions
    if (Platform.OS === 'ios') {
      // iOS permission request
      console.log('Requesting iOS notifications');
    } else {
      // Android permission request
      console.log('Requesting Android notifications');
    }
    onAllow();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="bell-ring" size={48} color={COLORS.white} />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Stay Updated</Text>

          {/* Description */}
          <Text style={styles.description}>
            Get notified about new gestures, matches, and important updates to
            make the most of your kindness journey.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Icon name="hand-heart" size={20} color={COLORS.primary} />
              <Text style={styles.benefitText}>New gesture matches</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="message-text" size={20} color={COLORS.primary} />
              <Text style={styles.benefitText}>Chat messages</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="check-decagram" size={20} color={COLORS.primary} />
              <Text style={styles.benefitText}>Proof verification updates</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllow}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.allowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.allowButtonText}>Allow Notifications</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  allowButton: {
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  allowButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  allowGradient: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  benefit: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    marginLeft: spacing.md,
  },
  benefitsContainer: {
    marginBottom: spacing.xl,
    width: '100%',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconGradient: {
    alignItems: 'center',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  modal: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    ...SHADOWS.lg,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
