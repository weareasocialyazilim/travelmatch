/**
 * CheckoutScreen - Premium Checkout Experience
 *
 * Awwwards-quality checkout with:
 * - Liquid Glass moment summary card
 * - Neon-accented payment method selector
 * - Trust indicators (Escrow badge)
 * - Premium typography hierarchy
 *
 * Design Philosophy:
 * - Clarity for 40+ demographic (readable prices, clear CTAs)
 * - Aesthetic for GenZ (glass effects, neon accents)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticManager } from '@/services/HapticManager';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { usePayments } from '@/hooks/usePayments';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { PaymentSecurityBadge } from '../components/PaymentSecurityBadge';
import { NetworkGuard } from '@/components/NetworkGuard';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank';
  name: string;
  last4?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<CheckoutRouteProp>();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<string>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    momentId,
    amount,
    recipientId: _recipientId,
    recipientName,
    title: momentTitle,
  } = route.params || {};

  const {
    cards,
    balance,
    refreshBalance,
    createPaymentIntent,
    confirmPayment,
  } = usePayments();

  // Refresh balance on mount for wallet payments
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Build payment methods list
  const cardMethods: PaymentMethod[] = cards.map((card) => ({
    id: card.id,
    type: 'card' as const,
    name: card.brand || 'Card',
    last4: card.last4,
    icon: 'card-outline',
  }));

  const methods: PaymentMethod[] = [
    {
      id: 'wallet',
      type: 'wallet',
      name: 'TravelMatch Wallet',
      icon: 'wallet-outline',
    },
    ...cardMethods,
    ...(cardMethods.length === 0
      ? [
          {
            id: 'card-1',
            type: 'card' as const,
            name: 'Visa',
            last4: '4242',
            icon: 'card-outline' as const,
          },
        ]
      : []),
  ];

  // Double-tap protection ref - prevents multiple submissions even if state update is slow
  const isSubmittingRef = useRef(false);

  // Payment timeout constant (30 seconds)
  const PAYMENT_TIMEOUT_MS = 30000;

  // Helper to create timeout promise
  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), ms),
      ),
    ]);
  };

  // Get user-friendly error message based on error type
  const getErrorMessage = (error: unknown): string => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage === 'TIMEOUT') {
      return 'İşlem zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.';
    }
    if (
      errorMessage.toLowerCase().includes('insufficient') ||
      errorMessage.toLowerCase().includes('yetersiz')
    ) {
      return 'Yetersiz bakiye. Lütfen cüzdanınıza para yükleyin.';
    }
    if (
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch')
    ) {
      return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
    }
    if (
      errorMessage.toLowerCase().includes('declined') ||
      errorMessage.toLowerCase().includes('reddedildi')
    ) {
      return 'Ödeme reddedildi. Lütfen farklı bir ödeme yöntemi deneyin.';
    }
    return 'Ödeme başarısız oldu. Lütfen tekrar deneyin.';
  };

  const handlePayment = useCallback(async () => {
    // Double-tap protection: check ref immediately before any async work
    if (isSubmittingRef.current) {
      logger.warn('[Checkout] Double-tap prevented');
      return;
    }
    if (!selectedMethod || isProcessing || !momentId) return;

    // Pre-validation: Check wallet balance if wallet is selected
    if (selectedMethod === 'wallet') {
      const walletBalance = balance?.available ?? 0;
      const paymentAmount = amount ?? 0;

      if (walletBalance < paymentAmount) {
        HapticManager.error();
        Alert.alert(
          'Yetersiz Bakiye',
          `Cüzdan bakiyeniz (${formatCurrency(walletBalance)}) ödeme tutarından (${formatCurrency(paymentAmount)}) az. Lütfen cüzdanınıza para yükleyin veya farklı bir ödeme yöntemi seçin.`,
          [{ text: 'Tamam', style: 'default' }],
        );
        return;
      }
    }

    // Lock submission immediately
    isSubmittingRef.current = true;
    setIsProcessing(true);
    HapticManager.buttonPress();

    try {
      // Create payment intent with timeout protection
      const paymentIntent = await withTimeout(
        createPaymentIntent(momentId, amount || 0),
        PAYMENT_TIMEOUT_MS,
      );

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with timeout protection
      const success = await withTimeout(
        confirmPayment(paymentIntent.id, selectedMethod),
        PAYMENT_TIMEOUT_MS,
      );

      if (!success) {
        throw new Error('Payment confirmation failed');
      }

      HapticManager.success();
      navigation.navigate('Success', {
        type: 'payment',
        title: 'Ödeme Başarılı',
        subtitle: `${formatCurrency(amount || 0)} tutarında hediye gönderildi`,
      });
    } catch (paymentError) {
      logger.error('[Checkout] Payment failed', {
        error: paymentError,
        momentId,
        amount,
      });
      HapticManager.error();

      const userFriendlyMessage = getErrorMessage(paymentError);
      navigation.navigate('PaymentFailed', {
        error: userFriendlyMessage,
      });
    } finally {
      setIsProcessing(false);
      isSubmittingRef.current = false; // Release lock
    }
  }, [
    selectedMethod,
    amount,
    momentId,
    balance,
    createPaymentIntent,
    confirmPayment,
    navigation,
    isProcessing,
    formatCurrency,
  ]);

  return (
    <NetworkGuard offlineMessage="Ödeme yapmak için internet bağlantısı gerekli">
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ödeme Detayları</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Moment Summary Card - Liquid Glass */}
          <GlassCard intensity={15} tint="light" style={styles.momentSummary}>
            <Text style={styles.summaryLabel}>DENEYİM</Text>
            <Text style={styles.summaryTitle}>
              {momentTitle || recipientName || 'Premium Moment'}
            </Text>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.summaryLabel}>TOPLAM TUTAR</Text>
              <Text style={styles.totalPrice}>
                {formatCurrency(amount || 0)}
              </Text>
            </View>
          </GlassCard>

          {/* Security Badge - Trust Indicator */}
          <View style={styles.section}>
            <PaymentSecurityBadge mode="ESCROW" />
          </View>

          {/* Payment Method Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ÖDEME YÖNTEMİ</Text>

            {methods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodSelector,
                  selectedMethod === method.id && styles.methodSelectorActive,
                ]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.methodLeft}>
                  <View
                    style={[
                      styles.cardIcon,
                      selectedMethod === method.id && styles.cardIconActive,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={20}
                      color={
                        selectedMethod === method.id
                          ? COLORS.primary
                          : COLORS.text.secondary
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.methodText}>{method.name}</Text>
                    {method.last4 && (
                      <Text style={styles.methodSubtext}>
                        •••• {method.last4}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Radio Button */}
                <View
                  style={[
                    styles.radioButton,
                    selectedMethod === method.id && styles.radioButtonActive,
                  ]}
                >
                  {selectedMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add New Method */}
            <TouchableOpacity
              style={styles.addMethodButton}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.addMethodText}>Yeni Yöntem Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Note */}
          <Text style={styles.legalNote}>
            "Öde" butonuna basarak Kullanım Koşullarını ve İptal Politikasını
            kabul etmiş sayılırsınız.
          </Text>
        </ScrollView>

        {/* Footer - Pay Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButtonGradient}
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color={COLORS.white} />
                  <Text style={styles.payButtonText}>
                    Şimdi Öde • {formatCurrency(amount || 0)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.securityText}>
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={COLORS.trust.primary}
            />{' '}
            256-bit SSL ile şifrelenmiş güvenli ödeme
          </Text>
        </View>
      </View>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Moment Summary - Liquid Glass
  momentSummary: {
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontFamily: FONTS.mono.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.h3,
    color: COLORS.text.primary,
    fontFamily: FONTS.display.bold,
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 28,
    color: COLORS.primary,
    fontFamily: FONTS.mono.medium,
    fontWeight: '900',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    color: COLORS.text.muted,
    fontFamily: FONTS.mono.medium,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Method Selector
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface.base,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: 8,
  },
  methodSelectorActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  methodText: {
    color: COLORS.text.primary,
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.body,
  },
  methodSubtext: {
    color: COLORS.text.muted,
    fontFamily: FONTS.mono.regular,
    fontSize: FONT_SIZES.caption,
    marginTop: 2,
  },

  // Radio Button
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Add Method
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addMethodText: {
    color: COLORS.primary,
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.bodySmall,
  },

  // Legal Note
  legalNote: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    fontFamily: FONTS.body.regular,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingTop: 16,
  },
  payButton: {
    borderRadius: 32,
    overflow: 'hidden',
    // Neon glow effect
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    gap: 10,
  },
  payButtonText: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: '800',
    color: COLORS.white,
    fontFamily: FONTS.body.bold,
  },
  securityText: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: FONTS.body.regular,
  },
});

export default withErrorBoundary(CheckoutScreen, {
  displayName: 'CheckoutScreen',
});
