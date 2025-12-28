import React, { useEffect, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, primitives } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { radii } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { SPACING } from '../constants/spacing';

interface Props {
  visible: boolean;
  amount: number;
  recipientName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmGiftModal: React.FC<Props> = memo(
  ({ visible, amount, recipientName, onCancel, onConfirm }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    // Memoize formatted amount to prevent recalculation
    const formattedAmount = useMemo(() => amount.toFixed(2), [amount]);

    useEffect(() => {
      if (visible) {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 200 });
      } else {
        scale.value = withTiming(0.8, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 });
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
        onRequestClose={onCancel}
      >
        <View style={styles.backdrop}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="gift-outline"
                size={48}
                color={COLORS.feedback.success}
              />
            </View>

            <Text style={styles.title}>Confirm Gift</Text>
            <Text style={styles.message}>
              Send <Text style={styles.amount}>${formattedAmount}</Text> to
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
  },
  (prevProps, nextProps) =>
    prevProps.visible === nextProps.visible &&
    prevProps.amount === nextProps.amount &&
    prevProps.recipientName === nextProps.recipientName,
);

ConfirmGiftModal.displayName = 'ConfirmGiftModal';

const styles = StyleSheet.create({
  amount: {
    color: COLORS.feedback.success,
    fontSize: 17,
    fontWeight: '700',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: primitives.stone[100],
    borderRadius: radii.full,
    flex: 1,
    paddingVertical: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: radii.full,
    flex: 1,
    paddingVertical: SPACING.md,
  },
  confirmButtonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: radii.xl,
    maxWidth: LAYOUT.size.modalMax,
    padding: SPACING.xl,
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
    marginBottom: SPACING.lg,
    width: LAYOUT.size.iconSm,
  },
  message: {
    color: COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  recipient: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
});
