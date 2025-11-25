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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Transaction } from '../types';
import { MOCK_TRANSACTION } from '../mocks';

export const TransactionDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
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
          <Text style={styles.amountValue}>${transaction.amount.toFixed(2)}</Text>
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
                <Text style={styles.participantName}>{transaction.giver.name}</Text>
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
              <Text style={styles.detailValue}>{transaction.transactionId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
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
                navigation.navigate('ProofDetail', { proofId: transaction.proofId })
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
              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
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
              onPress={() => navigation.navigate('RefundRequest', { transactionId: transaction.id })}
              activeOpacity={0.8}
            >
              <Icon name="undo-variant" size={24} color={COLORS.warning} />
              <Text style={styles.actionButtonText}>Request Refund</Text>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  shareButton: {
    padding: LAYOUT.padding / 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 3,
    alignItems: 'center',
    marginTop: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 2,
    ...VALUES.shadow,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
    marginBottom: LAYOUT.padding * 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 2,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding / 2,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: LAYOUT.padding * 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding * 1.5,
  },
  participantCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding,
    ...VALUES.shadow,
  },
  participantLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  participantLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.padding / 2,
    textTransform: 'uppercase',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: LAYOUT.padding,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: LAYOUT.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  descriptionValue: {
    textAlign: 'left',
  },
  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  proofInfo: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 4,
  },
  proofSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding,
    ...VALUES.shadow,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginTop: LAYOUT.padding,
  },
  helpContent: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 4,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  helpButton: {
    backgroundColor: COLORS.info,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
  },
  helpButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
