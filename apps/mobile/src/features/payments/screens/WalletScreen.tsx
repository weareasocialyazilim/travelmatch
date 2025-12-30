/**
 * WalletScreen - Premium Wallet Management
 *
 * Implements UX best practices:
 * - 60-30-10 color rule (Background 60%, Text 30%, Accent 10%)
 * - Premium dark card design (inspired by banking apps)
 * - Color-coded transactions (green income, red expense)
 * - Quick action buttons
 * - Clean minimalist layout
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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import BottomNav from '@/components/BottomNav';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/context/ToastContext';
import { COLORS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = CARD_WIDTH * 0.58;

type FilterType = 'all' | 'incoming' | 'outgoing';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  onPress: () => void;
  variant?: 'default' | 'active';
}

const WalletScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
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

  // Use API transactions
  const displayTransactions = useMemo(() => {
    return transactions.map((t) => ({
      id: t.id,
      type: t.type as 'gift_received' | 'withdrawal' | 'gift_sent' | 'deposit',
      title: t.description || t.type,
      subtitle: t.status || '',
      amount: t.amount,
      isPositive: t.type !== 'withdrawal' && t.type !== 'gift_sent',
      hasProofLoop: t.type === 'gift_received' && t.status === 'pending',
      status: t.status,
    }));
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return displayTransactions;
    if (selectedFilter === 'incoming')
      return displayTransactions.filter((t) => t.isPositive);
    return displayTransactions.filter((t) => !t.isPositive);
  }, [displayTransactions, selectedFilter]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshBalance();
      await loadTransactions();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Cüzdan bilgileri yüklenemedi. Lütfen tekrar deneyin.');
    }
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'add',
      label: 'Yükle',
      icon: 'plus-circle-outline',
      onPress: () => navigation.navigate('AddMoney' as never),
    },
    {
      id: 'withdraw',
      label: 'Çek',
      icon: 'bank-transfer-out',
      onPress: () => navigation.navigate('Withdraw'),
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: 'history',
      onPress: () => navigation.navigate('TransactionHistory'),
      variant: 'active',
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (
    type: 'gift_received' | 'withdrawal' | 'gift_sent' | 'deposit',
  ): IconName => {
    switch (type) {
      case 'gift_received':
        return 'gift-outline';
      case 'withdrawal':
        return 'bank-transfer-out';
      case 'gift_sent':
        return 'gift';
      case 'deposit':
        return 'credit-card-plus-outline';
      default:
        return 'cash';
    }
  };

  // Memoized render function for transaction items
  const renderTransactionItem = useCallback(
    ({ item: transaction }: { item: (typeof filteredTransactions)[0] }) => (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          navigation.navigate('TransactionDetail', {
            transactionId: transaction.id,
          })
        }
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: transaction.isPositive
                ? primitives.emerald[50]
                : primitives.stone[100],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={getTransactionIcon(transaction.type)}
            size={22}
            color={
              transaction.isPositive
                ? primitives.emerald[500]
                : primitives.stone[500]
            }
          />
        </View>

        {/* Content */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
        </View>

        {/* Amount */}
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color: transaction.isPositive
                  ? primitives.emerald[500]
                  : primitives.red[500],
              },
            ]}
          >
            {transaction.isPositive ? '+' : '-'}
            {formatCurrency(Math.abs(transaction.amount))}
          </Text>
          {transaction.hasProofLoop && (
            <View style={styles.proofLoopBadge}>
              <Text style={styles.proofLoopText}>Beklemede</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  // Empty state component
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="receipt"
            size={48}
            color={COLORS.text.secondary}
          />
        </View>
        <Text style={styles.emptyTitle}>Henüz işlem yok</Text>
        <Text style={styles.emptyText}>
          Hediye gönderdiğinizde veya aldığınızda tüm işlemleriniz burada görünecek.
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cüzdan</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('PaymentMethods' as never)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Premium Wallet Card */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={styles.cardContainer}
        >
          <LinearGradient
            colors={['#1C1917', '#292524', '#1C1917']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletCard}
          >
            {/* Card Pattern Overlay */}
            <View style={styles.cardPattern}>
              <View style={styles.cardPatternCircle1} />
              <View style={styles.cardPatternCircle2} />
            </View>

            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>TravelMatch</Text>
              <MaterialCommunityIcons
                name="contactless-payment"
                size={28}
                color="rgba(255, 255, 255, 0.6)"
              />
            </View>

            {/* Balance Section */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Bakiye</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(balance?.available || 0)}
              </Text>
              {(balance?.pending || 0) > 0 && (
                <Text style={styles.pendingBalance}>
                  +{formatCurrency(balance?.pending || 0)} beklemede
                </Text>
              )}
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.cardChip}>
                <MaterialCommunityIcons
                  name="integrated-circuit-chip"
                  size={32}
                  color="rgba(255, 215, 0, 0.8)"
                />
              </View>
              <View style={styles.cardDots}>
                <Text style={styles.cardDotsText}>•••• •••• ••••</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.quickActionsContainer}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  action.variant === 'active' && styles.quickActionIconActive,
                ]}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={22}
                  color={
                    action.variant === 'active'
                      ? COLORS.white
                      : COLORS.text.primary
                  }
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  action.variant === 'active' && styles.quickActionLabelActive,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Transactions Section */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.transactionsSection}
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İşlemler</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <Text style={styles.seeAllLink}>Tümü</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented Filter */}
          <View style={styles.filterContainer}>
            <View style={styles.segmentedControl}>
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'incoming', label: 'Gelen' },
                { key: 'outgoing', label: 'Giden' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === filter.key &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transaction List */}
          <View style={styles.transactionListContainer}>
            <FlashList
              data={filteredTransactions}
              renderItem={renderTransactionItem}
              ListEmptyComponent={renderEmptyState}
              scrollEnabled={false}
              estimatedItemSize={72}
            />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  // Premium Wallet Card
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  walletCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardPatternCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardPatternCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  balanceSection: {
    flex: 1,
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  pendingBalance: {
    fontSize: 13,
    color: primitives.amber[400],
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    opacity: 0.8,
  },
  cardDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDotsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIconActive: {
    backgroundColor: primitives.stone[800],
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  quickActionLabelActive: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },

  // Transactions Section
  transactionsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Filter
  filterContainer: {
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: primitives.stone[100],
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },

  // Transaction List
  transactionListContainer: {
    minHeight: 200,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: primitives.stone[100],
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  transactionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  proofLoopBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: primitives.amber[100],
    borderRadius: 8,
  },
  proofLoopText: {
    fontSize: 11,
    fontWeight: '600',
    color: primitives.amber[700],
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: primitives.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 100,
  },
});

// Wrap with ScreenErrorBoundary for critical wallet functionality
const WalletScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <WalletScreen />
  </ScreenErrorBoundary>
);

export default WalletScreenWithErrorBoundary;
