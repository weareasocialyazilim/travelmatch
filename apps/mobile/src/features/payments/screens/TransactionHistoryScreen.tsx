import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type FilterType = 'All' | 'Sent' | 'Received' | 'Withdrawals';

interface DisplayTransaction {
  id: string;
  type: 'received' | 'sent' | 'withdrawal';
  title: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Verified' | 'Pending' | 'Failed';
  icon: IconName;
  iconBgColor: string;
}

export const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<FilterType>('All');
  const [refreshing, setRefreshing] = useState(false);

  const { transactions, transactionsLoading, loadTransactions } = usePayments();

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Map API transactions to display format
  const displayTransactions: DisplayTransaction[] = useMemo(() => {
    return transactions.map((t) => {
      const isReceived = t.type === 'gift_received' || t.type === 'deposit';
      const isWithdrawal = t.type === 'withdrawal';

      let displayType: 'received' | 'sent' | 'withdrawal' = 'sent';
      if (isReceived) displayType = 'received';
      if (isWithdrawal) displayType = 'withdrawal';

      let icon: IconName = 'inbox-arrow-up';
      let iconBgColor = `${COLORS.primary}33`;

      if (isReceived) {
        icon = 'inbox-arrow-down';
        iconBgColor = COLORS.successTransparent33;
      } else if (isWithdrawal) {
        icon = 'bank';
        iconBgColor = `${COLORS.border}80`;
      }

      // Map status
      let status: 'Completed' | 'Verified' | 'Pending' | 'Failed' = 'Completed';
      if (t.status === 'pending') status = 'Pending';
      else if (t.status === 'failed' || t.status === 'cancelled')
        status = 'Failed';
      else if (t.status === 'verified') status = 'Verified';

      // Format date
      const dateObj = new Date(t.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return {
        id: t.id,
        type: displayType,
        title: t.description || t.type.replace(/_/g, ' '),
        date: formattedDate,
        amount: t.amount,
        status,
        icon,
        iconBgColor,
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return displayTransactions.filter((transaction) => {
      if (filter === 'All') return true;
      if (filter === 'Sent') return transaction.type === 'sent';
      if (filter === 'Received') return transaction.type === 'received';
      if (filter === 'Withdrawals') return transaction.type === 'withdrawal';
      return true;
    });
  }, [displayTransactions, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: COLORS.successTransparent33, text: COLORS.success };
      case 'Verified':
        return { bg: COLORS.infoTransparent33, text: COLORS.buttonPrimary };
      case 'Pending':
        return { bg: COLORS.warningTransparent33, text: COLORS.warning };
      case 'Failed':
        return { bg: `${COLORS.primary}33`, text: COLORS.primary };
      default:
        return { bg: COLORS.border, text: COLORS.textSecondary };
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading State */}
        {transactionsLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <View style={styles.filterButtonGroup}>
            {(['All', 'Sent', 'Received', 'Withdrawals'] as FilterType[]).map(
              (filterOption) => (
                <TouchableOpacity
                  key={filterOption}
                  style={[
                    styles.filterButton,
                    filter === filterOption && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter(filterOption)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === filterOption && styles.filterButtonTextActive,
                    ]}
                  >
                    {filterOption}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Transaction List */}
        {filteredTransactions.length > 0 ? (
          <View style={styles.transactionList}>
            {filteredTransactions.map((transaction) => {
              const statusColors = getStatusColor(transaction.status);
              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('TransactionDetail', {
                      transactionId: transaction.id,
                    })
                  }
                >
                  {/* Icon */}
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: transaction.iconBgColor },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={transaction.icon}
                      size={24}
                      color={
                        transaction.type === 'received'
                          ? COLORS.success
                          : transaction.type === 'sent'
                          ? COLORS.primary
                          : COLORS.textSecondary
                      }
                    />
                  </View>

                  {/* Content */}
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionTitle}>
                      {transaction.title}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {transaction.date}
                    </Text>
                  </View>

                  {/* Amount & Status */}
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.amount > 0
                              ? COLORS.success
                              : COLORS.text,
                        },
                      ]}
                    >
                      {transaction.amount > 0 ? '+' : ''}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusColors.text },
                        ]}
                      >
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <MaterialCommunityIcons
                name={'history' as IconName}
                size={48}
                color={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.emptyStateTitle}>Your History Awaits</Text>
            <Text style={styles.emptyStateText}>
              Once you send or receive a gift, all your transactions will appear
              here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.background}CC`,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border}20`,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.border}40`,
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  filterButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionList: {
    paddingTop: 16,
    paddingBottom: 96,
    gap: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
    gap: 4,
  },
  transactionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text,
  },
  transactionDate: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 96,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
