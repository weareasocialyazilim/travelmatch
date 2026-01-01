import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { COLORS_DARK } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const BALANCE = 1240.50;

  // Enable screenshot protection for this sensitive screen
  useScreenSecurity();

  const { control, handleSubmit, formState } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema),
    mode: 'onChange',
    defaultValues: {
      amount: '',
      note: '',
    },
  });

  const onSubmit = async (data: WithdrawInput) => {
    // Check if biometric is enabled and verify before proceeding
    if (biometricEnabled) {
      const verified = await authenticateForAction('Withdraw Funds');

      if (!verified) {
        Alert.alert(
          'Kimlik Doğrulama Gerekli',
          `Para çekmek için lütfen ${biometricTypeName} ile doğrulayın.`,
          [{ text: 'Tamam' }],
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
        destination: 'Banka Hesabı (••• 4242)',
        estimatedArrival: '1-3 iş günü',
        referenceId: 'WD-' + Date.now().toString().slice(-8),
      },
    });
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Geri dön', 'Cüzdana dön')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
            accessible={false}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} {...a11y.header('Para Çekme')}>
          Para Çekme
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.balance}>${BALANCE.toFixed(2)}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.2)"
            autoFocus
          />
          <View style={styles.balanceOverlay}>
            <Text
              style={styles.balanceLabel}
              accessible={true}
              accessibilityLabel="Çekilebilir bakiye"
            >
              Çekilebilir Bakiye
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
          accessibilityLabel={`Emanette bekleyen: ${formatCurrency(
            pendingEscrow,
          )}`}
        >
          <Text style={styles.infoLabel}>Emanette Bekleyen</Text>
          <Text style={styles.infoValue}>${pendingEscrow.toFixed(2)}</Text>
        </View>

        {/* Payout Account Section */}
        <Text style={styles.sectionTitle}>Ödeme Hesabı</Text>
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
              <Text style={styles.accountBank}>Banka Hesabı</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="change-payment-method-button"
            style={styles.changeButton}
            onPress={() => navigation.navigate('PaymentMethods')}
            activeOpacity={0.7}
          >
            <Text style={styles.changeButtonText}>Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionTitle}>Tutar</Text>
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
                placeholder="₺0,00"
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
                placeholder="Not (isteğe bağlı)"
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
              'Para çekme işleniyor. Bu birkaç saniye sürebilir.',
            )}
          >
            Para çekme işleniyor. Bu birkaç saniye sürebilir.
          </Text>
        )}
        <Text
          style={styles.footerText}
          accessible={true}
          accessibilityLabel="Ödemeler genellikle 1-3 iş günü içinde hesabınıza ulaşır"
        >
          Ödemeler genellikle 1-3 iş günü içinde ulaşır
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
            isSubmitting ? 'Para çekme işleniyor' : 'Çekimi onayla',
            biometricEnabled
              ? `${biometricTypeName} doğrulaması gerekecek`
              : 'Banka hesabınıza para çekme işlemini başlat',
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
              <Text style={styles.confirmButtonText}>İşleniyor...</Text>
            </>
          ) : (
            <Text style={styles.confirmButtonText}>Çekimi Onayla</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_DARK.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  label: {
    color: COLORS_DARK.text.secondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balance: {
    color: COLORS_DARK.brand.primary,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  currency: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 4,
  },
  input: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    minWidth: 100,
  },
  bankCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    color: 'white',
    fontWeight: 'bold',
  },
  bankAccount: {
    color: '#888',
    fontSize: 12,
  },
  changeText: {
    color: COLORS_DARK.brand.primary,
    fontWeight: '600',
  },
  btn: {
    width: '100%',
    backgroundColor: COLORS_DARK.brand.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: '#333',
  },
  btnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// Wrap with ScreenErrorBoundary and NetworkGuard for critical withdrawal functionality
const WithdrawScreenWithErrorBoundary = (props: WithdrawScreenProps) => (
  <ScreenErrorBoundary>
    <NetworkGuard offlineMessage="Para çekme işlemi için internet bağlantısı gerekli.">
      <WithdrawScreen {...props} />
    </NetworkGuard>
  </ScreenErrorBoundary>
);

export default WithdrawScreenWithErrorBoundary;
