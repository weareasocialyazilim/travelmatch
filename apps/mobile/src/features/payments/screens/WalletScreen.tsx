/**
 * WalletScreen - Premium Dark Wallet with Glass Morphism
 *
 * Implements UX best practices:
 * - Dark theme with glass morphism balance card
 * - 60-30-10 color rule (Background 60%, Text 30%, Accent 10%)
 * - Premium blur effects and smooth animations
 * - Color-coded transactions (green income, red expense)
 * - Quick action buttons with gradient
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
import { COLORS as _COLORS, primitives as _primitives, GRADIENTS as _GRADIENTS } from '@/constants/colors';
import { TYPOGRAPHY as _TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'incoming' | 'outgoing' | 'gifts';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Dark theme colors
const DARK_THEME = {
  background: '#0C0A09',
  backgroundSecondary: '#1a1a1a',
  cardBackground: 'rgba(20,20,20,0.6)',
  cardBorder: 'rgba(255,255,255,0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  accent: '#CCFF00', // Neon lime for primary actions
  accentPink: '#FF0099', // Neon pink for expenses
  filterActive: primitives.magenta[500],
  filterInactive: 'rgba(255,255,255,0.05)',
};

const WalletScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
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
  }, [refreshBalance, loadTransactions]);

  // Use API transactions - adapt to display format
  const displayTransactions = useMemo(() => {
    return transactions.map((t) => ({
      id: t.id,
      type: t.type as 'gift_received' | 'withdrawal' | 'gift_sent' | 'deposit',
      title: t.description || t.type,
      date: t.status || '',
      amount: t.amount,
      isPositive: t.type !== 'withdrawal' && t.type !== 'gift_sent',
      category: t.type === 'gift_received' || t.type === 'gift_sent' ? 'gift' :
                t.type === 'deposit' ? 'topup' : 'refund',
    }));
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return displayTransactions;
    if (activeFilter === 'incoming')
      return displayTransactions.filter((t) => t.isPositive);
    if (activeFilter === 'gifts')
      return displayTransactions.filter((t) => t.category === 'gift');
    return displayTransactions.filter((t) => !t.isPositive);
  }, [displayTransactions, activeFilter]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshBalance();
      await loadTransactions();
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

  const getTransactionIcon = useCallback((category: string): IconName => {
    switch (category) {
      case 'gift':
        return 'gift-outline';
      case 'topup':
        return 'wallet-plus';
      case 'refund':
        return 'refresh';
      default:
        return 'cash';
    }
  }, []);

  // Render transaction item
  const renderTransaction = useCallback(
    ({ item, index }: { item: (typeof displayTransactions)[0]; index: number }) => {
      const isCredit = item.isPositive;

      return (
        <Animated.View
          entering={FadeInUp.delay(index * 100)}
          style={styles.txItem}
        >
          <TouchableOpacity
            style={styles.txItemContent}
            onPress={() =>
              navigation.navigate('TransactionDetail', {
                transactionId: item.id,
              })
            }
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`${item.title}, ${isCredit ? 'gelen' : 'giden'} ${formatCurrency(Math.abs(item.amount))}`}
            accessibilityRole="button"
            accessibilityHint="İşlem detaylarını görüntüler"
          >
            <View style={styles.txIconContainer}>
              <View
                style={[
                  styles.txIconBg,
                  {
                    backgroundColor: isCredit
                      ? 'rgba(204, 255, 0, 0.1)'
                      : 'rgba(255, 0, 153, 0.1)',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={getTransactionIcon(item.category)}
                  size={24}
                  color={isCredit ? DARK_THEME.accent : DARK_THEME.accentPink}
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
                { color: isCredit ? DARK_THEME.accent : DARK_THEME.textPrimary },
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

  // Empty state component
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="receipt"
            size={48}
            color={DARK_THEME.textSecondary}
          />
        </View>
        <Text style={styles.emptyTitle}>Henüz işlem yok</Text>
        <Text style={styles.emptyText}>
          Hediye gönderdiğinizde veya aldığınızda tüm işlemleriniz burada
          görünecek.
        </Text>
      </View>
    ),
    [],
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
                <MaterialCommunityIcons name="history" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* GLASS BALANCE CARD */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              style={styles.balanceCardContainer}
            >
              <BlurView
                intensity={40}
                tint="dark"
                style={styles.balanceCard}
              >
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

                {(balance?.pending || 0) > 0 && (
                  <Text style={styles.pendingBalance}>
                    +{formatCurrency(balance?.pending || 0)} beklemede
                  </Text>
                )}

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={() => navigation.navigate('AddMoney')}
                    accessible={true}
                    accessibilityLabel="Para yükle"
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionBtnTextPrimary}>+ Yükle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtnSecondary}
                    onPress={() => navigation.navigate('Withdraw')}
                    accessible={true}
                    accessibilityLabel="Para çek"
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionBtnTextSecondary}>Çek</Text>
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
                  index === 0 && { marginLeft: 24 },
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
  pendingBalance: {
    fontSize: 14,
    color: primitives.amber[400],
    marginBottom: 16,
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
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnTextSecondary: {
    color: 'white',
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
  },
});

// Wrap with ScreenErrorBoundary for critical wallet functionality
const WalletScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <WalletScreen />
  </ScreenErrorBoundary>
);

export default WalletScreenWithErrorBoundary;
