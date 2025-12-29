import React, { useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
  momentTitle?: string;
  onViewApprovals?: () => void;
}

interface ConfettiPieceProps {
  index: number;
  totalPieces: number;
  color: string;
  visible: boolean;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({
  index,
  totalPieces,
  color,
  visible,
}) => {
  const progress = useSharedValue(0);
  const angle = (index * 360) / totalPieces;
  const distance = 100 + Math.random() * 50;
  const randomRotation = Math.random() * 360;

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 800 });
    } else {
      progress.value = 0;
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [0, distance * Math.cos((angle * Math.PI) / 180)],
    );
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, -distance * Math.sin((angle * Math.PI) / 180)],
    );
    const opacity = interpolate(progress.value, [0, 0.8, 1], [1, 1, 0]);
    const rotate = interpolate(progress.value, [0, 1], [0, randomRotation]);

    return {
      transform: [{ translateX }, { translateY }, { rotate: `${rotate}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.confetti, { backgroundColor: color }, animatedStyle]}
    />
  );
};

export const GiftSuccessModal: React.FC<Props> = memo(
  ({
    visible,
    amount,
    onClose,
    momentTitle: _momentTitle,
    onViewApprovals: _onViewApprovals,
  }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    const confettiColors = useMemo(
      () => [
        COLORS.brand.secondary,
        COLORS.mint,
        COLORS.feedback.success,
        COLORS.softOrange,
        COLORS.utility.white,
      ],
      [],
    );

    useEffect(() => {
      if (visible) {
        // Haptic feedback
        if (Platform.OS === 'ios') {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } else {
          Vibration.vibrate(100);
        }

        // Success icon animation
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
        });
        opacity.value = withTiming(1, { duration: 300 });
      } else {
        scale.value = 0;
        opacity.value = 0;
      }

      return () => {
        cancelAnimation(scale);
        cancelAnimation(opacity);
      };
    }, [visible, scale, opacity]);

    const contentStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Confetti particles */}
            <View style={styles.confettiContainer}>
              {Array.from({ length: 12 }).map((_, index) => (
                <ConfettiPiece
                  key={index}
                  index={index}
                  totalPieces={12}
                  color={confettiColors[index % confettiColors.length]}
                  visible={visible}
                />
              ))}
            </View>

            {/* Success icon */}
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <MaterialCommunityIcons
                name="check-circle"
                size={80}
                color={COLORS.feedback.success}
              />
            </Animated.View>

            {/* Success message */}
            <Text style={styles.title}>Gesture Sent!</Text>
            <Text style={styles.subtitle}>
              Your ${amount.toFixed(2)} gift is on its way
            </Text>

            {amount >= VALUES.ESCROW_DIRECT_MAX && (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color={COLORS.feedback.success}
                />
                <Text style={styles.infoText}>
                  You&apos;ll be notified when proof is uploaded.
                </Text>
              </View>
            )}

            {amount < VALUES.ESCROW_DIRECT_MAX && (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="flash"
                  size={20}
                  color={COLORS.feedback.success}
                />
                <Text style={styles.infoText}>
                  Payment sent instantly to recipient.
                </Text>
              </View>
            )}

            {/* Return button - No approval needed for givers */}
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Return Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: '100%',
  },
  buttonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '700',
  },
  confetti: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    width: 8,
  },
  confettiContainer: {
    height: 1,
    left: '50%',
    position: 'absolute',
    top: '50%',
    width: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.blackTransparent,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 28,
    maxWidth: LAYOUT.size.modalMax,
    padding: 40,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.utility.black,
        shadowOffset: LAYOUT.shadowOffset.xxl,
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    marginBottom: 24,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.brand.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    padding: 16,
  },
  infoText: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    color: COLORS.text.secondary,
    fontSize: 17,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
