import React, { useState, useEffect, useRef } from 'react';
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
import { MomentData } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

type PaymentMethod = 'apple-pay' | 'google-pay' | 'card';

interface Props {
  visible: boolean;
  moment: MomentData | null;
  onClose: () => void;
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

  useEffect(() => {
    if (visible && moment) {
      openSheet();
    } else if (!visible) {
      closeSheet();
    }
  }, [visible, moment, openSheet, closeSheet]);

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
                  {moment.location.name}
                </Text>
              </View>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.previewMetaText}>
                  {formatDateRange(
                    moment.dateRange.start,
                    moment.dateRange.end,
                  )}
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
                ${moment.price.toFixed(2)}
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
                ${moment.price.toFixed(2)}
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
                Send • ${moment.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Confirm Gift Modal */}
      {visible && (
        <ConfirmGiftModal
          visible={showConfirmModal}
          amount={moment.price}
          recipientName={moment.user.name}
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
  content: {
    flex: 1,
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
