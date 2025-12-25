/**
 * GiftCelebration Component
 *
 * Full-screen celebration modal shown after successful gift payment.
 * Features confetti animation, gift icon, escrow info, and share prompt.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GiftCelebrationProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Recipient's name */
  recipientName: string;
  /** Gift amount */
  giftAmount: number;
  /** Currency symbol */
  currency?: string;
  /** Moment/wish title */
  momentTitle?: string;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback for share action */
  onShare?: () => void;
}

export const GiftCelebration: React.FC<GiftCelebrationProps> = ({
  visible,
  recipientName,
  giftAmount,
  currency = '₺',
  momentTitle,
  onClose,
  onShare,
}) => {
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const confettiProgress = useSharedValue(0);

  // Trigger animations when modal opens
  useEffect(() => {
    if (visible) {
      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Icon bounce in
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });

      // Gift icon wiggle
      iconRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
      );

      // Text fade in
      opacity.value = withDelay(300, withSpring(1));

      // Confetti animation
      confettiProgress.value = withTiming(1, { duration: 2000 });
    } else {
      scale.value = 0;
      opacity.value = 0;
      iconRotation.value = 0;
      confettiProgress.value = 0;
    }
  }, [visible, scale, opacity, iconRotation, confettiProgress]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 20 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (onShare) {
      onShare();
      return;
    }

    // Default share behavior
    try {
      const message = momentTitle
        ? `${recipientName}'a "${momentTitle}" deneyimini hediye ettim! 🎁✨ #TravelMatch`
        : `${recipientName}'a bir deneyim hediye ettim! 🎁✨ #TravelMatch`;

      await Share.share({
        message,
        title: 'TravelMatch ile Hediye Ettim!',
      });
    } catch {
      // User cancelled or error - silently ignore
    }
  }, [onShare, recipientName, momentTitle]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  // Simple confetti dots
  const renderConfetti = () => {
    const confettiColors = [
      '#F59E0B',
      '#EC4899',
      '#8B5CF6',
      '#10B981',
      '#3B82F6',
    ];
    const dots = [];

    for (let i = 0; i < 30; i++) {
      const left = Math.random() * SCREEN_WIDTH;
      const _delay = Math.random() * 500;
      const size = 6 + Math.random() * 8;
      const color =
        confettiColors[Math.floor(Math.random() * confettiColors.length)];

      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.confettiDot,
            {
              left,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: size / 2,
            },
          ]}
        />,
      );
    }

    return <View style={styles.confettiContainer}>{dots}</View>;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Confetti */}
        {renderConfetti()}

        <Animated.View style={[styles.content, contentStyle]}>
          {/* Gift Icon Container */}
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <LinearGradient
              colors={GRADIENTS.giftButton}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons
                name="gift"
                size={48}
                color={COLORS.white}
              />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={textStyle}>
            {/* Title */}
            <Text style={styles.title}>Harika! 🎉</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {recipientName}'in gününü güzelleştirdin!
            </Text>

            {/* Amount */}
            <Text style={styles.amount}>
              {currency}
              {giftAmount}
            </Text>

            {/* Escrow Info */}
            <View style={styles.escrowInfo}>
              <MaterialCommunityIcons
                name="lock"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.escrowText}>
                Para güvenli kasada, deneyim tamamlanınca transfer edilecek
              </Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.shareText}>Bu Anı Paylaş</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>Tamam</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  confettiDot: {
    position: 'absolute',
    top: -20,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 24,
  },
  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successMuted,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  escrowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.success,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.buttonDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  shareText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GiftCelebration;
