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
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '../components/LoadingState';
import { COLORS } from '../constants/colors';
import { RADII } from '../constants/radii';
import { SPACING } from '../constants/spacing';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHaptics } from '../hooks/useHaptics';
import { useScreenPerformance } from '../hooks/useScreenPerformance';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Moment } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';

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
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>(
    PAYMENT_METHODS[0].id,
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
  const handlePurchase = useCallback(() => {
    if (!recipientEmail) {
      alert('Please enter recipient email');
      return;
    }

    setLoading(true);
    void impact('medium');

    trackEvent('gift_purchase_started', {
      momentId: moment.id,
      price: moment.price,
      paymentMethod: selectedPayment,
      hasMessage: !!message,
    });

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
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
      });
    }, 2000);
  }, [
    recipientEmail,
    moment,
    selectedPayment,
    message,
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
      <LoadingState type="overlay" message="Processing your gift purchase..." />
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
            Your gift has been sent to {recipientEmail}
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
          {message && (
            <View style={styles.messagePreview}>
              <Icon
                name="message-text"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.messageText}>{message}</Text>
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
            <TextInput
              style={styles.input}
              placeholder="Recipient's email"
              placeholderTextColor={COLORS.textTertiary}
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Message Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal message (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a personal message..."
              placeholderTextColor={COLORS.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{message.length}/200</Text>
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            {PAYMENT_METHODS.map((method) => (
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
            ))}
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
              !recipientEmail && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={!recipientEmail}
          >
            <Text style={styles.purchaseButtonText}>
              Send Gift • ${moment.price}
            </Text>
          </TouchableOpacity>
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  momentLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  momentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentDetails: {
    fontSize: 14,
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
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
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
    fontSize: 16,
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
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  giftPrice: {
    fontSize: 18,
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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
