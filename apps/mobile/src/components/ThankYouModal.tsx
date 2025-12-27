import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

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
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, animatedStyle]}>
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
        </Animated.View>
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
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    lineHeight: 24,
    marginBottom: SPACING.lg,
    opacity: 0.95,
    textAlign: 'center',
  },
  modal: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    width: '85%',
    ...SHADOWS.lg,
  },
  noteCard: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  noteText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: SPACING.md,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  whiteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.md,
    paddingVertical: SPACING.md,
  },
});
