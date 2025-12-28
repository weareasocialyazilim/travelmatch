import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { useBiometric } from '@/context/BiometricAuthContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useScreenSecurity } from '@/hooks/useScreenSecurity';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { withdrawSchema, type WithdrawInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import { ControlledInput } from '@/components/ui/ControlledInput';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableBalance = 1250.0;
  const pendingEscrow = 500.0;
  const { biometricEnabled, biometricTypeName, authenticateForAction } =
    useBiometric();
  const { props: a11y, formatCurrency } = useAccessibility();

  // Enable screenshot protection for this sensitive screen
  useScreenSecurity();

  const { control, handleSubmit, formState, watch } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema),
    mode: 'onChange',
    defaultValues: {
      amount: '',
      note: '',
    },
  });

  const _amount = watch('amount');

  const onSubmit = async (data: WithdrawInput) => {
    // Check if biometric is enabled and verify before proceeding
    if (biometricEnabled) {
      const verified = await authenticateForAction('Withdraw Funds');

      if (!verified) {
        Alert.alert(
          'Authentication Required',
          `Please verify with ${biometricTypeName} to withdraw funds.`,
          [{ text: 'OK' }],
        );
        return;
      }
    }

    setIsSubmitting(true);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Navigate to success screen with withdrawal details
    navigation.navigate('Success', {
      type: 'withdraw',
      details: {
        amount: parseFloat(data.amount),
        destination: 'Bank Account (••• 4242)',
        estimatedArrival: '1-3 business days',
        referenceId: 'WD-' + Date.now().toString().slice(-8),
      },
    });
    setIsSubmitting(false);
  };

  const isSubmitDisabled = !canSubmitForm(
    { formState },
    {
      requireDirty: false,
      requireValid: true,
    },
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Go back', 'Return to wallet')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
            accessible={false}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} {...a11y.header('Withdraw')}>
          Withdraw
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
            }}
            style={styles.balanceImage}
            {...a11y.image('Balance card background')}
          />
          <View style={styles.balanceOverlay}>
            <Text
              style={styles.balanceLabel}
              accessible={true}
              accessibilityLabel="Available to withdraw"
            >
              Available to withdraw
            </Text>
            <Text
              style={styles.balanceAmount}
              accessible={true}
              accessibilityLabel={formatCurrency(availableBalance)}
            >
              ${availableBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Pending Escrow */}
        <View
          style={styles.infoRow}
          accessible={true}
          accessibilityLabel={`Pending in escrow: ${formatCurrency(
            pendingEscrow,
          )}`}
        >
          <Text style={styles.infoLabel}>Pending in escrow</Text>
          <Text style={styles.infoValue}>${pendingEscrow.toFixed(2)}</Text>
        </View>

        {/* Payout Account Section */}
        <Text style={styles.sectionTitle}>Payout account</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={COLORS.text.primary}
              />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountNumber}>•••• 1234</Text>
              <Text style={styles.accountBank}>Bank of America</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="change-payment-method-button"
            style={styles.changeButton}
            onPress={() => navigation.navigate('PaymentMethods')}
            activeOpacity={0.7}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionTitle}>Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({
            field: { onChange: _onChange, onBlur: _onBlur, value: _value },
            fieldState: { error: _error },
          }) => (
            <View style={styles.inputWrapper}>
              <ControlledInput
                testID="amount-input"
                name="amount"
                control={control}
                placeholder="$0.00"
                keyboardType="decimal-pad"
              />
            </View>
          )}
        />

        {/* Note Input */}
        <Controller
          control={control}
          name="note"
          render={({
            field: { onChange: _onChange2, onBlur: _onBlur2, value: _value2 },
            fieldState: { error: _error2 },
          }) => (
            <View style={styles.inputWrapper}>
              <ControlledInput
                testID="note-input"
                name="note"
                control={control}
                placeholder="Note (optional)"
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {isSubmitting && (
          <Text
            style={styles.processingWarning}
            {...a11y.alert(
              'Processing withdrawal. This may take a few seconds.',
            )}
          >
            Processing withdrawal. This may take a few seconds.
          </Text>
        )}
        <Text
          style={styles.footerText}
          accessible={true}
          accessibilityLabel="Payouts typically arrive in 1 to 3 business days"
        >
          Payouts typically arrive in 1-3 business days
        </Text>
        <TouchableOpacity
          testID="withdraw-button"
          style={[
            styles.confirmButton,
            (isSubmitDisabled || isSubmitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitDisabled || isSubmitting}
          {...a11y.button(
            isSubmitting ? 'Processing withdrawal' : 'Confirm withdraw',
            biometricEnabled
              ? `This will require ${biometricTypeName} verification`
              : 'Process withdrawal to your bank account',
            isSubmitDisabled || isSubmitting,
          )}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                size="small"
                color={COLORS.utility.white}
                style={styles.loadingIndicator}
              />
              <Text style={styles.confirmButtonText}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm withdraw</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  balanceImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  balanceOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay40,
    justifyContent: 'flex-end',
    padding: 16,
  },
  balanceLabel: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.utility.white,
    marginBottom: 4,
  },
  balanceAmount: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.utility.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  infoValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  inputWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.utility.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountNumber: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  accountBank: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  changeButton: {
    backgroundColor: COLORS.bg.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  changeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bottomSpacer: {
    height: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border.default,
    opacity: 0.6,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  processingWarning: {
    ...TYPOGRAPHY.caption,
    color: COLORS.feedback.warning,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
});

// Wrap with ScreenErrorBoundary for critical withdrawal functionality
const WithdrawScreenWithErrorBoundary = (props: WithdrawScreenProps) => (
  <ScreenErrorBoundary>
    <WithdrawScreen {...props} />
  </ScreenErrorBoundary>
);

export default WithdrawScreenWithErrorBoundary;
