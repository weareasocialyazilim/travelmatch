import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { MOCK_TRANSACTION } from '../mocks';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type TransactionDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'TransactionDetail'
>;

export const TransactionDetailScreen: React.FC<
  TransactionDetailScreenProps
> = ({ navigation, route: _route }) => {
  const transaction = MOCK_TRANSACTION; // In real app, fetch from route.params or API

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
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            // Implement share functionality
          }}
        >
          <Icon name="share-variant" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
          >
            <Icon
              name={getStatusIcon(transaction.status)}
              size={16}
              color={COLORS.white}
            />
            <Text style={styles.statusText}>
              {transaction.status.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>

          {transaction.giver && (
            <View style={styles.participantCard}>
              <View style={styles.participantLabel}>
                <Icon name="hand-heart" size={16} color={COLORS.primary} />
                <Text style={styles.participantLabelText}>Giver</Text>
              </View>
              <View style={styles.participantInfo}>
                <Image
                  source={{ uri: transaction.giver.avatar }}
                  style={styles.participantAvatar}
                />
                <Text style={styles.participantName}>
                  {transaction.giver.name}
                </Text>
              </View>
            </View>
          )}

          {transaction.receiver && (
            <View style={styles.participantCard}>
              <View style={styles.participantLabel}>
                <Icon name="hand-extended" size={16} color={COLORS.accent} />
                <Text style={styles.participantLabelText}>Receiver</Text>
              </View>
              <View style={styles.participantInfo}>
                <Image
                  source={{ uri: transaction.receiver.avatar }}
                  style={styles.participantAvatar}
                />
                <Text style={styles.participantName}>
                  {transaction.receiver.name}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>
                {transaction.transactionId || transaction.id}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.date || transaction.createdAt)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {transaction.paymentMethod}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {transaction.type.charAt(0).toUpperCase() +
                  transaction.type.slice(1)}
              </Text>
            </View>

            {transaction.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={[styles.detailValue, styles.descriptionValue]}>
                  {transaction.description}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Linked Proof */}
        {transaction.proofId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked Proof</Text>
            <TouchableOpacity
              style={styles.proofCard}
              onPress={() =>
                transaction.proofId &&
                navigation.navigate('ProofDetail', {
                  proofId: transaction.proofId,
                })
              }
              activeOpacity={0.8}
            >
              <Icon name="check-decagram" size={32} color={COLORS.success} />
              <View style={styles.proofInfo}>
                <Text style={styles.proofTitle}>View Proof</Text>
                <Text style={styles.proofSubtitle}>
                  See the verified proof for this transaction
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Implement download receipt
            }}
            activeOpacity={0.8}
          >
            <Icon name="download" size={24} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {transaction.status === 'completed' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('RefundRequest', {
                  transactionId: transaction.id,
                })
              }
              activeOpacity={0.8}
            >
              <Icon name="undo-variant" size={24} color={COLORS.warning} />
              <Text style={styles.actionButtonText}>Request Refund</Text>
              <Icon
                name="chevron-right"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Implement report issue
            }}
            activeOpacity={0.8}
          >
            <Icon name="alert-circle" size={24} color={COLORS.error} />
            <Text style={styles.actionButtonText}>Report Issue</Text>
            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.helpCard}>
          <Icon name="information" size={20} color={COLORS.info} />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Contact support if you have questions about this transaction.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Text style={styles.helpButtonText}>Contact</Text>
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
