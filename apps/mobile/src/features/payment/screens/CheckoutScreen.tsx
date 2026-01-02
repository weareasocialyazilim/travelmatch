import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image as _Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { usePayments } from '@/hooks/usePayments';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank';
  name: string;
  last4?: string;
  icon: string;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<CheckoutRouteProp>();
  const [selectedMethod, setSelectedMethod] = useState<string>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  const { momentId, amount, recipientId, recipientName } = route.params || {};

  const { processPayment, paymentMethods } = usePayments();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const defaultPaymentMethods: PaymentMethod[] = [
    {
      id: 'wallet',
      type: 'wallet',
      name: 'TravelMatch Wallet',
      icon: 'wallet',
    },
    {
      id: 'card-1',
      type: 'card',
      name: 'Visa',
      last4: '4242',
      icon: 'credit-card',
    },
  ];

  const methods = paymentMethods || defaultPaymentMethods;

  const handlePayment = useCallback(async () => {
    if (!selectedMethod || isProcessing) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await processPayment({
        amount: amount || 0,
        paymentMethodId: selectedMethod,
        momentId,
        recipientId,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Success', {
        type: 'payment',
        title: 'Payment Successful',
        subtitle: `You sent ${formatCurrency(amount || 0)} to ${recipientName}`,
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      navigation.navigate('PaymentFailed', {
        error: 'Payment failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedMethod,
    amount,
    momentId,
    recipientId,
    recipientName,
    processPayment,
    navigation,
    isProcessing,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Gift Amount</Text>
              <Text style={styles.orderValue}>
                {formatCurrency(amount || 0)}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Service Fee</Text>
              <Text style={styles.orderValue}>{formatCurrency(0)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.orderRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(amount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recipient */}
        {recipientName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sending to</Text>
            <View style={styles.recipientCard}>
              <View style={styles.recipientAvatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={28}
                  color={COLORS.text.secondary}
                />
              </View>
              <Text style={styles.recipientName}>{recipientName}</Text>
            </View>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={styles.addMethodText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodIcon}>
                <MaterialCommunityIcons
                  name={
                    method.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color={
                    selectedMethod === method.id
                      ? COLORS.brand.primary
                      : COLORS.text.secondary
                  }
                />
              </View>
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>{method.name}</Text>
                {method.last4 && (
                  <Text style={styles.methodLast4}>**** {method.last4}</Text>
                )}
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButtonGradient}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="lock" size={20} color="#fff" />
                <Text style={styles.payButtonText}>
                  Pay {formatCurrency(amount || 0)}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.securityText}>
          Your payment is secured with encryption
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  addMethodText: {
    fontSize: 14,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  orderValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedMethod: {
    borderColor: COLORS.brand.primary,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  methodLast4: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.text.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.brand.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brand.primary,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  securityText: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default withErrorBoundary(CheckoutScreen, { displayName: 'CheckoutScreen' });
