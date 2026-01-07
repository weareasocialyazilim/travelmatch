/**
 * TransactionHistoryScreen - Transaction History with 60-30-10 Color Rule
 *
 * Implements UX best practices:
 * - Color-coded amounts (green for income, red for expense)
 * - Clean filter pills
 * - Minimalist card design
 */

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
import { COLORS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type FilterType = 'Tümü' | 'Gönderilen' | 'Alınan' | 'Çekimler';

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'withdrawal';
  title: string;
  date: string;
  amount: number;
  status: 'Tamamlandı' | 'Doğrulandı' | 'Beklemede' | 'Başarısız';
  icon: IconName;
  iconBgColor: string;
}

export const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<FilterType>('Tümü');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'received',
      title: "Ayşe'den Hediye",
      date: '26 Ara 2024',
      amount: 250.0,
      status: 'Tamamlandı',
      icon: 'gift-outline',
      iconBgColor: primitives.emerald[50],
    },
    {
      id: '2',
      type: 'sent',
      title: "Mehmet'e Hediye",
      date: '24 Ara 2024',
      amount: -125.0,
      status: 'Doğrulandı',
      icon: 'gift',
      iconBgColor: primitives.stone[100],
    },
    {
      id: '3',
      type: 'withdrawal',
      title: 'Banka Hesabına Transfer',
      date: '20 Ara 2024',
      amount: -500.0,
      status: 'Beklemede',
      icon: 'bank-transfer-out',
      iconBgColor: primitives.amber[50],
    },
    {
      id: '4',
      type: 'received',
      title: "Zeynep'den Hediye",
      date: '19 Ara 2024',
      amount: 175.0,
      status: 'Başarısız',
      icon: 'gift-outline',
      iconBgColor: primitives.red[50],
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'Tümü') return true;
    if (filter === 'Gönderilen') return transaction.type === 'sent';
    if (filter === 'Alınan') return transaction.type === 'received';
    if (filter === 'Çekimler') return transaction.type === 'withdrawal';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return { bg: primitives.emerald[50], text: primitives.emerald[600] };
      case 'Doğrulandı':
        return { bg: primitives.blue[50], text: primitives.blue[600] };
      case 'Beklemede':
        return { bg: primitives.amber[50], text: primitives.amber[600] };
      case 'Başarısız':
        return { bg: primitives.red[50], text: primitives.red[600] };
      default:
        return { bg: primitives.stone[100], text: COLORS.text.secondary };
    }
  };

  // Format currency in Turkish Lira
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
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
        <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <View style={styles.filterButtonGroup}>
            {(['Tümü', 'Gönderilen', 'Alınan', 'Çekimler'] as FilterType[]).map(
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
                          ? primitives.emerald[500]
                          : transaction.type === 'sent'
                            ? primitives.stone[600]
                            : primitives.amber[600]
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
                              ? primitives.emerald[500]
                              : primitives.red[500],
                        },
                      ]}
                    >
                      {transaction.amount > 0 ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
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
            <Text style={styles.emptyStateTitle}>Henüz İşlem Yok</Text>
            <Text style={styles.emptyStateText}>
              Hediye gönderdiğinizde veya aldığınızda tüm işlemleriniz burada
              görünecek.
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
