/**
 * UnifiedGiftFlowScreen - Moment Ödeme Akışı
 *
 * Bu ekran kullanıcıların:
 * - Bir moment'a katılmak için host'a ödeme yapmasını sağlar
 * - IAP coin satın alma akışı ile çalışır
 * - Kullanıcılar arası direkt ödeme yoktur
 *
 * NOT: Bu "arkadaşa hediye" değil, moment'a katılım ödemesidir.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticManager } from '@/services/HapticManager';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { PaymentSecurityBadge } from '../components/PaymentSecurityBadge';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

type UnifiedGiftFlowRouteProp = RouteProp<
  RootStackParamList,
  'UnifiedGiftFlow'
>;

const UnifiedGiftFlowScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<UnifiedGiftFlowRouteProp>();
  const insets = useSafeAreaInsets();

  const {
    recipientId: _hostId,
    recipientName: hostName,
    momentId,
    momentTitle,
    requestedAmount,
    requestedCurrency,
  } = route.params || {};

  const [messageToHost, setMessageToHost] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number, currency: string = 'TRY') => {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
    };
    return `${currencySymbols[currency] || currency} ${value.toLocaleString('tr-TR')}`;
  };

  const handleBack = useCallback(() => {
    HapticManager.buttonPress();
    navigation.goBack();
  }, [navigation]);

  const handleProceedToPayment = useCallback(async () => {
    HapticManager.buttonPress();
    setIsProcessing(true);

    try {
      // APPLE IAP COMPLIANT: Redirect to Coin Store for LVND purchase
      // Moments are paid with pre-purchased LVND coins, not direct credit card
      navigation.navigate('CoinStore');
      // After user has coins, they can return and complete the moment join
    } catch (error) {
      logger.error('UnifiedGiftFlow', 'Navigation failed', { error });
      HapticManager.error();
      navigation.navigate('PaymentFailed', {
        error: 'İşlem başlatılamadı. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moment'a Katıl</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Moment Summary Card */}
          <GlassCard style={styles.momentCard}>
            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle}>{momentTitle || 'Moment'}</Text>
              <Text style={styles.hostLabel}>
                Ev Sahibi:{' '}
                <Text style={styles.hostName}>{hostName || 'Host'}</Text>
              </Text>
            </View>

            <LinearGradient
              colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
              style={styles.priceTag}
            >
              <Text style={styles.priceText}>
                {formatCurrency(requestedAmount || 0, requestedCurrency)}
              </Text>
            </LinearGradient>
          </GlassCard>

          {/* Message to Host Section */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={COLORS.primary}
              />
              {'  '}Host'a Mesaj (Opsiyonel)
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Katılım hakkında bir not ekleyin..."
              placeholderTextColor={COLORS.text.muted}
              value={messageToHost}
              onChangeText={setMessageToHost}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{messageToHost.length}/200</Text>
          </View>

          {/* Security Badge - Escrow Guarantee */}
          <View style={styles.securitySection}>
            <PaymentSecurityBadge mode="ESCROW" />
          </View>

          {/* Order Summary */}
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Moment Katılım Ücreti</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(requestedAmount || 0, requestedCurrency)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Hizmet Bedeli</Text>
              <Text style={styles.summaryValue}>₺0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Toplam Tutar</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(requestedAmount || 0, requestedCurrency)}
              </Text>
            </View>
          </GlassCard>

          {/* Escrow Info */}
          <View style={styles.infoBox}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={COLORS.trust.primary}
            />
            <Text style={styles.infoText}>
              Ödemeniz escrow hesabında güvende tutulur. Moment tamamlandıktan
              sonra host'a aktarılır. Sorun yaşarsanız iade talep edebilirsiniz.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handleProceedToPayment}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
              style={styles.payButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="card" size={20} color={COLORS.white} />
                  <Text style={styles.payButtonText}>
                    Güvenli Ödeme Yap •{' '}
                    {formatCurrency(requestedAmount || 0, requestedCurrency)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.bodyLarge,
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
  },
  momentInfo: {
    flex: 1,
    marginRight: 12,
  },
  momentTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  hostLabel: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.text.secondary,
  },
  hostName: {
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  priceTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    fontFamily: FONTS.mono.medium,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
  messageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  charCount: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  securitySection: {
    marginBottom: 20,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h5,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontFamily: FONTS.mono.medium,
    fontSize: FONT_SIZES.h5,
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: COLORS.trust.muted,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  payButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  payButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
});

export default UnifiedGiftFlowScreen;
