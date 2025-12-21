import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { logger } from '@/utils/logger';
import { paymentService } from '@/services/paymentService';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { Transaction } from '@/services/paymentService';
import type { StackScreenProps } from '@react-navigation/stack';

type TransactionDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'TransactionDetail'
>;

export const TransactionDetailScreen: React.FC<
  TransactionDetailScreenProps
> = ({ navigation, route }) => {
  const { transactionId } = route.params || {};
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }
      try {
        const { transaction } = await paymentService.getTransaction(
          transactionId,
        );
        setTransaction(transaction);
      } catch (_error) {
        logger.error('Failed to fetch transaction', _error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      case 'refunded':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'failed':
        return 'close-circle';
      case 'refunded':
        return 'undo-variant';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centeredContainer]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centeredContainer]}>
          <Text style={styles.messageText}>Transaction not found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Map transaction data for display
  const metadata = transaction.metadata || {};

  // Safely access metadata values - they can be primitive types or null
  const recipientValue = metadata['recipient'];
  const paymentMethodValue = metadata['paymentMethod'];
  const feesValue = metadata['fees'];

  // Type guard functions with proper parameter types
  const parseRecipient = (): {
    name: string;
    avatar: string | null;
    id?: string;
  } => {
    if (
      recipientValue &&
      typeof recipientValue === 'object' &&
      'name' in recipientValue
    ) {
      const r = recipientValue as Record<string, unknown>;
      return {
        name: String(r['name'] ?? 'Unknown'),
        avatar: r['avatar'] ? String(r['avatar']) : null,
        id: r['id'] ? String(r['id']) : undefined,
      };
    }
    return { name: 'Unknown', avatar: null };
  };

  const parsePaymentMethod = (): { type: string; last4: string } => {
    if (
      paymentMethodValue &&
      typeof paymentMethodValue === 'object' &&
      'type' in paymentMethodValue
    ) {
      const pm = paymentMethodValue as Record<string, unknown>;
      return {
        type: String(pm['type'] ?? 'card'),
        last4: String(pm['last4'] ?? '****'),
      };
    }
    return { type: 'card', last4: '****' };
  };

  const displayTransaction = {
    ...transaction,
    recipient: parseRecipient(),
    paymentMethod: parsePaymentMethod(),
    fees: typeof feesValue === 'number' ? feesValue : 0,
    total: transaction.amount + (typeof feesValue === 'number' ? feesValue : 0),
    reference: transaction.id,
  };

  // Use displayTransaction instead of transaction for the rest of the render
  const tx = displayTransaction;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={styles.spacer} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: getStatusColor(tx.status) + '20' },
            ]}
          >
            <Icon
              name={getStatusIcon(tx.status)}
              size={40}
              color={getStatusColor(tx.status)}
            />
          </View>
          <Text style={styles.amount}>
            {tx.currency === 'USD' ? '$' : tx.currency}
            {tx.amount.toFixed(2)}
          </Text>
          <Text
            style={[styles.statusText, { color: getStatusColor(tx.status) }]}
          >
            {tx.status.toUpperCase()}
          </Text>
          <Text style={styles.date}>{formatDate(tx.date)}</Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>
              {tx.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{tx.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{tx.reference}</Text>
          </View>
        </View>

        {/* Recipient Info (if applicable) */}
        {tx.recipient && tx.recipient.name !== 'Unknown' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {tx.type.includes('sent') ? 'Recipient' : 'Sender'}
            </Text>
            <View style={styles.recipientContainer}>
              <Image
                source={{
                  uri:
                    tx.recipient.avatar ||
                    'https://ui-avatars.com/api/?name=' + tx.recipient.name,
                }}
                style={styles.avatar}
              />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{tx.recipient.name}</Text>
                {tx.recipient.id && (
                  <Text style={styles.recipientId}>ID: {tx.recipient.id}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodContainer}>
            <Icon name="credit-card" size={24} color={COLORS.text} />
            <Text style={styles.paymentMethodText}>
              {tx.paymentMethod.type.toUpperCase()} ••••{' '}
              {tx.paymentMethod.last4}
            </Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>
              {tx.currency === 'USD' ? '$' : tx.currency}
              {tx.amount.toFixed(2)}
            </Text>
          </View>

          {tx.fees > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Fees</Text>
              <Text style={styles.value}>
                {tx.currency === 'USD' ? '$' : tx.currency}
                {tx.fees.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {tx.currency === 'USD' ? '$' : tx.currency}
              {tx.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.helpButton}>
            <Icon name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.helpButtonText}>Report an Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginTop: LAYOUT.padding * 2,
  },
  amount: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: LAYOUT.padding / 2,
  },
  avatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  date: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
    marginTop: LAYOUT.padding / 2,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: LAYOUT.padding,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  headerTitle: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding,
  },
  helpButtonText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  label: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
    flex: 1,
  },
  paymentMethodContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    padding: LAYOUT.padding,
  },
  paymentMethodText: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
  },
  recipientContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    padding: LAYOUT.padding,
  },
  recipientId: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  recipientInfo: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  recipientName: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: LAYOUT.padding / 2,
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  section: {
    marginBottom: LAYOUT.padding * 2,
  },
  sectionTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    marginBottom: LAYOUT.padding * 1.5,
  },
  spacer: {
    width: 40,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 2,
    ...VALUES.shadow,
  },
  statusIconContainer: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: LAYOUT.padding,
    width: 80,
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginTop: LAYOUT.padding / 2,
  },
  totalLabel: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  totalValue: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '800',
  },
  value: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    textAlign: 'right',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: COLORS.text,
  },
  goBackButton: {
    marginTop: 20,
  },
  goBackButtonText: {
    color: COLORS.primary,
  },
});

// Wrap with ScreenErrorBoundary for critical transaction functionality
const TransactionDetailScreenWithErrorBoundary = (
  props: TransactionDetailScreenProps,
) => (
  <ScreenErrorBoundary>
    <TransactionDetailScreen {...props} />
  </ScreenErrorBoundary>
);

export default TransactionDetailScreenWithErrorBoundary;
