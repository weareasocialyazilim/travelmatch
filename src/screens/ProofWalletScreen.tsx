import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Proof } from '../types';
import { MOCK_PROOFS } from '../mocks';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProofWalletScreenProps = StackScreenProps<
  RootStackParamList,
  'ProofWallet'
>;

export const ProofWalletScreen: React.FC<ProofWalletScreenProps> = ({
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'verified' | 'pending'
  >('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'micro-kindness':
        return 'hand-heart';
      case 'verified-experience':
        return 'check-decagram';
      case 'community-proof':
        return 'account-group';
      default:
        return 'star';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'micro-kindness':
        return COLORS.primary;
      case 'verified-experience':
        return COLORS.success;
      case 'community-proof':
        return COLORS.accent;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="check-decagram" size={32} color={COLORS.success} />
        <Text style={styles.statValue}>12</Text>
        <Text style={styles.statLabel}>Verified Proofs</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="hand-heart" size={32} color={COLORS.primary} />
        <Text style={styles.statValue}>$250</Text>
        <Text style={styles.statLabel}>Total Given</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="star" size={32} color={COLORS.warning} />
        <Text style={styles.statValue}>92%</Text>
        <Text style={styles.statLabel}>Trust Score</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
        onPress={() => setSelectedTab('all')}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'all' && styles.activeTabText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'verified' && styles.activeTab]}
        onPress={() => setSelectedTab('verified')}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'verified' && styles.activeTabText,
          ]}
        >
          Verified
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
        onPress={() => setSelectedTab('pending')}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'pending' && styles.activeTabText,
          ]}
        >
          Pending
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProofCard = (proof: Proof) => (
    <TouchableOpacity
      key={proof.id}
      style={styles.proofCard}
      onPress={() => navigation.navigate('ProofDetail', { proofId: proof.id })}
      activeOpacity={0.8}
    >
      {/* Type Badge */}
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: getTypeColor(proof.type) },
        ]}
      >
        <Icon name={getTypeIcon(proof.type)} size={16} color={COLORS.white} />
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, styles[`status${proof.status}`]]}>
        <Icon
          name={getStatusIcon(proof.status)}
          size={14}
          color={COLORS.white}
        />
        <Text style={styles.statusText}>{proof.status}</Text>
      </View>

      <View style={styles.proofContent}>
        <View style={styles.proofHeader}>
          <Text style={styles.proofTitle}>{proof.title}</Text>
          <Text style={styles.trustScore}>
            <Icon name="shield-check" size={14} color={COLORS.success} />{' '}
            {proof.trustScore}%
          </Text>
        </View>

        <Text style={styles.proofDescription} numberOfLines={2}>
          {proof.description}
        </Text>

        <View style={styles.proofMeta}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{proof.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{proof.location}</Text>
          </View>
        </View>

        {proof.amount && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount Given:</Text>
            <Text style={styles.amountValue}>${proof.amount}</Text>
          </View>
        )}

        {proof.receiver && (
          <View style={styles.receiverContainer}>
            <Icon name="account" size={16} color={COLORS.primary} />
            <Text style={styles.receiverText}>Receiver: {proof.receiver}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Proof Wallet</Text>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() =>
              setViewMode(viewMode === 'timeline' ? 'grid' : 'timeline')
            }
          >
            <Icon
              name={viewMode === 'timeline' ? 'view-grid' : 'view-list'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Your Journey of Kindness</Text>
      </LinearGradient>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      {renderTabs()}

      {/* Proofs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_PROOFS.map(renderProofCard)}

        {/* Empty State */}
        {MOCK_PROOFS.length === 0 && (
          <View style={styles.emptyState}>
            <Icon
              name="wallet-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Proofs Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start your kindness journey by creating your first proof
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('ProofUpload')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="plus" size={20} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create Proof</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProofUpload')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="plus" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  amountContainer: {
    alignItems: 'center',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: LAYOUT.padding,
  },
  amountLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  amountValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  createButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  createButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 3,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: LAYOUT.padding,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: LAYOUT.padding * 3,
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: LAYOUT.padding,
    marginTop: LAYOUT.padding * 2,
  },
  fab: {
    borderRadius: 28,
    bottom: LAYOUT.padding * 3,
    height: 56,
    overflow: 'hidden',
    position: 'absolute',
    right: LAYOUT.padding * 2,
    width: 56,
    ...VALUES.shadow,
  },
  fabGradient: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    paddingBottom: LAYOUT.padding * 3,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: LAYOUT.padding * 1.5,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: LAYOUT.padding / 2,
  },
  proofCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 1.5,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  proofContent: {
    padding: LAYOUT.padding * 1.5,
    paddingTop: LAYOUT.padding * 3,
  },
  proofDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: LAYOUT.padding,
  },
  proofHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding,
  },
  proofMeta: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  proofTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  receiverContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: LAYOUT.padding,
  },
  receiverText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 10,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  scrollView: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    flex: 1,
    marginHorizontal: LAYOUT.padding / 2,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: LAYOUT.padding / 4,
    textAlign: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: LAYOUT.padding / 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding * 2,
    marginTop: -LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius / 2,
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    position: 'absolute',
    right: LAYOUT.padding,
    top: LAYOUT.padding,
    zIndex: 1,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: LAYOUT.padding / 4,
    textTransform: 'uppercase',
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: COLORS.transparent,
    borderBottomWidth: 2,
    flex: 1,
    paddingVertical: LAYOUT.padding,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 1.5,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  trustScore: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: VALUES.borderRadius / 2,
    left: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    position: 'absolute',
    top: LAYOUT.padding,
    zIndex: 1,
  },
  viewModeButton: {
    padding: LAYOUT.padding / 2,
  },
});
