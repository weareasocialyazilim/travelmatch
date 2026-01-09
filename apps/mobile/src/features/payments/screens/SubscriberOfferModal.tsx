/**
 * SubscriberOfferModal - Premium/Platinum Kullanıcı Teklif Ekranı
 *
 * Premium üyeler host'lara özel teklif gönderebilir.
 * Sistem:
 * - Kullanıcı istediği fiyatı teklif eder (minimum veya üstü)
 * - Host teklifi kabul veya reddeder
 * - Kabul edilirse ödeme akışına geçilir
 *
 * NOT: Bu bir "indirim" sistemi DEĞİL, pazarlık/teklif sistemidir.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '../hooks/usePayments';
import { supabase } from '@/services/supabase';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

type SubscriberOfferModalRouteProp = RouteProp<
  RootStackParamList,
  'SubscriberOfferModal'
>;

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

const SubscriberOfferModal: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<SubscriberOfferModalRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { subscription } = useSubscription();

  const {
    momentId,
    momentTitle,
    momentCategory,
    targetValue,
    targetCurrency,
    hostId,
    hostName,
  } = route.params || {};

  const [offerAmount, setOfferAmount] = useState<string>(
    String(targetValue || 0),
  );
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;

  // Premium/Platinum üyeler teklif gönderebilir
  const canMakeOffer = useMemo(() => {
    const tier = subscription?.tier || 'free';
    return tier === 'premium' || tier === 'platinum';
  }, [subscription?.tier]);

  // Teklif geçerli mi? (0'dan büyük olmalı)
  const isValidOffer = useMemo(() => {
    const offer = parseFloat(offerAmount) || 0;
    return offer > 0;
  }, [offerAmount]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleSubmitOffer = useCallback(async () => {
    if (!isValidOffer || !user || !canMakeOffer) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      // Teklifi Supabase'e kaydet
      const { error } = await supabase.from('moment_offers').insert({
        moment_id: momentId,
        subscriber_id: user.id,
        host_id: hostId,
        offer_amount: parseFloat(offerAmount),
        original_amount: targetValue,
        currency: targetCurrency,
        message: offerMessage.trim() || null,
        status: 'pending',
        subscription_tier: subscription?.tier || 'free',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Başarı ekranına git
      navigation.navigate('Success', {
        type: 'offer',
        title: t('counterOffer.successTitle'),
        subtitle: t('counterOffer.successSubtitle', { hostName: hostName || 'Host' }),
      });
    } catch (error) {
      logger.error('SubscriberOfferModal', 'Failed to submit offer', { error });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isValidOffer,
    user,
    canMakeOffer,
    momentId,
    hostId,
    offerAmount,
    targetValue,
    targetCurrency,
    offerMessage,
    subscription?.tier,
    hostName,
    navigation,
  ]);

  const tierLabel = subscription?.tier === 'platinum' ? 'Platinum' : 'Premium';
  const tierColor =
    subscription?.tier === 'platinum' ? COLORS.platinum : COLORS.primary;

  const handleViewPlans = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
    // Navigate to subscription plans screen
    setTimeout(() => {
      navigation.navigate('SubscriptionPlans' as never);
    }, 300);
  }, [navigation]);

  // Show upgrade gate for non-premium users
  if (!canMakeOffer) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('counterOffer.title')}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Upgrade Required Gate */}
        <View style={styles.upgradeGate}>
          <LinearGradient
            colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
            style={styles.upgradeIconContainer}
          >
            <MaterialCommunityIcons name="crown" size={48} color={COLORS.white} />
          </LinearGradient>

          <Text style={styles.upgradeTitle}>
            {t('counterOffer.upgradeRequired.title')}
          </Text>
          <Text style={styles.upgradeDescription}>
            {t('counterOffer.upgradeRequired.description')}
          </Text>

          <TouchableOpacity style={styles.upgradeButton} onPress={handleViewPlans}>
            <LinearGradient
              colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
              style={styles.upgradeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="rocket" size={20} color={COLORS.white} />
              <Text style={styles.upgradeButtonText}>
                {t('counterOffer.upgradeRequired.upgradeButton')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.maybeLaterButton} onPress={handleClose}>
            <Text style={styles.maybeLaterText}>
              {t('counterOffer.upgradeRequired.maybeLater')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Handle Bar */}
      <View style={styles.handleBar} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('counterOffer.title')}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="star" size={12} color={tierColor} />
            <Text style={[styles.tierText, { color: tierColor }]}>
              {t('counterOffer.tierFeature', { tier: tierLabel })}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Moment Info */}
          <GlassCard style={styles.momentCard}>
            <View style={styles.momentHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{momentCategory}</Text>
              </View>
            </View>
            <Text style={styles.momentTitle} numberOfLines={2}>
              {momentTitle}
            </Text>
            <Text style={styles.hostInfo}>
              {t('counterOffer.momentInfo.hostLabel')} <Text style={styles.hostName}>{hostName}</Text>
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.originalPriceLabel}>{t('counterOffer.momentInfo.askedPrice')}</Text>
              <Text style={styles.originalPrice}>
                {currencySymbol}
                {targetValue?.toLocaleString('tr-TR')}
              </Text>
            </View>
          </GlassCard>

          {/* Offer Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>{t('counterOffer.yourOffer')}</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.amountInput}
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.text.muted}
              />
            </View>
            <Text style={styles.offerHint}>
              {t('counterOffer.offerHint')}
            </Text>
          </View>

          {/* Message Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>{t('counterOffer.messageLabel')}</Text>
            <TextInput
              style={styles.messageInput}
              value={offerMessage}
              onChangeText={setOfferMessage}
              placeholder={t('counterOffer.messagePlaceholder')}
              placeholderTextColor={COLORS.text.muted}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{offerMessage.length}/200</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>
              {t('counterOffer.infoText', { tier: tierLabel })}
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomCta}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValidOffer || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitOffer}
            disabled={!isValidOffer || isSubmitting}
          >
            <LinearGradient
              colors={
                isValidOffer
                  ? (GRADIENTS.gift as readonly [string, string, ...string[]])
                  : ['#666', '#444']
              }
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>
                    {t('counterOffer.submitButton')} • {currencySymbol}
                    {parseFloat(offerAmount) || 0}
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
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h3,
    color: COLORS.text.primary,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tierText: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.bodySmall,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
    marginBottom: 20,
  },
  momentHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.caption,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  momentTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h4,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  hostInfo: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  hostName: {
    fontFamily: FONTS.body.semibold,
    color: COLORS.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  originalPriceLabel: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
  },
  originalPrice: {
    fontFamily: FONTS.mono.medium,
    fontSize: FONT_SIZES.h4,
    color: COLORS.text.primary,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontFamily: FONTS.mono.medium,
    fontSize: FONT_SIZES.h1,
    color: COLORS.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontFamily: FONTS.mono.medium,
    fontSize: FONT_SIZES.h1,
    color: COLORS.text.primary,
    paddingVertical: 16,
  },
  offerHint: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  messageInput: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 16,
    minHeight: 80,
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
  },
  charCount: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.caption,
    color: COLORS.text.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
    gap: 8,
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
    paddingBottom: 16,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  submitButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
  // Upgrade gate styles
  upgradeGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  upgradeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  upgradeTitle: {
    fontFamily: FONTS.display.bold,
    fontSize: FONT_SIZES.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeDescription: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  upgradeButton: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  upgradeButtonText: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },
  maybeLaterButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  maybeLaterText: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
  },
});

export default SubscriberOfferModal;
