/**
 * Unified Gift Flow Screen
 * Single screen replacing modal chain for smoother UX
 * Replaces: GiftBottomSheet → PaymentSheet → SuccessModal → ShareModal
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendGiftSchema, type SendGiftInput } from '../../../utils/forms/schemas';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADII } from '../constants/radii';
import { SPACING } from '../constants/spacing';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useHaptics } from '@/hooks/useHaptics';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import { usePaymentMethods, useCreatePaymentIntent } from '../hooks/usePayments';
import { paymentsApi } from '@/services/paymentsApi';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { Moment } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';

interface PaymentMethodDisplay {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'wallet';
  name: string;
  icon: string;
  lastFour?: string;
}

// Static wallet payment options
const WALLET_OPTIONS: PaymentMethodDisplay[] = [
  {
    id: 'apple_pay',
    type: 'apple_pay',
    name: 'Apple Pay',
    icon: 'apple',
  },
  {
    id: 'google_pay',
    type: 'google_pay',
    name: 'Google Pay',
    icon: 'google',
  },
];

type UnifiedGiftFlowScreenProps = StackScreenProps<
  RootStackParamList,
  'UnifiedGiftFlow'
>;

export const UnifiedGiftFlowScreen: React.FC<UnifiedGiftFlowScreenProps> = ({
  route,
  navigation,
}) => {
  const { recipientId, recipientName, momentId } = route.params;

  // Create a placeholder moment object - in production, fetch from API using momentId
  const moment: Moment = useMemo(
    () => ({
      id: momentId || 'placeholder',
      title: 'Gift Moment',
      story: '',
      imageUrl: '',
      price: 0,
      availability: '',
      location: { name: '', city: '', country: '' },
      user: { name: recipientName, avatar: '' },
    }),
    [momentId, recipientName],
  );

  const [_selectedRecipient, _setSelectedRecipient] = useState<string>(
    recipientId || '',
  );
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<SendGiftInput | null>(null);

  // Fetch real payment methods from API
  const { data: apiPaymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const createPaymentIntentMutation = useCreatePaymentIntent();

  // Combine real cards with wallet options
  const paymentMethods: PaymentMethodDisplay[] = useMemo(() => {
    const methods: PaymentMethodDisplay[] = [];

    // Add real cards from API
    if (apiPaymentMethods) {
      apiPaymentMethods.forEach((pm) => {
        methods.push({
          id: pm.id,
          type: pm.type === 'card' ? 'card' : 'wallet',
          name: pm.brand ? `${pm.brand.charAt(0).toUpperCase()}${pm.brand.slice(1)}` : 'Card',
          icon: 'credit-card',
          lastFour: pm.last4,
        });
      });
    }

    // Add wallet options
    methods.push(...WALLET_OPTIONS);

    return methods;
  }, [apiPaymentMethods]);

  // Set default payment method once loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPayment]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SendGiftInput>({
    resolver: zodResolver(sendGiftSchema),
    defaultValues: {
      recipientEmail: '',
      message: '',
    },
  });

  const message = watch('message');
  const recipientEmail = watch('recipientEmail');

  const { trackMount, trackInteraction } = useScreenPerformance(
    'UnifiedGiftFlowScreen',
  );

  useEffect(() => {
    trackMount();
  }, [trackMount]);

  const { impact } = useHaptics();
  const { trackEvent } = useAnalytics();

  // Handle payment method selection
  const handleSelectPayment = useCallback(
    (paymentId: string) => {
      impact('light');
      setSelectedPayment(paymentId);
      trackEvent('gift_payment_method_selected', { paymentId });
    },
    [impact, trackEvent],
  );

  // Handle gift purchase
  const onPurchase = useCallback(async (data: SendGiftInput) => {
    setLoading(true);
    setSubmittedData(data);
    void impact('medium');

    trackEvent('gift_purchase_started', {
      momentId: moment.id,
      price: moment.price,
      paymentMethod: selectedPayment,
      hasMessage: !!data.message,
    });

    try {
      // Create payment intent via API
      const paymentIntent = await createPaymentIntentMutation.mutateAsync({
        amount: moment.price,
        currency: 'USD',
      });

      // For wallet payments (Apple Pay/Google Pay), handle differently
      const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
      if (selectedMethod?.type === 'apple_pay' || selectedMethod?.type === 'google_pay') {
        // Wallet payments require native payment sheet handling
        // This would integrate with Stripe's native payment sheet
        console.log('Processing wallet payment:', selectedMethod.type);
      }

      // Confirm the payment with selected method
      if (paymentIntent?.id) {
        // Payment successful
        setSuccess(true);
        impact('success');

        trackInteraction('gift_completed', {
          momentId: moment.id,
          price: moment.price,
          paymentMethod: selectedPayment,
        });

        trackEvent('gift_purchase_completed', {
          momentId: moment.id,
          price: moment.price,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (error) {
      console.error('Gift purchase failed:', error);
      trackEvent('gift_purchase_failed', {
        momentId: moment.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Show error to user
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    moment,
    selectedPayment,
    paymentMethods,
    createPaymentIntentMutation,
    impact,
    trackEvent,
    trackInteraction,
  ]);

  // Handle share
  const handleShare = useCallback(() => {
    impact('light');
    trackEvent('gift_share_clicked', { momentId: moment.id });
    // Implement share functionality
    alert('Share functionality');
  }, [impact, trackEvent, moment]);

  // Handle done
  const handleDone = useCallback(() => {
    impact('light');
    navigation.navigate('Discover');
  }, [impact, navigation]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingState type="overlay" message="Processing your gift..." />
        <View style={styles.loadingWarning}>
          <Text style={styles.loadingWarningText}>
            This may take a few seconds. Please don't close the screen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (success) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={80} color={COLORS.success} />
          </View>

          <Text style={styles.successTitle}>Gift Sent! 🎁</Text>
          <Text style={styles.successSubtitle}>
            Your gift has been sent to {submittedData?.recipientEmail}
          </Text>

          {/* Gift Preview */}
          <View style={styles.giftPreview}>
            <Image source={{ uri: moment.imageUrl }} style={styles.giftImage} />
            <View style={styles.giftDetails}>
              <Text style={styles.giftTitle}>{moment.title}</Text>
              <Text style={styles.giftPrice}>${moment.price}</Text>
            </View>
          </View>

          {/* Message Preview */}
          {submittedData?.message && (
            <View style={styles.messagePreview}>
              <Icon
                name="message-text"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.messageText}>{submittedData.message}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.successActions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Icon name="share-variant" size={20} color={COLORS.white} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main flow
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gift this Moment</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Moment Preview */}
          <View style={styles.momentPreview}>
            <Image
              source={{ uri: moment.imageUrl }}
              style={styles.momentImage}
            />
            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle} numberOfLines={2}>
                {moment.title}
              </Text>
              <Text style={styles.momentLocation}>
                {moment.location?.city || 'Unknown Location'}
              </Text>
              <Text style={styles.momentPrice}>${moment.price}</Text>
            </View>
          </View>

          {/* Recipient Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send to</Text>
            <Controller
              control={control}
              name="recipientEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Recipient's email"
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.recipientEmail && (
              <Text style={styles.errorText}>{errors.recipientEmail.message}</Text>
            )}
          </View>

          {/* Message Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal message (optional)</Text>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add a personal message..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                />
              )}
            />
            <Text style={styles.charCount}>{(message || '').length}/200</Text>
            {errors.message && (
              <Text style={styles.errorText}>{errors.message.message}</Text>
            )}
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            {paymentMethodsLoading ? (
              <Text style={styles.loadingText}>Loading payment methods...</Text>
            ) : paymentMethods.length === 0 ? (
              <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={() => navigation.navigate('PaymentMethods')}
              >
                <Icon name="plus" size={24} color={COLORS.primary} />
                <Text style={styles.addPaymentText}>Add payment method</Text>
              </TouchableOpacity>
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPayment === method.id && styles.paymentMethodSelected,
                  ]}
                  onPress={() => handleSelectPayment(method.id)}
                >
                  <Icon
                    name={
                      method.icon as React.ComponentProps<typeof Icon>['name']
                    }
                    size={24}
                    color={
                      selectedPayment === method.id
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    {method.lastFour && (
                      <Text style={styles.paymentDetails}>
                        •••• {method.lastFour}
                      </Text>
                    )}
                  </View>
                  {selectedPayment === method.id && (
                    <Icon name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Moment price</Text>
              <Text style={styles.summaryValue}>${moment.price}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service fee</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${moment.price}</Text>
            </View>
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (!recipientEmail || loading) && styles.purchaseButtonDisabled,
            ]}
            onPress={handleSubmit(onPurchase)}
            disabled={!recipientEmail || loading}
          >
            <Text style={styles.purchaseButtonText}>
              {loading ? 'Sending Gift...' : `Send Gift • $${moment.price}`}
            </Text>
          </TouchableOpacity>
          {recipientEmail && (
            <Text style={styles.paymentHint}>
              Secure payment processing. Your information is protected.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  momentPreview: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  momentImage: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    marginRight: SPACING.md,
  },
  momentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  momentTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  momentLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  momentPrice: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentDetails: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summary: {
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.text,
  },
  summaryTotal: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.primary,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  purchaseButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  purchaseButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  giftPreview: {
    width: '100%',
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
  },
  giftImage: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    marginRight: SPACING.md,
  },
  giftDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  giftTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  giftPrice: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.primary,
  },
  messagePreview: {
    width: '100%',
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADII.md,
    marginBottom: SPACING.xl,
  },
  messageText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
  successActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  shareButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  loadingWarning: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  loadingWarningText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  paymentHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.md,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary + '10',
  },
  addPaymentText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});
