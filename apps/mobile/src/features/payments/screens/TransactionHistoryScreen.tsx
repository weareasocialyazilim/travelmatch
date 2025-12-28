import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type FilterType = 'All' | 'Sent' | 'Received' | 'Withdrawals';

interface Transaction {
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

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'received',
      title: 'Gift from Alex Johnson',
      date: 'Oct 26, 2023',
      amount: 50.0,
      status: 'Completed',
      icon: 'inbox-arrow-down',
      iconBgColor: COLORS.successTransparent33,
    },
    {
      id: '2',
      type: 'sent',
      title: "Gift for Maria's trip",
      date: 'Oct 24, 2023',
      amount: -25.0,
      status: 'Verified',
      icon: 'inbox-arrow-up',
      iconBgColor: `${COLORS.brand.primary}33`,
    },
    {
      id: '3',
      type: 'withdrawal',
      title: 'Withdrawal to Bank Account',
      date: 'Oct 20, 2023',
      amount: -150.0,
      status: 'Pending',
      icon: 'bank',
      iconBgColor: `${COLORS.border.default}80`,
    },
    {
      id: '4',
      type: 'received',
      title: 'Gift from Samantha Bee',
      date: 'Oct 19, 2023',
      amount: 75.0,
      status: 'Failed',
      icon: 'inbox-arrow-down',
      iconBgColor: `${COLORS.border.default}80`,
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'All') return true;
    if (filter === 'Sent') return transaction.type === 'sent';
    if (filter === 'Received') return transaction.type === 'received';
    if (filter === 'Withdrawals') return transaction.type === 'withdrawal';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: COLORS.successTransparent33, text: COLORS.feedback.success };
      case 'Verified':
        return { bg: COLORS.infoTransparent33, text: COLORS.brand.primary };
      case 'Pending':
        return { bg: COLORS.warningTransparent33, text: COLORS.feedback.warning };
      case 'Failed':
        return { bg: `${COLORS.brand.primary}33`, text: COLORS.brand.primary };
      default:
        return { bg: COLORS.border.default, text: COLORS.text.secondary };
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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
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
                          ? COLORS.feedback.success
                          : transaction.type === 'sent'
                          ? COLORS.brand.primary
                          : COLORS.text.secondary
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
                              ? COLORS.feedback.success
                              : COLORS.text.primary,
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
                color={COLORS.text.secondary}
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
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.bg.primary}CC`,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border.default}20`,
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
    color: COLORS.text.primary,
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
    backgroundColor: `${COLORS.border.default}40`,
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
    backgroundColor: COLORS.utility.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  transactionList: {
    paddingTop: 16,
    paddingBottom: 96,
    gap: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.text.primary,
  },
  transactionDate: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '400',
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
