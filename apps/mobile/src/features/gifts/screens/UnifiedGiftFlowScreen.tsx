/**
 * Unified Gift Flow Screen
 * Single screen replacing modal chain for smoother UX
 * Replaces: GiftBottomSheet → PaymentSheet → SuccessModal → ShareModal
 *
 * UPDATED: Moment creator sets the price, giver accepts it
 * - Amount is read-only, set by moment creator
 * - No slider or price modification UI
 * - Shows clear "Bu anıya [X] miktarında [Y] para birimiyle destek ol" message
 *
 * Updated with:
 * - Dynamic proof requirements based on gift amount
 * - PayTR integration for Turkish payment processing
 * - Commission calculation and display
 * - KVKK compliant consent collection
 * - Supabase Realtime for PayTR webhook sync (no page refresh needed)
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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
import { sendGiftSchema, type SendGiftInput } from '@/utils/forms/schemas';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { NetworkGuard } from '@/components/NetworkGuard';
import { GiftCelebration } from '@/features/gifts/components';
import { COLORS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADII } from '@/features/payments/constants/radii';
import { SPACING } from '@/features/payments/constants/spacing';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useHaptics } from '@/hooks/useHaptics';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { Moment } from '@/features/payments/types';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  getProofTier,
  ProofRequirementBadge,
  ProofSelectionCard,
  DirectPayIndicator,
  ProofRequiredIndicator,
  PaymentSummaryWithProof,
} from '@/features/payments/components/ProofRequirementComponents';

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  name: string;
  icon: string;
  lastFour?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Credit Card',
    icon: 'credit-card',
    lastFour: '4242',
  },
  {
    id: '2',
    type: 'apple_pay',
    name: 'Apple Pay',
    icon: 'apple',
  },
  {
    id: '3',
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
  const {
    recipientId,
    recipientName,
    momentId,
    momentTitle,
    momentImageUrl,
    requestedAmount,
    requestedCurrency,
  } = route.params;

  // The moment with creator-set price (read-only)
  const moment: Moment = useMemo(
    () => ({
      id: momentId,
      title: momentTitle,
      story: '',
      imageUrl: momentImageUrl || '',
      price: requestedAmount,
      currency: requestedCurrency,
      availability: '',
      location: { name: '', city: '', country: '' },
      user: { name: recipientName, avatar: '' },
    }),
    [
      momentId,
      momentTitle,
      momentImageUrl,
      requestedAmount,
      requestedCurrency,
      recipientName,
    ],
  );

  const [_selectedRecipient, _setSelectedRecipient] = useState<string>(
    recipientId || '',
  );
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS[0].id,
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submittedData, setSubmittedData] = useState<SendGiftInput | null>(
    null,
  );

  // Dynamic proof requirement state
  const [requestProof, setRequestProof] = useState<boolean | null>(null);
  const [paymentConsent, setPaymentConsent] = useState(false);
  const [commissionData, _setCommissionData] = useState<{
    giverPays: number;
    receiverGets: number;
    commission: number;
  } | null>(null);

  // PayTR Realtime webhook sync - transaction ID for subscription
  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  // Calculate proof tier based on moment price
  const proofTier = useMemo(() => getProofTier(moment.price), [moment.price]);

  // Determine if this is direct pay or escrow
  const isDirectPay = useMemo(() => {
    if (proofTier.requirement === 'none') return true;
    if (proofTier.requirement === 'optional' && requestProof === false)
      return true;
    return false;
  }, [proofTier.requirement, requestProof]);

  // Currency symbol for display
  const currencySymbol = useMemo(
    () => CURRENCY_SYMBOLS[requestedCurrency] || requestedCurrency,
    [requestedCurrency],
  );

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

  /**
   * Supabase Realtime Subscription for PayTR Webhook
   * When PayTR webhook updates the transaction to 'success',
   * this triggers the celebration without page refresh.
   */
  useEffect(() => {
    if (!pendingTransactionId || !loading) return;

    const channel = supabase
      .channel(`gift-payment-${pendingTransactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${pendingTransactionId}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          logger.info('[UnifiedGiftFlow] Transaction update received', {
            transactionId: pendingTransactionId,
            newStatus,
          });

          if (newStatus === 'success' || newStatus === 'completed') {
            // PayTR webhook confirmed - show celebration!
            setLoading(false);
            setShowCelebration(true);
            impact('success');

            trackEvent('gift_payment_webhook_success', {
              transactionId: pendingTransactionId,
              momentId: moment.id,
            });
          } else if (newStatus === 'failed' || newStatus === 'voided') {
            // Payment failed
            setLoading(false);
            impact('error');
            // TODO: Show error modal
            logger.error('[UnifiedGiftFlow] Payment failed via webhook', {
              transactionId: pendingTransactionId,
              status: newStatus,
            });
          }
        },
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [pendingTransactionId, loading, impact, trackEvent, moment.id]);

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
  const onPurchase = useCallback(
    async (data: SendGiftInput) => {
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
        // TODO: Replace with actual PayTR API call
        // const { transactionId } = await paytrService.initiatePayment({
        //   momentId: moment.id,
        //   amount: moment.price,
        //   currency: moment.currency,
        //   recipientId,
        //   message: data.message,
        // });

        // Mock transaction ID for realtime subscription
        const mockTransactionId = `txn_${Date.now()}`;
        setPendingTransactionId(mockTransactionId);

        logger.info(
          '[UnifiedGiftFlow] Payment initiated, waiting for webhook',
          {
            transactionId: mockTransactionId,
            momentId: moment.id,
          },
        );

        // In production: PayTR iframe opens, user completes payment
        // PayTR webhook fires → Supabase Realtime triggers → celebration shows

        // For development: simulate webhook after 2 seconds
        if (__DEV__) {
          setTimeout(() => {
            setLoading(false);
            setShowCelebration(true);
            impact('success');

            trackInteraction('gift_completed', {
              momentId: moment.id,
              price: moment.price,
              paymentMethod: selectedPayment,
            });

            trackEvent('gift_purchase_completed', {
              momentId: moment.id,
              price: moment.price,
            });
          }, 2000);
        }
      } catch (error) {
        logger.error('[UnifiedGiftFlow] Payment initiation failed', error);
        setLoading(false);
        impact('error');
        // TODO: Show error toast
      }
    },
    [
      moment,
      selectedPayment,
      recipientId,
      impact,
      trackEvent,
      trackInteraction,
    ],
  );

  // Handle celebration close - transition to success screen
  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false);
    setSuccess(true);
  }, []);

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

  // Celebration modal
  if (showCelebration) {
    return (
      <GiftCelebration
        visible={showCelebration}
        recipientName={recipientName || submittedData?.recipientEmail || 'User'}
        giftAmount={requestedAmount}
        currency={currencySymbol}
        momentTitle={momentTitle}
        onClose={handleCelebrationClose}
      />
    );
  }

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
            <Icon
              name="check-circle"
              size={80}
              color={COLORS.feedback.success}
            />
          </View>

          <Text style={styles.successTitle}>Gift Sent! 🎁</Text>
          <Text style={styles.successSubtitle}>
            Your gift has been sent to {submittedData?.recipientEmail}
          </Text>

          {/* Gift Preview */}
          <View style={styles.giftPreview}>
            <Image source={{ uri: moment.imageUrl }} style={styles.giftImage} />
            <View style={styles.giftDetails}>
              <Text style={styles.giftTitle}>{momentTitle}</Text>
              <Text style={styles.giftPrice}>
                {currencySymbol}
                {requestedAmount}
              </Text>
            </View>
          </View>

          {/* Message Preview */}
          {submittedData?.message && (
            <View style={styles.messagePreview}>
              <Icon
                name="message-text"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.messageText}>{submittedData.message}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.successActions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Icon
                name="share-variant"
                size={20}
                color={COLORS.utility.white}
              />
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
      <NetworkGuard offlineMessage="İnternet bağlantısı gerekli. Ödeme yapmak için lütfen bağlanın.">
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
              <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gift this Moment</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Moment Preview with Fixed Price */}
            <View style={styles.momentPreview}>
              <Image
                source={{ uri: moment.imageUrl }}
                style={styles.momentImage}
              />
              <View style={styles.momentInfo}>
                <Text style={styles.momentTitle} numberOfLines={2}>
                  {momentTitle}
                </Text>
                <Text style={styles.momentLocation}>
                  {moment.location?.city || 'Unknown Location'}
                </Text>
              </View>
            </View>

            {/* Creator-Set Price Display (Read-Only) */}
            <View style={styles.fixedPriceSection}>
              <View style={styles.fixedPriceHeader}>
                <Icon
                  name="gift-outline"
                  size={24}
                  color={COLORS.brand.primary}
                />
                <Text style={styles.fixedPriceLabel}>
                  İstenen Hediye Miktarı
                </Text>
              </View>
              <Text style={styles.fixedPriceAmount}>
                {currencySymbol}
                {requestedAmount.toLocaleString()}
              </Text>
              <Text style={styles.fixedPriceHint}>
                {recipientName} bu anı için {currencySymbol}
                {requestedAmount} hediye talep ediyor.
              </Text>
            </View>

            {/* Chat Eligibility Notice - MASTER UX: 30 altı uyarısı */}
            {requestedAmount < 30 && (
              <View style={styles.chatEligibilityNotice}>
                <Icon name="information-outline" size={20} color="#7B61FF" />
                <View style={styles.chatEligibilityContent}>
                  <Text style={styles.chatEligibilityTitle}>
                    Destek Amaçlı Hediye
                  </Text>
                  <Text style={styles.chatEligibilityText}>
                    Bu miktar sohbet başlatmak için yeterli değildir. Hediyeniz,
                    içerik üreticisine destek olacak ve toplu teşekkür mesajına
                    dahil edilecektir.
                  </Text>
                  <Text style={styles.chatEligibilityHint}>
                    💬 Sohbet için minimum: $30
                  </Text>
                </View>
              </View>
            )}

            {/* Chat Candidate Notice - 30-100$ */}
            {requestedAmount >= 30 && requestedAmount < 100 && (
              <View
                style={[
                  styles.chatEligibilityNotice,
                  styles.chatCandidateNotice,
                ]}
              >
                <Icon name="message-badge-outline" size={20} color="#7B61FF" />
                <View style={styles.chatEligibilityContent}>
                  <Text style={styles.chatEligibilityTitle}>
                    Sohbet Şansı Var
                  </Text>
                  <Text style={styles.chatEligibilityText}>
                    Bu hediyeyle birlikte içerik üreticisine sohbet daveti
                    gönderilecek. Karşı taraf onaylarsa özel sohbet
                    başlatabilirsiniz.
                  </Text>
                </View>
              </View>
            )}

            {/* Premium Notice - 100$+ */}
            {requestedAmount >= 100 && (
              <View
                style={[styles.chatEligibilityNotice, styles.premiumChatNotice]}
              >
                <Icon name="crown" size={20} color="#FFB800" />
                <View style={styles.chatEligibilityContent}>
                  <Text
                    style={[styles.chatEligibilityTitle, { color: '#996B00' }]}
                  >
                    Premium Bağlantı
                  </Text>
                  <Text style={styles.chatEligibilityText}>
                    Premium hediyeniz öne çıkarılacak ve sohbet isteğiniz yüksek
                    öncelikle iletilecek.
                  </Text>
                </View>
              </View>
            )}

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
                    placeholderTextColor={COLORS.text.tertiary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.recipientEmail && (
                <Text style={styles.errorText}>
                  {errors.recipientEmail.message}
                </Text>
              )}
            </View>

            {/* Message Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Personal message (optional)
              </Text>
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add a personal message..."
                    placeholderTextColor={COLORS.text.tertiary}
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
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPayment === method.id &&
                      styles.paymentMethodSelected,
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
                        ? COLORS.brand.primary
                        : COLORS.text.secondary
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
                    <Icon
                      name="check-circle"
                      size={24}
                      color={COLORS.brand.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Proof Requirement Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Teslimat Yöntemi</Text>
                <ProofRequirementBadge
                  amount={requestedAmount}
                  currency={requestedCurrency}
                />
              </View>

              {proofTier.requirement === 'none' && (
                <DirectPayIndicator
                  amount={requestedAmount}
                  currency={requestedCurrency}
                />
              )}

              {proofTier.requirement === 'optional' && (
                <ProofSelectionCard
                  amount={requestedAmount}
                  currency={requestedCurrency}
                  onSelect={setRequestProof}
                  selectedOption={requestProof}
                />
              )}

              {proofTier.requirement === 'required' && (
                <ProofRequiredIndicator
                  amount={requestedAmount}
                  currency={requestedCurrency}
                />
              )}
            </View>

            {/* Summary with Proof */}
            <PaymentSummaryWithProof
              amount={requestedAmount}
              currency={requestedCurrency}
              commission={commissionData?.commission || 0}
              receiverGets={commissionData?.receiverGets || requestedAmount}
              proofRequired={
                proofTier.requirement === 'required' || requestProof === true
              }
              isDirectPay={isDirectPay}
              receiverName={recipientName}
            />

            {/* Payment Consent */}
            <TouchableOpacity
              style={styles.consentRow}
              onPress={() => setPaymentConsent(!paymentConsent)}
            >
              <View
                style={[
                  styles.checkbox,
                  paymentConsent && styles.checkboxChecked,
                ]}
              >
                {paymentConsent && (
                  <Icon name="check" size={14} color={COLORS.utility.white} />
                )}
              </View>
              <Text style={styles.consentText}>
                Ödeme yapmadan önce{' '}
                <Text style={styles.consentLink}>
                  Mesafeli Satış Sözleşmesi
                </Text>{' '}
                ve <Text style={styles.consentLink}>KVKK Aydınlatma Metni</Text>
                'ni okudum ve kabul ediyorum.
              </Text>
            </TouchableOpacity>

            {/* Purchase Button */}
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!recipientEmail ||
                  loading ||
                  !paymentConsent ||
                  (proofTier.requirement === 'optional' &&
                    requestProof === null)) &&
                  styles.purchaseButtonDisabled,
              ]}
              onPress={handleSubmit(onPurchase)}
              disabled={
                !recipientEmail ||
                loading ||
                !paymentConsent ||
                (proofTier.requirement === 'optional' && requestProof === null)
              }
            >
              <Text style={styles.purchaseButtonText}>
                {loading
                  ? 'Hediye Gönderiliyor...'
                  : `Hediye Gönder • ${currencySymbol}${commissionData?.giverPays || requestedAmount}`}
              </Text>
            </TouchableOpacity>
            {recipientEmail && (
              <Text style={styles.paymentHint}>
                {isDirectPay
                  ? 'Para anında alıcıya aktarılacaktır.'
                  : 'Para, kanıt onaylanana kadar güvenli emanette tutulacaktır.'}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </NetworkGuard>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.utility.white,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
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
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  momentLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  momentPrice: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.brand.primary,
  },
  // Fixed Price Section (Creator-Set Price)
  fixedPriceSection: {
    backgroundColor: primitives.stone[50],
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
    alignItems: 'center',
  },
  fixedPriceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  fixedPriceLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  fixedPriceAmount: {
    ...TYPOGRAPHY.h1,
    fontWeight: '800',
    color: COLORS.brand.primary,
    marginBottom: SPACING.xs,
  },
  fixedPriceHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Chat Eligibility Notices
  chatEligibilityNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 97, 255, 0.08)',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 97, 255, 0.2)',
    gap: SPACING.sm,
  },
  chatCandidateNotice: {
    backgroundColor: 'rgba(123, 97, 255, 0.12)',
    borderColor: 'rgba(123, 97, 255, 0.3)',
  },
  premiumChatNotice: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  chatEligibilityContent: {
    flex: 1,
  },
  chatEligibilityTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: '#7B61FF',
    marginBottom: SPACING.xs,
  },
  chatEligibilityText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  chatEligibilityHint: {
    ...TYPOGRAPHY.caption,
    color: '#7B61FF',
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADII.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
    backgroundColor: COLORS.utility.white,
  },
  textArea: {
    minHeight: 80,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADII.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.utility.white,
  },
  paymentMethodSelected: {
    borderColor: COLORS.brand.primary,
    borderWidth: 2,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  paymentDetails: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  purchaseButton: {
    backgroundColor: COLORS.brand.primary,
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
    color: COLORS.utility.white,
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
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  giftPreview: {
    width: '100%',
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  giftPrice: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.brand.primary,
  },
  messagePreview: {
    width: '100%',
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: primitives.stone[50],
    borderRadius: RADII.md,
    marginBottom: SPACING.xl,
  },
  messageText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  shareButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 4,
  },
  loadingWarning: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.feedback.warning + '20',
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.feedback.warning,
  },
  loadingWarningText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.feedback.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  paymentHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  consentText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  consentLink: {
    color: COLORS.brand.primary,
    textDecorationLine: 'underline',
  },
});
