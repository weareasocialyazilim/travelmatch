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
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { paymentService, Transaction } from '../services/paymentService';
import type { RootStackParamList } from '../navigation/AppNavigator';
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
        const { transaction } = await paymentService.getTransaction(transactionId);
        setTransaction(transaction);
      } catch (error) {
        console.error('Failed to fetch transaction', error);
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
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: COLORS.text }}>Transaction not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.primary }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Map transaction data for display
  const displayTransaction = {
    ...transaction,
    recipient: transaction.metadata?.recipient || { name: 'Unknown', avatar: null },
    paymentMethod: transaction.metadata?.paymentMethod || { type: 'card', last4: '****' },
    fees: transaction.metadata?.fees || 0,
    total: transaction.amount + (transaction.metadata?.fees || 0),
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
                source={{ uri: tx.recipient.avatar || 'https://ui-avatars.com/api/?name=' + tx.recipient.name }}
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
              {tx.paymentMethod.type.toUpperCase()} •••• {tx.paymentMethod.last4}
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  actionButtonText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: LAYOUT.padding,
  },
  amountCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 2,
    marginTop: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 3,
    ...VALUES.shadow,
  },
  amountLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: LAYOUT.padding / 2,
  },
  amountValue: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  descriptionValue: {
    textAlign: 'left',
  },
  detailLabel: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    alignItems: 'flex-start',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: LAYOUT.padding,
  },
  detailValue: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
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
    fontSize: 20,
    fontWeight: '800',
  },
  helpButton: {
    backgroundColor: COLORS.info,
    borderRadius: VALUES.borderRadius / 2,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding / 2,
  },
  helpButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  helpCard: {
    alignItems: 'center',
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginTop: LAYOUT.padding,
    padding: LAYOUT.padding * 1.5,
  },
  helpContent: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  helpText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  helpTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  participantAvatar: {
    borderRadius: 20,
    height: 40,
    marginRight: LAYOUT.padding,
    width: 40,
  },
  participantCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  participantInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  participantLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  participantLabelText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
    textTransform: 'uppercase',
  },
  participantName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  proofCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  proofInfo: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  proofSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  proofTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: LAYOUT.padding * 2,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: LAYOUT.padding * 1.5,
  },
  shareButton: {
    padding: LAYOUT.padding / 2,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius / 2,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: LAYOUT.padding / 2,
  },
  transactionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
