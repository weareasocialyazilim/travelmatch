import React, { useState } from 'react';
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
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

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
            Get notified about new gestures, matches, and important updates to make
            the most of your kindness journey.
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  modal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius * 2,
    padding: LAYOUT.padding * 3,
    alignItems: 'center',
    ...VALUES.shadow,
  },
  iconContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 2,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: LAYOUT.padding * 3,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
  },
  allowButton: {
    width: '100%',
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginBottom: LAYOUT.padding,
  },
  allowGradient: {
    paddingVertical: LAYOUT.padding * 1.5,
    alignItems: 'center',
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  skipButton: {
    paddingVertical: LAYOUT.padding,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
