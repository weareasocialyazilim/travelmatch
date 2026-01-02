import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the payments hook for real data
  const {
    balance,
    balanceLoading,
    withdrawalLimits,
    bankAccounts,
    requestWithdrawal,
    refreshBalance,
  } = usePayments();

  // Refresh balance on mount
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Use limits from API or fallback defaults
  const MIN_WITHDRAWAL = withdrawalLimits?.minAmount ?? 50;
  const MAX_DAILY = withdrawalLimits?.remainingDaily ?? 5000;
  const MAX_WITHDRAWAL = Math.min(
    withdrawalLimits?.maxAmount ?? 5000,
    MAX_DAILY
  );
  const AVAILABLE_BALANCE = balance?.available ?? 0;

  const handleWithdraw = async () => {
    Keyboard.dismiss();
    // Virgül girilirse noktaya çevir (Türkçe klavye uyumu)
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!selectedMethod) {
      Alert.alert('Yöntem Seçin', 'Lütfen devam etmek için bir ödeme yöntemi seçin.');
      return;
    }

    if (isNaN(numericAmount)) {
      Alert.alert('Geçersiz Tutar', 'Lütfen geçerli bir sayı girin.');
      return;
    }

    if (numericAmount < MIN_WITHDRAWAL) {
      Alert.alert('Tutar Çok Düşük', `Minimum çekim tutarı $${MIN_WITHDRAWAL}.`);
      return;
    }

    if (numericAmount > MAX_WITHDRAWAL) {
      Alert.alert('Limit Aşıldı', `Günlük maksimum çekim limiti $${MAX_WITHDRAWAL}.`);
      return;
    }

    if (numericAmount > AVAILABLE_BALANCE) {
      Alert.alert('Yetersiz Bakiye', 'Bu çekim işlemi için yeterli bakiyeniz bulunmuyor.');
      return;
    }

    Alert.alert(
      'Çekimi Onayla',
      `Seçilen yönteme $${numericAmount.toFixed(2)} çekmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Get bank account ID for selected method
              const bankAccountId = selectedMethod === 'bank'
                ? bankAccounts?.[0]?.id ?? 'default_bank'
                : 'crypto_wallet';

              const result = await requestWithdrawal(numericAmount, bankAccountId);

              if (result) {
                navigation.navigate('Success', {
                  type: 'withdrawal',
                  title: 'Çekim Başlatıldı',
                  subtitle: 'Paranız yola çıktı. Genellikle 1-3 iş günü sürer.',
                  details: {
                    amount: numericAmount,
                    referenceId: result.id,
                  },
                });
              } else {
                Alert.alert('Hata', 'Çekim işlemi başarısız oldu. Lütfen tekrar deneyin.');
              }
            } catch {
              Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Para Çek</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Bakiye Bilgisi */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Çekilebilir Bakiye</Text>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={COLORS.brand.primary} />
          ) : (
            <Text style={styles.balanceAmount}>${AVAILABLE_BALANCE.toFixed(2)}</Text>
          )}
        </View>

        {/* Tutar Girişi */}
        <Text style={styles.sectionTitle}>Tutar</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        <Text style={styles.limitText}>Min: ${MIN_WITHDRAWAL} • Maks: ${MAX_WITHDRAWAL}</Text>

        {/* Ödeme Yöntemleri */}
        <Text style={styles.sectionTitle}>Hedef Seçin</Text>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'bank' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('bank')}
        >
          <View style={styles.methodInfo}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="bank" size={24} color="white" /></View>
            <View>
              <Text style={styles.methodTitle}>Banka Hesabı</Text>
              <Text style={styles.methodSub}>•••• 8392</Text>
            </View>
          </View>
          {selectedMethod === 'bank' && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'crypto' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('crypto')}
        >
          <View style={styles.methodInfo}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="bitcoin" size={24} color="white" /></View>
            <View>
              <Text style={styles.methodTitle}>Kripto Cüzdan</Text>
              <Text style={styles.methodSub}>USDC (ERC-20)</Text>
            </View>
          </View>
          {selectedMethod === 'crypto' && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
        </TouchableOpacity>

        {/* Çekim Butonu */}
        <TouchableOpacity
          style={[styles.withdrawBtn, (!amount || isSubmitting) && styles.disabledBtn]}
          onPress={handleWithdraw}
          disabled={!amount || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={styles.withdrawText}>Parayı Çek</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  balanceContainer: { alignItems: 'center', marginBottom: 30, padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
  balanceLabel: { color: COLORS.text.secondary, marginBottom: 8 },
  balanceAmount: { color: 'white', fontSize: 32, fontWeight: '900' },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingHorizontal: 20, height: 64, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  currencyPrefix: { color: 'white', fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 24, fontWeight: 'bold' },
  limitText: { color: COLORS.text.secondary, fontSize: 12, marginBottom: 30, marginLeft: 4 },
  methodCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
  selectedMethod: { borderColor: COLORS.brand.primary, backgroundColor: 'rgba(204, 255, 0, 0.05)' },
  methodInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  methodTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  methodSub: { color: COLORS.text.secondary, fontSize: 12 },
  withdrawBtn: { backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  withdrawText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
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
