import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@/components/BottomNav';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/context/ToastContext';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type FilterType = 'all' | 'incoming' | 'outgoing';

// Mock data removed
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
      type: t.type as 'gift_received' | 'withdrawal' | 'gift_sent',
      title: t.description || t.type,
      subtitle: t.status || '',
      amount: t.amount,
      isPositive: t.type !== 'withdrawal',
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

  const handleWithdraw = () => {
    navigation.navigate('Withdraw');
  };

  const handleViewDetails = () => {
    navigation.navigate('TransactionHistory');
  };

  const getTransactionIcon = (
    type: 'gift_received' | 'withdrawal' | 'gift_sent',
  ) => {
    switch (type) {
      case 'gift_received':
        return 'gift';
      case 'withdrawal':
        return 'arrow-top-right';
      case 'gift_sent':
        return 'gift-open';
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
      >
        <View style={styles.transactionLeft}>
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons
              name={getTransactionIcon(transaction.type)}
              size={20}
              color={COLORS.text.primary}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionSubtitle}>
              {transaction.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              transaction.isPositive && styles.transactionAmountPositive,
            ]}
          >
            {transaction.isPositive ? '+' : '-'}${transaction.amount.toFixed(2)}
          </Text>
          {transaction.hasProofLoop && (
            <View style={styles.proofLoopBadge}>
              <Text style={styles.proofLoopText}>ProofLoop</Text>
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
        <MaterialCommunityIcons
          name="receipt"
          size={48}
          color={COLORS.text.secondary}
        />
        <Text style={styles.emptyText}>No transactions yet</Text>
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
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          style={styles.headerButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialCommunityIcons
            name="shield-check"
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ${(balance?.available || 1250).toFixed(2)}
            </Text>
            <Text style={styles.escrowText}>
              ${(balance?.pending || 300).toFixed(2)} in Escrow (waiting for
              proof)
            </Text>
          </View>
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleWithdraw}
            >
              <Text style={styles.primaryButtonText}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewDetails}
            >
              <Text style={styles.secondaryButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Filter */}
        <View style={styles.filterContainer}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'all' && styles.filterButtonTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'incoming' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('incoming')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'incoming' &&
                    styles.filterButtonTextActive,
                ]}
              >
                Incoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === 'outgoing' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter('outgoing')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === 'outgoing' &&
                    styles.filterButtonTextActive,
                ]}
              >
                Outgoing
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {/* Transaction List */}
        <View style={styles.transactionListContainer}>
          <FlashList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={false}
          />
        </View>

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
  transactionListContainer: {
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceInfo: {
    marginBottom: 24,
  },
  balanceLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    ...TYPOGRAPHY.display1,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  escrowText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.mintBackground,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.mintBackground,
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: COLORS.utility.white,
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
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.mintBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  transactionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  transactionAmountPositive: {
    color: COLORS.feedback.success,
  },
  proofLoopBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.amberBright,
    borderRadius: 10,
  },
  proofLoopText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.amberBright,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.body,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});

// Wrap with ScreenErrorBoundary for critical wallet functionality
const WalletScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <WalletScreen />
  </ScreenErrorBoundary>
);

export default WalletScreenWithErrorBoundary;
