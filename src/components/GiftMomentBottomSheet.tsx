import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
  Platform,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmGiftModal } from './ConfirmGiftModal';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import type { MomentData } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

/** Supported payment methods for gifting moments */
type PaymentMethod = 'apple-pay' | 'google-pay' | 'card';

/**
 * Props for GiftMomentBottomSheet component
 */
interface Props {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** The moment data to be gifted */
  moment: MomentData | null;
  /** Callback when the sheet is closed */
  onClose: () => void;
  /** Callback when a gift is confirmed with selected payment method */
  onGift: (paymentMethod: PaymentMethod) => void;
}

const formatDateRange = (start: Date, end: Date) => {
  if (!end || start.getTime() === end.getTime()) {
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${end.toLocaleDateString('en-US', { day: 'numeric' })}`;
};

/**
 * Bottom sheet for gifting a moment to another user.
 * Includes payment method selection, date selection, and confirmation flow.
 *
 * @example
 * ```tsx
 * <GiftMomentBottomSheet
 *   visible={showGiftSheet}
 *   moment={selectedMoment}
 *   onClose={() => setShowGiftSheet(false)}
 *   onGift={(method) => handleGift(method)}
 * />
 * ```
 */
export const GiftMomentBottomSheet: React.FC<Props> = ({
  visible,
  moment,
  onClose,
  onGift,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('apple-pay');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPaymentMethod('apple-pay');
      onClose();
    });
  }, [backdropOpacity, onClose, translateY]);

  useEffect(() => {
    if (visible && moment) {
      openSheet();
    } else if (!visible) {
      closeSheet();
    }
  }, [visible, moment, openSheet, closeSheet]);

  if (!moment) return null;

  const handleGift = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGift = () => {
    setShowConfirmModal(false);
    closeSheet();
    // Wait for sheet to close before triggering gift
    const timeoutId = setTimeout(() => {
      onGift(paymentMethod);
    }, 400);

    return () => clearTimeout(timeoutId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={closeSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Compact Preview */}
          <View style={styles.previewSection}>
            <View style={styles.previewImageContainer}>
              {moment.imageUrl && (
                <Image
                  source={{ uri: moment.imageUrl }}
                  style={styles.previewImage}
                />
              )}
              {moment.category && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>
                    {moment.category.emoji} {moment.category.label}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {moment.title}
              </Text>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.previewMetaText}>
                  {moment.location?.name || 'Unknown Location'}
                </Text>
              </View>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.previewMetaText}>
                  {moment.dateRange
                    ? formatDateRange(
                        moment.dateRange.start,
                        moment.dateRange.end,
                      )
                    : 'Available now'}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Protection Notice */}
          {moment.price < VALUES.ESCROW_DIRECT_MAX ? (
            <View style={styles.directPayNotice}>
              <View style={styles.protectionHeader}>
                <MaterialCommunityIcons
                  name="flash"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.protectionTitle}>Direct Payment</Text>
              </View>
              <Text style={styles.protectionText}>
                Sent instantly to recipient. No escrow needed.
              </Text>
            </View>
          ) : (
            <View style={styles.protectionNotice}>
              <View style={styles.protectionHeader}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.protectionTitle}>
                  Protected by ProofLoop™
                </Text>
              </View>
              <Text style={styles.protectionText}>
                {moment.price >= VALUES.ESCROW_OPTIONAL_MAX
                  ? 'Escrow required. Funds release only when verified proof is uploaded.'
                  : 'Escrow optional. Funds release when proof is uploaded or after 7 days.'}
              </Text>
            </View>
          )}

          {/* Payment Info */}
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <Text style={styles.paymentValue}>
                ${(moment.price ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Processing Fee</Text>
              <Text style={styles.paymentValue}>Free</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotal}>Total</Text>
              <Text style={styles.paymentTotal}>
                ${(moment.price ?? 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'apple-pay' && styles.paymentMethodSelected,
                ]}
                onPress={() => setPaymentMethod('apple-pay')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="apple"
                  size={24}
                  color={
                    paymentMethod === 'apple-pay'
                      ? COLORS.buttonDark
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'apple-pay' &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  Apple Pay
                </Text>
              </TouchableOpacity>

              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === 'google-pay' &&
                      styles.paymentMethodSelected,
                  ]}
                  onPress={() => setPaymentMethod('google-pay')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="google"
                    size={24}
                    color={
                      paymentMethod === 'google-pay'
                        ? COLORS.buttonDark
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === 'google-pay' &&
                        styles.paymentMethodTextSelected,
                    ]}
                  >
                    Google Pay
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'card' && styles.paymentMethodSelected,
                ]}
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="credit-card"
                  size={24}
                  color={
                    paymentMethod === 'card'
                      ? COLORS.buttonDark
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'card' &&
                      styles.paymentMethodTextSelected,
                  ]}
                >
                  Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleGift}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>
                Send • ${(moment.price ?? 0).toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Confirm Gift Modal */}
      {visible && (
        <ConfirmGiftModal
          visible={showConfirmModal}
          amount={moment.price ?? 0}
          recipientName={moment.user?.name || 'Unknown'}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmGift}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.modalBackdrop,
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  previewImageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  previewBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: COLORS.overlay60,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  previewBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  previewMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  directPayNotice: {
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  protectionNotice: {
    backgroundColor: COLORS.mintTransparentLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  protectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  protectionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  paymentInfo: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 10,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.transparent,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.mintTransparentLight,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: COLORS.text,
  },
  ctaSection: {
    paddingVertical: 20,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 999,
    paddingVertical: 18,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
