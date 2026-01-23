/**
 * WithdrawScreen - PayTR Settlement Integration
 *
 * LEGAL COMPLIANCE:
 * - PayTR marketplace model: Withdrawals must go through Hakediş (settlement) API
 * - Only bank accounts linked to merchant sub-accounts are valid
 * - Crypto withdrawals are NOT supported (removed as ghost feature)
 *
 * KYC REQUIREMENT:
 * - Minimum Gold level (ID verified) required for withdrawals
 * - Bronze/Silver users shown verification prompt
 * - Platinum users get priority processing
 *
 * FLOW:
 * 1. Check KYC level (must be gold+)
 * 2. Fetch real-time withdrawable balance from PayTR API
 * 3. User enters amount (validated against available balance)
 * 4. Trigger PayTR settlement via edge function
 * 5. PayTR processes and transfers to linked bank account
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { HapticManager } from '@/services/HapticManager';
import { Ionicons } from '@expo/vector-icons';
import { walletService, type WalletBalance } from '@/services/walletService';
import { useAuth } from '@/hooks/useAuth';
import { useScreenSecurity } from '@/hooks/useScreenSecurity';
import { showAlert } from '@/stores/modalStore';
import { logger } from '@/utils/logger';
import { showLoginPrompt } from '@/stores/modalStore';

// Withdrawal Rate: 1 Coin = 1.00 TRY (As per Financial Constitution)
const COIN_TO_TRY_RATE = 1.0;

// ═══════════════════════════════════════════════════════════════════
// KYC LEVELS & REQUIREMENTS
// ═══════════════════════════════════════════════════════════════════

type KYCLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

const KYC_LEVELS: Record<
  KYCLevel,
  { name: string; icon: string; canWithdraw: boolean }
> = {
  none: { name: 'Doğrulanmamış', icon: 'shield-outline', canWithdraw: false },
  bronze: { name: 'Bronz', icon: 'mail-outline', canWithdraw: false },
  silver: { name: 'Gümüş', icon: 'call-outline', canWithdraw: false },
  gold: { name: 'Altın', icon: 'id-card-outline', canWithdraw: true },
  platinum: { name: 'Platin', icon: 'diamond-outline', canWithdraw: true },
};

const KYC_REQUIREMENTS = [
  { level: 'bronze', requirement: 'E-posta doğrulaması', icon: 'mail' },
  { level: 'silver', requirement: 'Telefon doğrulaması', icon: 'call' },
  { level: 'gold', requirement: 'Kimlik doğrulaması', icon: 'id-card' },
];

// ═══════════════════════════════════════════════════════════════════
// THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const THEME = {
  background: '#0A0A0F',
  surface: '#1A1A24',
  surfaceLight: '#2A2A38',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  accent: '#CCFF00',
  accentDark: '#99CC00',
  danger: '#FF4757',
  warning: '#FFB800',
  success: '#00D68F',
  paytr: '#00A0E3', // PayTR brand color
};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface BankAccount {
  id: string;
  bank_name: string;
  iban: string;
  account_holder: string;
  is_verified: boolean;
  is_default: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * KYCGateScreen - Shown when user doesn't meet KYC requirements for withdrawal
 */
const KYCGateScreen: React.FC<{
  currentLevel: KYCLevel;
  onVerify: () => void;
  onBack: () => void;
}> = ({ currentLevel, onVerify, onBack }) => {
  const currentLevelInfo = KYC_LEVELS[currentLevel];
  const currentLevelIndex = Object.keys(KYC_LEVELS).indexOf(currentLevel);

  return (
    <LinearGradient
      colors={[THEME.background, '#0F0F18', THEME.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kimlik Doğrulama Gerekli</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentCentered}
        >
          {/* KYC Gate Icon */}
          <View style={styles.kycGateIcon}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.kycGateIconGradient}
            >
              <Ionicons name="diamond" size={48} color={THEME.background} />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.kycGateTitle}>
            Altın Seviye Doğrulama Gerekli
          </Text>
          <Text style={styles.kycGateSubtitle}>
            Para çekme işlemi için kimlik doğrulamanız gerekmektedir.{'\n'}
            Bu, hem sizin hem de platformun güvenliği için zorunludur.
          </Text>

          {/* Current Level Badge */}
          <View style={styles.currentLevelBadge}>
            <Ionicons
              name={currentLevelInfo.icon as any}
              size={18}
              color={THEME.warning}
            />
            <Text style={styles.currentLevelText}>
              Mevcut Seviye: {currentLevelInfo.name}
            </Text>
          </View>

          {/* Requirements List */}
          <View style={styles.requirementsList}>
            {KYC_REQUIREMENTS.map((req, _index) => {
              const reqLevelIndex = Object.keys(KYC_LEVELS).indexOf(req.level);
              const isCompleted = currentLevelIndex > reqLevelIndex;
              const isCurrent = currentLevelIndex === reqLevelIndex;

              return (
                <View
                  key={req.level}
                  style={[
                    styles.requirementItem,
                    isCompleted && styles.requirementItemCompleted,
                    isCurrent && styles.requirementItemCurrent,
                  ]}
                >
                  <View style={styles.requirementIcon}>
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={THEME.success}
                      />
                    ) : isCurrent ? (
                      <Ionicons
                        name="arrow-forward-circle"
                        size={24}
                        color={THEME.warning}
                      />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={24}
                        color={THEME.textMuted}
                      />
                    )}
                  </View>
                  <View style={styles.requirementContent}>
                    <Text
                      style={[
                        styles.requirementText,
                        isCompleted && styles.requirementTextCompleted,
                      ]}
                    >
                      {req.requirement}
                    </Text>
                    <Text style={styles.requirementLevel}>
                      {KYC_LEVELS[req.level as KYCLevel].name} Seviye
                    </Text>
                  </View>
                  <Ionicons
                    name={req.icon as any}
                    size={20}
                    color={isCompleted ? THEME.success : THEME.textMuted}
                  />
                </View>
              );
            })}
          </View>

          {/* Benefits */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Doğrulama Avantajları</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={18} color={THEME.accent} />
              <Text style={styles.benefitText}>Hızlı para çekme işlemi</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={THEME.accent}
              />
              <Text style={styles.benefitText}>Artırılmış güvenlik</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={18} color={THEME.accent} />
              <Text style={styles.benefitText}>Yüksek çekim limitleri</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={onVerify}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyButtonGradient}
            >
              <Ionicons name="diamond" size={20} color={THEME.background} />
              <Text style={styles.verifyButtonText}>
                Kimliğini Doğrula ve Kristalini Kazan
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Note */}
          <Text style={styles.infoNote}>
            Kimlik doğrulama işlemi birkaç dakika sürer ve bilgileriniz{'\n'}
            256-bit SSL şifreleme ile korunmaktadır.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

/**
 * SecurityBadge - Shows PayTR security compliance
 */
const SecurityBadge: React.FC = () => (
  <View style={styles.securityBadge}>
    <Ionicons name="shield-checkmark" size={14} color={THEME.paytr} />
    <Text style={styles.securityBadgeText}>PayTR Güvenli Transfer</Text>
  </View>
);

/**
 * GlassCard - Glass morphism card component
 */
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: object;
}> = ({ children, style }) => (
  <BlurView intensity={20} tint="dark" style={[styles.glassCard, style]}>
    <View style={styles.glassCardInner}>{children}</View>
  </BlurView>
);

/**
 * BankAccountCard - Displays linked bank account info
 */
const BankAccountCard: React.FC<{
  account: BankAccount;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ account, isSelected, onSelect }) => {
  const formatIBAN = (iban: string) => {
    // Show only last 4 digits for security
    const clean = iban.replace(/\s/g, '');
    return `TR** **** **** **** **** ${clean.slice(-4)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.bankCard, isSelected && styles.bankCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.bankCardHeader}>
        <View style={styles.bankIconContainer}>
          <Ionicons name="business" size={20} color={THEME.accent} />
        </View>
        <View style={styles.bankCardInfo}>
          <Text style={styles.bankName}>{account.bank_name}</Text>
          <Text style={styles.bankIban}>{formatIBAN(account.iban)}</Text>
        </View>
        {account.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={THEME.success} />
          </View>
        )}
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="radio-button-on" size={20} color={THEME.accent} />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * AmountInput - Styled amount input with currency
 */
const AmountInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  maxAmount: number;
  error?: string;
}> = ({ value, onChange, maxAmount, error }) => {
  const handleQuickAmount = (percentage: number) => {
    const amount = Math.floor(maxAmount * percentage);
    onChange(amount.toString());
    HapticManager.buttonPress();
  };

  return (
    <View style={styles.amountContainer}>
      <Text style={styles.amountLabel}>Çekim Miktarı (Coin)</Text>
      <View
        style={[styles.amountInputWrapper, error && styles.amountInputError]}
      >
        <MaterialCommunityIcons
          name="star-four-points"
          size={24}
          color={THEME.accent}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.amountInput}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={THEME.textMuted}
          maxLength={10}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Conversion Display */}
      {value ? (
        <Text style={styles.conversionText}>
          ≈ ₺
          {(parseInt(value || '0') * COIN_TO_TRY_RATE).toLocaleString('tr-TR')}
        </Text>
      ) : null}

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmounts}>
        {[0.25, 0.5, 0.75, 1].map((percentage) => (
          <TouchableOpacity
            key={percentage}
            style={styles.quickAmountButton}
            onPress={() => handleQuickAmount(percentage)}
          >
            <Text style={styles.quickAmountText}>
              {percentage === 1 ? 'Tümü' : `%${percentage * 100}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isGuest } = useAuth();

  // Security: Prevent screenshots during withdrawal
  useScreenSecurity();

  // KYC Level - get from user profile or default to 'none'
  // In production, this would come from user.kyc_level or a profile service
  const userKYCLevel: KYCLevel = (user as any)?.kyc_level || 'none';
  const canWithdraw = KYC_LEVELS[userKYCLevel].canWithdraw;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────
  // Data Fetching - MOVED BEFORE EARLY RETURN (Rules of Hooks)
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isGuest) {
      showLoginPrompt({ action: 'default' });
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [isGuest, navigation]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !canWithdraw) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch PayTR balance (real withdrawable amount)
      const balanceData = await walletService.getPayTRBalance();
      setBalance(balanceData);

      // Fetch linked bank accounts
      const accounts = await walletService.getBankAccounts();
      setBankAccounts(accounts);

      // Auto-select default account
      const defaultAccount = accounts.find((acc) => acc.is_default);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount.id);
      } else if (accounts.length > 0) {
        setSelectedAccount(accounts[0].id);
      }
    } catch (err) {
      logger.error('[WithdrawScreen] Fetch error:', { error: err });
      setError('Bakiye bilgisi alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, canWithdraw]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────────────────────────────────────────────────
  // Validation - MOVED BEFORE EARLY RETURN (Rules of Hooks)
  // ─────────────────────────────────────────────────────────────────

  const validateAmount = useCallback((): string | null => {
    const numAmount = parseInt(amount); // Coins are integers

    if (!amount || isNaN(numAmount)) {
      return 'Lütfen coin miktarı girin';
    }

    if (numAmount < 50) {
      return 'Minimum çekim: 50 Coin';
    }

    if (balance && numAmount > (balance.coins || 0)) {
      return `Yetersiz bakiye: ${balance.coins || 0} Coin mevcut`;
    }

    if (!selectedAccount) {
      return 'Lütfen bir banka hesabı seçin';
    }

    return null;
  }, [amount, balance, selectedAccount]);

  // ─────────────────────────────────────────────────────────────────
  // KYC Gate - Show verification screen if user doesn't meet requirements
  // ─────────────────────────────────────────────────────────────────

  const handleVerifyKYC = () => {
    // Navigate to KYC verification flow
    (navigation as StackNavigationProp<RootStackParamList>).navigate(
      'IdentityVerification',
    );
  };

  // If user doesn't meet KYC requirements, show gate screen
  if (!canWithdraw) {
    return (
      <KYCGateScreen
        currentLevel={userKYCLevel}
        onVerify={handleVerifyKYC}
        onBack={() => navigation.goBack()}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Submission
  // ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      HapticManager.error();
      return;
    }

    const numAmount = parseInt(amount);
    const fiatValue = numAmount * COIN_TO_TRY_RATE;

    showAlert(
      'Çekim Onayı',
      `${numAmount} Coin karşılığı ₺${fiatValue.toLocaleString('tr-TR')} çekim talebinizi onaylıyor musunuz?\n\nTutar, PayTR tarafından doğrulandıktan sonra banka hesabınıza 1-3 iş günü içinde aktarılacaktır.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          style: 'default',
          onPress: async () => {
            setIsSubmitting(true);
            setError(null);

            try {
              // Trigger Coin Withdrawal via edge function
              const result = await walletService.requestCoinWithdrawal({
                coinAmount: numAmount,
                bankAccountId: selectedAccount!,
              });

              // Success haptic feedback
              HapticManager.success();

              showAlert(
                'Talep Oluşturuldu ✓',
                `Çekim talebiniz PayTR'ye iletildi.\n\nTakip No: ${result.settlementId}\n\nİşlem durumunu Cüzdan > İşlem Geçmişi bölümünden takip edebilirsiniz.`,
                [
                  {
                    text: 'Tamam',
                    onPress: () => navigation.goBack(),
                  },
                ],
              );
            } catch (err: any) {
              logger.error('[WithdrawScreen] Settlement error:', {
                error: err,
              });
              HapticManager.error();
              setError(
                err.message ||
                  'Çekim talebi oluşturulamadı. Lütfen tekrar deneyin.',
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={styles.loadingText}>
          PayTR bakiyesi kontrol ediliyor...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[THEME.background, '#0F0F18', THEME.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={THEME.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Para Çek</Text>
            <SecurityBadge />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance Card */}
            <GlassCard>
              <Text style={styles.balanceLabel}>Çekilebilir Coin</Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={28}
                  color={THEME.accent}
                />
                <Text style={styles.balanceAmount}>
                  {balance?.coins || '0'}
                </Text>
              </View>
              <Text
                style={{
                  color: THEME.textSecondary,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                ≈ ₺
                {((balance?.coins || 0) * COIN_TO_TRY_RATE).toLocaleString(
                  'tr-TR',
                )}
              </Text>
              {balance && balance.pending > 0 && (
                <View style={styles.pendingInfo}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={THEME.warning}
                  />
                  <Text style={styles.pendingText}>
                    ₺{balance.pending.toLocaleString('tr-TR')} beklemede
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* Amount Input */}
            <GlassCard style={styles.amountCard}>
              <AmountInput
                value={amount}
                onChange={(val) => {
                  setAmount(val);
                  setError(null);
                }}
                maxAmount={balance?.coins || 0}
                error={error || undefined}
              />
            </GlassCard>

            {/* Bank Account Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Banka Hesabı</Text>
              {bankAccounts.length === 0 ? (
                <GlassCard>
                  <View style={styles.noBankAccount}>
                    <Ionicons
                      name="card-outline"
                      size={32}
                      color={THEME.textMuted}
                    />
                    <Text style={styles.noBankAccountText}>
                      Henüz banka hesabı eklenmemiş
                    </Text>
                    <TouchableOpacity
                      style={styles.addBankButton}
                      onPress={() => {
                        // Navigate to bank account settings
                        showAlert(
                          'Bilgi',
                          'Banka hesabı eklemek için Profil > Ödeme Ayarları bölümüne gidin.',
                        );
                      }}
                    >
                      <Text style={styles.addBankButtonText}>Hesap Ekle</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ) : (
                bankAccounts.map((account) => (
                  <BankAccountCard
                    key={account.id}
                    account={account}
                    isSelected={selectedAccount === account.id}
                    onSelect={() => {
                      setSelectedAccount(account.id);
                      HapticManager.buttonPress();
                    }}
                  />
                ))
              )}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={THEME.textSecondary}
                />
                <Text style={styles.infoText}>
                  Çekim talepleriniz PayTR tarafından 1-3 iş günü içinde
                  işlenir.
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons
                  name="shield-outline"
                  size={18}
                  color={THEME.textSecondary}
                />
                <Text style={styles.infoText}>
                  Tüm işlemler BDDK düzenlemeleri kapsamında gerçekleştirilir.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!amount || isSubmitting || bankAccounts.length === 0) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!amount || isSubmitting || bankAccounts.length === 0}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={THEME.background} />
              ) : (
                <>
                  <Ionicons
                    name="arrow-up-circle"
                    size={20}
                    color={THEME.background}
                  />
                  <Text style={styles.submitButtonText}>
                    Çekim Talebi Oluştur
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
    marginLeft: 8,
  },

  // Security Badge
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 160, 227, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  securityBadgeText: {
    fontSize: 11,
    color: THEME.paytr,
    fontWeight: '500',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollContentCentered: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Glass Card
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  glassCardInner: {
    padding: 20,
  },

  // Balance Card
  balanceLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: -1,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  pendingText: {
    fontSize: 13,
    color: THEME.warning,
  },

  // Amount Input
  amountCard: {
    marginBottom: 24,
  },
  amountContainer: {},
  amountLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 12,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    height: 56,
  },
  amountInputError: {
    borderColor: THEME.danger,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: THEME.text,
  },
  errorText: {
    fontSize: 12,
    color: THEME.danger,
    marginTop: 8,
  },
  conversionText: {
    fontSize: 13,
    color: THEME.success,
    marginTop: 8,
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: THEME.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quickAmountText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 12,
  },

  // Bank Card
  bankCard: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  bankCardSelected: {
    borderColor: THEME.accent,
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
  },
  bankIban: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },

  // No Bank Account
  noBankAccount: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noBankAccountText: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  addBankButton: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  addBankButtonText: {
    fontSize: 14,
    color: THEME.accent,
    fontWeight: '500',
  },

  // Info Section
  infoSection: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.accent,
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: THEME.surfaceLight,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.background,
  },

  // ═══════════════════════════════════════════════════════════════════
  // KYC Gate Styles
  // ═══════════════════════════════════════════════════════════════════

  kycGateIcon: {
    marginTop: 32,
    marginBottom: 24,
  },
  kycGateIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  kycGateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  kycGateSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  currentLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 32,
  },
  currentLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.warning,
  },
  requirementsList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 12,
  },
  requirementItemCompleted: {
    borderColor: 'rgba(0, 214, 143, 0.3)',
    backgroundColor: 'rgba(0, 214, 143, 0.05)',
  },
  requirementItemCurrent: {
    borderColor: THEME.warning,
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
  },
  requirementIcon: {
    width: 32,
    alignItems: 'center',
  },
  requirementContent: {
    flex: 1,
  },
  requirementText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
  },
  requirementTextCompleted: {
    color: THEME.success,
  },
  requirementLevel: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: THEME.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 16,
  },
  verifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.background,
  },
  infoNote: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WithdrawScreen;
