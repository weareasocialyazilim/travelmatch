/**
 * WithdrawScreen
 *
 * Withdrawal screen for cashing out earnings.
 *
 * Also includes AwwwardsWithdrawScreen variant:
 * - Awwwards-quality financial UI with large typography
 * - Silk-smooth bank card selection with GlassCard
 * - TYPOGRAPHY_SYSTEM integration
 * - Turkish labels following "Cinematic Trust Jewelry" aesthetic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMButton } from '@/components/ui/TMButton';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const { t } = useTranslation();
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
    // Convert comma to period for Turkish keyboard compatibility
    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!selectedMethod) {
      Alert.alert(t('withdrawal.selectMethod'), t('withdrawal.selectMethodMessage'));
      return;
    }

    if (isNaN(numericAmount)) {
      Alert.alert(t('withdrawal.invalidAmount'), t('withdrawal.invalidAmountMessage'));
      return;
    }

    if (numericAmount < MIN_WITHDRAWAL) {
      Alert.alert(t('withdrawal.amountTooLow'), t('withdrawal.amountTooLowMessage', { min: MIN_WITHDRAWAL }));
      return;
    }

    if (numericAmount > MAX_WITHDRAWAL) {
      Alert.alert(t('withdrawal.limitExceeded'), t('withdrawal.limitExceededMessage', { max: MAX_WITHDRAWAL }));
      return;
    }

    if (numericAmount > AVAILABLE_BALANCE) {
      Alert.alert(t('withdrawal.insufficientBalance'), t('withdrawal.insufficientBalanceMessage'));
      return;
    }

    Alert.alert(
      t('withdrawal.confirmWithdrawal'),
      t('withdrawal.confirmMessage', { amount: numericAmount.toFixed(2) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('withdrawal.confirm'),
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
                  type: 'withdraw',
                  title: t('withdrawal.withdrawalStarted'),
                  subtitle: t('withdrawal.withdrawalMessage'),
                  details: {
                    amount: numericAmount,
                    referenceId: result.id,
                  },
                });
              } else {
                Alert.alert(t('common.error'), t('withdrawal.withdrawalFailed'));
              }
            } catch {
              Alert.alert(t('common.error'), t('withdrawal.errorOccurred'));
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
        <Text style={styles.headerTitle}>{t('withdrawal.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Balance Info */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>{t('withdrawal.availableBalance')}</Text>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={COLORS.brand.primary} />
          ) : (
            <Text style={styles.balanceAmount}>${AVAILABLE_BALANCE.toFixed(2)}</Text>
          )}
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionTitle}>{t('withdrawal.amount')}</Text>
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
        <Text style={styles.limitText}>{t('withdrawal.minMax', { min: MIN_WITHDRAWAL, max: MAX_WITHDRAWAL })}</Text>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>{t('withdrawal.selectDestination')}</Text>

        <TouchableOpacity
          style={[styles.methodCard, selectedMethod === 'bank' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('bank')}
        >
          <View style={styles.methodInfo}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="bank" size={24} color="white" /></View>
            <View>
              <Text style={styles.methodTitle}>{t('withdrawal.bankAccount')}</Text>
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
              <Text style={styles.methodTitle}>{t('withdrawal.cryptoWallet')}</Text>
              <Text style={styles.methodSub}>USDC (ERC-20)</Text>
            </View>
          </View>
          {selectedMethod === 'crypto' && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
        </TouchableOpacity>

        {/* Withdraw Button */}
        <TouchableOpacity
          style={[styles.withdrawBtn, (!amount || isSubmitting) && styles.disabledBtn]}
          onPress={handleWithdraw}
          disabled={!amount || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={styles.withdrawText}>{t('withdrawal.withdrawButton')}</Text>
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
  spacer: { width: 24 },
});

// Wrap with ScreenErrorBoundary and NetworkGuard for critical withdrawal functionality
function WithdrawScreenWithErrorBoundary(props: WithdrawScreenProps) {
  const { t } = useTranslation();
  return (
    <ScreenErrorBoundary>
      <NetworkGuard offlineMessage={t('withdrawal.offlineMessage')}>
        <WithdrawScreen {...props} />
      </NetworkGuard>
    </ScreenErrorBoundary>
  );
}

export default WithdrawScreenWithErrorBoundary;

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsWithdrawScreen - Premium Financial UI
// Large typography, silk-smooth bank selection, neon glow action button
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsWithdrawScreenProps {
  navigation: any;
}

/**
 * SecurityBadge - Inline security indicator for withdrawals
 */
const SecurityBadge: React.FC<{ mode?: 'INSTANT' | 'STANDARD' }> = ({ mode = 'INSTANT' }) => {
  return (
    <View style={awwwardsStyles.securityBadge}>
      <View style={awwwardsStyles.securityIconWrapper}>
        <Ionicons name="shield-checkmark" size={20} color={COLORS.primary.main} />
      </View>
      <View style={awwwardsStyles.securityTextWrapper}>
        <Text style={awwwardsStyles.securityTitle}>
          {mode === 'INSTANT' ? 'Anında Transfer' : 'Güvenli Transfer'}
        </Text>
        <Text style={awwwardsStyles.securitySubtitle}>
          256-bit SSL şifreleme ile korunuyor
        </Text>
      </View>
    </View>
  );
};

/**
 * AwwwardsWithdrawScreen - Premium Kazanç Çekme Ekranı
 *
 * Awwwards-quality withdrawal screen with:
 * - Giant amount input with mono font styling
 * - "Max" button with neon accent
 * - Silk-smooth GlassCard bank account selector
 * - Security badge with shield icon
 * - Summary card with fee and ETA
 * - Premium 64px rounded action button
 * - TYPOGRAPHY_SYSTEM integration throughout
 * - Turkish labels
 */
export const AwwwardsWithdrawScreen: React.FC<AwwwardsWithdrawScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const availableBalance = 840.0;

  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= availableBalance;

  return (
    <View style={awwwardsStyles.container}>
      {/* Header */}
      <View style={[awwwardsStyles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={awwwardsStyles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={awwwardsStyles.headerTitle}>Kazancı Çek</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={awwwardsStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input Section */}
        <View style={awwwardsStyles.amountSection}>
          <Text style={awwwardsStyles.label}>ÇEKİLECEK TUTAR</Text>
          <View style={awwwardsStyles.amountInputRow}>
            <Text style={awwwardsStyles.currencyPrefix}>$</Text>
            <TextInput
              style={awwwardsStyles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.text.muted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={awwwardsStyles.maxButton}
            onPress={() => setAmount(availableBalance.toFixed(2))}
          >
            <Text style={awwwardsStyles.maxText}>
              Tümünü çek: ${availableBalance.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bank Account Selection */}
        <View style={awwwardsStyles.section}>
          <Text style={awwwardsStyles.sectionTitle}>BANKA HESABI</Text>
          <GlassCard style={awwwardsStyles.bankCard}>
            <View style={awwwardsStyles.bankInfo}>
              <View style={awwwardsStyles.bankIcon}>
                <Ionicons name="business" size={24} color={COLORS.secondary?.main || '#A855F7'} />
              </View>
              <View>
                <Text style={awwwardsStyles.bankName}>Garanti BBVA</Text>
                <Text style={awwwardsStyles.bankIban}>TR62 •••• •••• 4242</Text>
              </View>
            </View>
            <TouchableOpacity style={awwwardsStyles.changeButton}>
              <Text style={awwwardsStyles.changeText}>Değiştir</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Security Badge */}
        <View style={awwwardsStyles.section}>
          <SecurityBadge mode="INSTANT" />
        </View>

        {/* Summary Card */}
        <GlassCard style={awwwardsStyles.summaryCard}>
          <View style={awwwardsStyles.summaryRow}>
            <Text style={awwwardsStyles.summaryLabel}>İşlem Ücreti</Text>
            <Text style={awwwardsStyles.summaryValue}>$0.00 (Ücretsiz)</Text>
          </View>
          <View style={awwwardsStyles.divider} />
          <View style={awwwardsStyles.summaryRow}>
            <Text style={awwwardsStyles.totalLabel}>Tahmini Varış</Text>
            <Text style={awwwardsStyles.totalValue}>1-3 İş Günü</Text>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Footer Action Button */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[awwwardsStyles.footer, { paddingBottom: insets.bottom + 20 }]}
      >
        <TMButton
          title="Çekim Talebi Oluştur"
          variant="primary"
          onPress={() => navigation.navigate('WithdrawSuccess')}
          disabled={!isValidAmount}
          size="large"
          style={awwwardsStyles.actionButton}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const awwwardsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // ─────────────────────────────────────────────────────────────────
  // Header
  // ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyL,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
    color: COLORS.text.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },

  // ─────────────────────────────────────────────────────────────────
  // Scroll Content
  // ─────────────────────────────────────────────────────────────────
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },

  // ─────────────────────────────────────────────────────────────────
  // Amount Section
  // ─────────────────────────────────────────────────────────────────
  amountSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 2,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  currencyPrefix: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: 40,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.light,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  amountInput: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: 56,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.black,
    color: COLORS.text.primary,
    minWidth: 150,
    textAlign: 'center',
  },
  maxButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary.main}15`,
    borderWidth: 1,
    borderColor: `${COLORS.primary.main}30`,
  },
  maxText: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.primary.main,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },

  // ─────────────────────────────────────────────────────────────────
  // Sections
  // ─────────────────────────────────────────────────────────────────
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // ─────────────────────────────────────────────────────────────────
  // Bank Card
  // ─────────────────────────────────────────────────────────────────
  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
  },
  bankIban: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeText: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },

  // ─────────────────────────────────────────────────────────────────
  // Security Badge
  // ─────────────────────────────────────────────────────────────────
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${COLORS.primary.main}08`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary.main}20`,
    gap: 12,
  },
  securityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTextWrapper: {
    flex: 1,
  },
  securityTitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  securitySubtitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    color: COLORS.text.secondary,
  },

  // ─────────────────────────────────────────────────────────────────
  // Summary Card
  // ─────────────────────────────────────────────────────────────────
  summaryCard: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
  },
  summaryValue: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border?.light || 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
  },
  totalValue: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    color: COLORS.primary.main,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
  },

  // ─────────────────────────────────────────────────────────────────
  // Footer
  // ─────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    backgroundColor: COLORS.background.primary,
  },
  actionButton: {
    height: 64,
    borderRadius: 32,
    // Neon glow shadow
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 0.3,
    elevation: 10,
  },
});
