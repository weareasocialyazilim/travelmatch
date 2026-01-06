/**
 * WalletScreen - Premium Dark Wallet with Glass Morphism
 *
 * MASTER UX UPDATES:
 * - PayTR-synced balance (available vs pending)
 * - Pending UI with ProofReminderBottomSheet trigger
 * - Silk-smooth transaction icons:
 *   - Kazanç (income): Neon Lime (#CCFF00)
 *   - Harcama (expense): Neon Pink (#FF0099)
 * - Haptic feedback throughout
 * - 60-30-10 color rule (Background 60%, Text 30%, Accent 10%)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight as _FadeInRight,
} from 'react-native-reanimated';
import BottomNav from '@/components/BottomNav';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { useToast } from '@/context/ToastContext';
import {
  COLORS as _COLORS,
  primitives,
  GRADIENTS as _GRADIENTS,
} from '@/constants/colors';
import { TYPOGRAPHY as _TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import { walletService } from '@/services/walletService';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'incoming' | 'outgoing' | 'gifts';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Transaction type for better categorization
type TransactionCategory =
  | 'gift_received'
  | 'gift_sent'
  | 'withdrawal'
  | 'deposit'
  | 'refund'
  | 'topup';

// Dark theme colors with Neon accents
const DARK_THEME = {
  background: '#0C0A09',
  backgroundSecondary: '#1a1a1a',
  cardBackground: 'rgba(20,20,20,0.6)',
  cardBorder: 'rgba(255,255,255,0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  // Master Colors: Neon Lime for income, Neon Pink for expense
  accentLime: '#CCFF00', // Kazanç (income)
  accentPink: '#FF0099', // Harcama (expense)
  accentAmber: '#F59E0B', // Beklemede (pending)
  accent: '#DFFF00', // Primary accent
  filterActive: primitives.magenta[500],
  filterInactive: 'rgba(255,255,255,0.05)',
};

// Transaction icon mapping for silk-smooth visuals
const TRANSACTION_ICONS: Record<TransactionCategory, IconName> = {
  gift_received: 'gift-outline',
  gift_sent: 'gift',
  withdrawal: 'bank-transfer-out',
  deposit: 'bank-transfer-in',
  refund: 'cash-refund',
  topup: 'wallet-plus',
};

// Transaction title mapping (Turkish)
const getTransactionTitle = (category: TransactionCategory): string => {
  const titles: Record<TransactionCategory, string> = {
    gift_received: 'Hediye Alındı',
    gift_sent: 'Hediye Gönderildi',
    withdrawal: 'Para Çekimi',
    deposit: 'Para Yatırma',
    refund: 'İade',
    topup: 'Bakiye Yükleme',
  };
  return titles[category] || 'İşlem';
};

const WalletScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [pendingProofItems, setPendingProofItems] = useState<
    Array<{
      id: string;
      amount: number;
      senderName: string;
      momentTitle: string;
    }>
  >([]);
  const toast = useToast();

  // Use payments hook
  const {
    balance,
    transactions,
    balanceLoading,
    transactionsError: _error,
    refreshBalance,
    loadTransactions,
  } = usePayments();

  const isLoading = balanceLoading;

  // Fetch data on mount
  useEffect(() => {
    refreshBalance();
    loadTransactions();
    // Fetch pending proof items for the pending badge
    walletService.getPendingProofItems().then(setPendingProofItems);
  }, [refreshBalance, loadTransactions]);

  // Use API transactions - adapt to display format with proper categorization
  const displayTransactions = useMemo(() => {
    return transactions.map((t) => {
      const category = t.type as TransactionCategory;
      const isPositive =
        category === 'gift_received' ||
        category === 'deposit' ||
        category === 'refund' ||
        category === 'topup';

      return {
        id: t.id,
        type: category,
        title: t.description || getTransactionTitle(category),
        date: t.status || '',
        amount: t.amount,
        isPositive,
        category,
      };
    });
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return displayTransactions;
    if (activeFilter === 'incoming')
      return displayTransactions.filter((t) => t.isPositive);
    if (activeFilter === 'gifts')
      return displayTransactions.filter(
        (t) => t.category === 'gift_received' || t.category === 'gift_sent',
      );
    return displayTransactions.filter((t) => !t.isPositive);
  }, [displayTransactions, activeFilter]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshBalance();
      await loadTransactions();
      const proofItems = await walletService.getPendingProofItems();
      setPendingProofItems(proofItems);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Cüzdan bilgileri yüklenemedi. Lütfen tekrar deneyin.');
    }
  }, [refreshBalance, loadTransactions, toast]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Get transaction icon based on category
  const getTransactionIcon = useCallback(
    (category: TransactionCategory): IconName => {
      return TRANSACTION_ICONS[category] || 'cash';
    },
    [],
  );

  // Handle pending balance tap - Show proof reminder
  const handlePendingTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (pendingProofItems.length === 0) {
      showAlert(
        'Bekleyen Bakiye',
        'Bekleyen bakiyeniz PayTR tarafından işleniyor. 1-3 iş günü içinde çekilebilir hale gelecektir.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    // Show proof reminder alert (can be replaced with BottomSheet)
    const totalPending = pendingProofItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const itemsList = pendingProofItems
      .slice(0, 3)
      .map((item) => `• ${item.senderName}: ${formatCurrency(item.amount)}`)
      .join('\n');

    showAlert(
      '📸 Kanıt Yükleyin',
      `${formatCurrency(totalPending)} tutarında bekleyen hediyeniz var.\n\nKanıt yükledikten sonra çekilebilir hale gelecektir:\n\n${itemsList}${pendingProofItems.length > 3 ? `\n...ve ${pendingProofItems.length - 3} daha` : ''}`,
      [
        { text: 'Daha Sonra', style: 'cancel' },
        {
          text: 'Kanıt Yükle',
          onPress: () => {
            // Navigate to first pending item's proof upload
            if (pendingProofItems[0]) {
              navigation.navigate('ProofFlow' as any, {
                giftId: pendingProofItems[0].id,
              });
            }
          },
        },
      ],
    );
  }, [pendingProofItems, formatCurrency, navigation]);

  // Render transaction item with silk-smooth icons
  const renderTransaction = useCallback(
    ({
      item,
      index,
    }: {
      item: (typeof displayTransactions)[0];
      index: number;
    }) => {
      const isCredit = item.isPositive;
      const iconColor = isCredit
        ? DARK_THEME.accentLime
        : DARK_THEME.accentPink;
      const iconBgColor = isCredit
        ? 'rgba(204, 255, 0, 0.1)'
        : 'rgba(255, 0, 153, 0.1)';

      return (
        <Animated.View
          entering={FadeInUp.delay(index * 100)}
          style={styles.txItem}
        >
          <TouchableOpacity
            style={styles.txItemContent}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('TransactionDetail', {
                transactionId: item.id,
              });
            }}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${item.title}, ${isCredit ? 'gelen' : 'giden'} ${formatCurrency(Math.abs(item.amount))}`}
            accessibilityRole="button"
            accessibilityHint="İşlem detaylarını görüntüler"
          >
            <View style={styles.txIconContainer}>
              <View style={[styles.txIconBg, { backgroundColor: iconBgColor }]}>
                <MaterialCommunityIcons
                  name={getTransactionIcon(item.category)}
                  size={24}
                  color={iconColor}
                />
              </View>
            </View>

            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>

            <Text
              style={[
                styles.txAmount,
                {
                  color: isCredit
                    ? DARK_THEME.accentLime
                    : DARK_THEME.textPrimary,
                },
              ]}
            >
              {isCredit ? '+' : '-'}
              {formatCurrency(Math.abs(item.amount))}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [navigation, formatCurrency, getTransactionIcon],
  );

  // Empty state component with CTA
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="gift-outline"
            size={64}
            color={DARK_THEME.accentLime}
          />
        </View>
        <Text style={styles.emptyTitle}>Henüz bir hediyen yok 🎁</Text>
        <Text style={styles.emptyText}>
          İlk anını paylaş veya yakınındaki anlara hediye gönder. Her hediye
          burada görünecek!
        </Text>
        <TouchableOpacity
          style={styles.emptyCTAButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Discover');
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="compass-outline"
            size={20}
            color={DARK_THEME.background}
          />
          <Text style={styles.emptyCTAText}>Anları Keşfet</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigation],
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'incoming', label: 'Gelen' },
    { key: 'outgoing', label: 'Giden' },
    { key: 'gifts', label: 'Hediyeler' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <NetworkGuard
        offlineMessage="Cüzdan bilgilerinizi görmek için internet bağlantısı gerekli."
        onRetry={onRefresh}
      >
        {/* 1. HEADER & BALANCE CARD */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[DARK_THEME.backgroundSecondary, DARK_THEME.background]}
            style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
          >
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessible={true}
                accessibilityLabel="Geri dön"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cüzdan</Text>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('TransactionHistory')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessible={true}
                accessibilityLabel="İşlem geçmişi"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* GLASS BALANCE CARD */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.balanceCardContainer}
            >
              <BlurView intensity={40} tint="dark" style={styles.balanceCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardTop}>
                  <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>TRY</Text>
                  </View>
                </View>

                <Text style={styles.balanceValue}>
                  {formatCurrency(balance?.available || 0)}
                </Text>

                {/* Pending Balance - Tappable for ProofReminder */}
                {(balance?.pending || 0) > 0 && (
                  <TouchableOpacity
                    onPress={handlePendingTap}
                    style={styles.pendingBadge}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color={DARK_THEME.accentAmber}
                    />
                    <Text style={styles.pendingBalance}>
                      +{formatCurrency(balance?.pending || 0)} beklemede
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={DARK_THEME.accentAmber}
                    />
                  </TouchableOpacity>
                )}

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => navigation.navigate('Withdraw')}
                    accessible={true}
                    accessibilityLabel="Para çek"
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionBtnTextPrimary}>Para Çek</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* 2. TRANSACTIONS */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter(filter.key);
                }}
                style={[
                  styles.filterPill,
                  activeFilter === filter.key && styles.filterPillActive,
                  index === 0 && styles.filterPillFirst,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                tintColor={DARK_THEME.accent}
              />
            }
          />
        </View>

        {/* Bottom Navigation */}
        <BottomNav activeTab="Profile" />
      </NetworkGuard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  headerSection: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  historyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Balance Card
  balanceCardContainer: {
    marginHorizontal: 24,
    borderRadius: 24,
    shadowColor: DARK_THEME.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    backgroundColor: DARK_THEME.cardBackground,
    borderWidth: 1,
    borderColor: DARK_THEME.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    color: DARK_THEME.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  currencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    gap: 6,
  },
  pendingBalance: {
    fontSize: 14,
    color: primitives.amber[400],
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: DARK_THEME.accent,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionBtnTextPrimary: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Transactions
  contentSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 24,
    marginBottom: 16,
  },
  filterScroll: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingRight: 24,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: DARK_THEME.filterInactive,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterPillActive: {
    backgroundColor: DARK_THEME.filterActive,
    borderColor: DARK_THEME.filterActive,
  },
  filterPillFirst: {
    marginLeft: 24,
  },
  filterText: {
    color: DARK_THEME.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for bottom nav
  },
  txItem: {
    marginBottom: 12,
  },
  txItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 16,
  },
  txIconContainer: {
    marginRight: 16,
  },
  txIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  txDate: {
    color: DARK_THEME.textSecondary,
    fontSize: 12,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: DARK_THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_THEME.accentLime,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
  },
  emptyCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_THEME.background,
  },
});

// Wrap with ScreenErrorBoundary for critical wallet functionality
const WalletScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <WalletScreen />
  </ScreenErrorBoundary>
);

export default WalletScreenWithErrorBoundary;
