import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { usePayments } from '@/hooks/usePayments';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type MyGiftsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MyGifts'
>;

interface MyGiftsScreenProps {
  navigation: MyGiftsScreenNavigationProp;
}

export const MyGiftsScreen: React.FC<MyGiftsScreenProps> = ({ navigation }) => {
  const { transactions, transactionsLoading, loadTransactions } = usePayments();

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filter gift transactions
  const giftTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'gift_sent');
  }, [transactions]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalGifted = giftTransactions.reduce((sum, t) => sum + t.amount, 0);
    const completedGifts = giftTransactions.filter(
      (t) => t.status === 'completed',
    ).length;
    const uniqueRecipients = new Set(
      giftTransactions.map((t) => t.referenceId || t.description),
    ).size;

    return {
      totalGifted,
      completedGifts,
      uniqueRecipients,
    };
  }, [giftTransactions]);

  if (transactionsLoading && giftTransactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={'arrow-left' as IconName}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Gifts</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Gifts</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total gifted</Text>
            <Text style={styles.statValue}>
              ${stats.totalGifted.toFixed(0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gifts completed</Text>
            <Text style={styles.statValue}>{stats.completedGifts}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Travelers helped</Text>
            <Text style={styles.statValue}>{stats.uniqueRecipients}</Text>
          </View>
        </View>

        {/* Gift List */}
        {giftTransactions.length > 0 ? (
          <View style={styles.giftList}>
            {giftTransactions.map((transaction) => {
              const isCompleted = transaction.status === 'completed';

              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.giftCard,
                    !isCompleted && styles.giftCardPending,
                  ]}
                >
                  <View style={styles.giftContent}>
                    <View style={styles.giftIconContainer}>
                      <MaterialCommunityIcons
                        name={'gift-outline' as IconName}
                        size={24}
                        color={COLORS.textSecondary}
                      />
                    </View>
                    <View style={styles.giftInfo}>
                      <Text style={styles.giftTitle} numberOfLines={1}>
                        ${transaction.amount.toFixed(2)} Gift
                      </Text>
                      <Text style={styles.giftMeta} numberOfLines={2}>
                        {transaction.description || 'Gift sent'} •{' '}
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  {isCompleted ? (
                    <View style={styles.statusBadgeVerified}>
                      <MaterialCommunityIcons
                        name={'check-decagram' as IconName}
                        size={16}
                        color={COLORS.teal}
                      />
                      <Text style={styles.statusBadgeTextVerified}>
                        Completed
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgePending}>
                      <MaterialCommunityIcons
                        name={'clock-outline' as IconName}
                        size={16}
                        color={COLORS.warning}
                      />
                      <Text style={styles.statusBadgeTextPending}>Pending</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="gift"
            title="No gifts yet"
            subtitle="When you send your first gift, it will appear here."
            illustrationType="no_gifts"
          />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 6,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
  },
  giftList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  giftCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 16,
  },
  giftCardPending: {
    opacity: 0.7,
  },
  giftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  giftIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftInfo: {
    flex: 1,
    paddingTop: 4,
  },
  giftTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  giftMeta: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statusBadgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tealTransparent20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusBadgeTextVerified: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.teal,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warningTransparent20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusBadgeTextPending: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.warning,
  },
});
