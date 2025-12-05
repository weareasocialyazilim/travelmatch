import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { SHADOWS } from '../constants/shadows';

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
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.8, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.container, animatedStyle]}>
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
        </Animated.View>
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
    padding: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: radii.full,
    flex: 1,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: radii.full,
    flex: 1,
    paddingVertical: spacing.md,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    maxWidth: LAYOUT.size.modalMax,
    padding: spacing.xl,
    width: '100%',
    ...Platform.select({
      ios: SHADOWS.lg,
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
    marginBottom: spacing.lg,
    width: LAYOUT.size.iconSm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.md,
  },
});
