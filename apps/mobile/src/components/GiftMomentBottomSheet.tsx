import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../constants/colors';
import { VALUES } from '../constants/values';
import { ConfirmGiftModal } from './ConfirmGiftModal';
import { useScreenSecurity } from '../hooks/useScreenSecurity';
import { useComplianceCheck } from '../hooks/useComplianceCheck';
import { formatCurrency } from '../utils/currencyFormatter';
import { logger } from '../utils/production-logger';
import type { CurrencyCode } from '../constants/currencies';
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
  const [complianceWarning, setComplianceWarning] = useState<string | null>(
    null,
  );

  // Compliance check hook
  const { isChecking, checkSendLimit, checkContribution, checkCompliance } =
    useComplianceCheck();

  // Reanimated shared values for 60fps animations
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // Enable screenshot protection when visible
  useScreenSecurity();

  // Animated styles using worklets (runs on UI thread)
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const resetAndClose = useCallback(() => {
    setPaymentMethod('apple-pay');
    onClose();
  }, [onClose]);

  const openSheet = useCallback(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    backdropOpacity.value = withTiming(1, { duration: 300 });
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    translateY.value = withSpring(SHEET_HEIGHT, {
      damping: 20,
      stiffness: 200,
    });
    backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(resetAndClose)();
    });
  }, [translateY, backdropOpacity, resetAndClose]);

  // Gesture handler for swipe to dismiss (runs on UI thread)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(SHEET_HEIGHT, {
          damping: 20,
          stiffness: 200,
        });
        backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(resetAndClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  useEffect(() => {
    if (visible && moment) {
      openSheet();
    } else if (!visible) {
      closeSheet();
    }
  }, [visible, moment, openSheet, closeSheet]);

  if (!moment) return null;

  const handleGift = async () => {
    setComplianceWarning(null);

    try {
      const currency = (moment.currency as CurrencyCode) || 'TRY';
      const amount = moment.price ?? 0;

      // 1. Check user send limits
      const limitResult = await checkSendLimit(amount, currency);

      if (!limitResult.allowed) {
        if (limitResult.promptKyc) {
          Alert.alert('Kimlik Doğrulama Gerekli', limitResult.message, [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Doğrula',
              onPress: () => {
                // Navigate to KYC screen
                closeSheet();
                // TODO: Navigate to KYC
              },
            },
          ]);
          return;
        }

        if (limitResult.promptUpgrade) {
          Alert.alert(
            'Limit Aşıldı',
            `${limitResult.message}\n\nLimitlerinizi artırmak için planınızı yükseltin.`,
            [
              { text: 'İptal', style: 'cancel' },
              {
                text: 'Planları Gör',
                onPress: () => {
                  closeSheet();
                  // TODO: Navigate to subscription plans
                },
              },
            ],
          );
          return;
        }

        Alert.alert('İşlem Yapılamıyor', limitResult.message);
        return;
      }

      // 2. Check moment contribution limit
      const contributionResult = await checkContribution(moment.id, amount);

      if (!contributionResult.allowed) {
        Alert.alert('Katkı Limiti', contributionResult.message, [
          { text: 'Tamam' },
        ]);
        return;
      }

      // 3. Full AML/Fraud compliance check
      const complianceResult = await checkCompliance(
        amount,
        currency,
        moment.user?.id,
      );

      if (!complianceResult.allowed) {
        const reason = complianceResult.blockReasons.join('\n');
        Alert.alert('İşlem Engelllendi', reason);
        return;
      }

      // Show warnings if any
      if (complianceResult.warnings.length > 0) {
        setComplianceWarning(complianceResult.warnings[0]);
      }

      // All checks passed, show confirmation modal
      setShowConfirmModal(true);
    } catch (error) {
      logger.error(
        'Compliance check failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      Alert.alert(
        'Hata',
        'İşlem kontrolü yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
      );
    }
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
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={closeSheet}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close gift sheet"
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
        {/* Drag Handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

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
                  color={COLORS.text.secondary}
                />
                <Text style={styles.previewMetaText}>
                  {moment.location?.name || 'Unknown Location'}
                </Text>
              </View>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={COLORS.text.secondary}
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
                  color={COLORS.feedback.success}
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
                  color={COLORS.feedback.success}
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
                {formatCurrency(
                  moment.price ?? 0,
                  (moment.currency as CurrencyCode) || 'TRY',
                )}
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
                {formatCurrency(
                  moment.price ?? 0,
                  (moment.currency as CurrencyCode) || 'TRY',
                )}
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
                      : COLORS.text.secondary
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
                        : COLORS.text.secondary
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
                      : COLORS.text.secondary
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

          {/* Compliance Warning */}
          {complianceWarning && (
            <View style={styles.warningNotice}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={18}
                color={COLORS.feedback.warning}
              />
              <Text style={styles.warningText}>{complianceWarning}</Text>
            </View>
          )}

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.ctaButton, isChecking && styles.ctaButtonDisabled]}
              onPress={handleGift}
              activeOpacity={0.8}
              disabled={isChecking}
            >
              {isChecking ? (
                <ActivityIndicator color={COLORS.utility.white} />
              ) : (
                <Text style={styles.ctaButtonText}>
                  Send •{' '}
                  {formatCurrency(
                    moment.price ?? 0,
                    (moment.currency as CurrencyCode) || 'TRY',
                  )}
                </Text>
              )}
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
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.utility.white,
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
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  previewMetaText: {
    fontSize: 13,
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  protectionText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  paymentInfo: {
    backgroundColor: primitives.stone[100],
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
    color: COLORS.text.secondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: 8,
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  paymentMethodSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 10,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primitives.stone[100],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.utility.transparent,
  },
  paymentMethodSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.mintTransparentLight,
  },
  paymentMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: COLORS.text.primary,
  },
  warningNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.feedback.warningLight || '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.feedback.warning || '#856404',
    lineHeight: 18,
  },
  ctaSection: {
    paddingVertical: 20,
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 999,
    paddingVertical: 18,
    minHeight: 56,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    color: COLORS.utility.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
