import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Proof } from '../types';
import { MOCK_PROOFS } from '../mocks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProofWalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'verified' | 'pending'>('all');
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
        <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'verified' && styles.activeTab]}
        onPress={() => setSelectedTab('verified')}
      >
        <Text style={[styles.tabText, selectedTab === 'verified' && styles.activeTabText]}>
          Verified
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
        onPress={() => setSelectedTab('pending')}
      >
        <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
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
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(proof.type) }]}>
        <Icon name={getTypeIcon(proof.type)} size={16} color={COLORS.white} />
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, styles[`status${proof.status}`]]}>
        <Icon name={getStatusIcon(proof.status)} size={14} color={COLORS.white} />
        <Text style={styles.statusText}>{proof.status}</Text>
      </View>

      <View style={styles.proofContent}>
        <View style={styles.proofHeader}>
          <Text style={styles.proofTitle}>{proof.title}</Text>
          <Text style={styles.trustScore}>
            <Icon name="shield-check" size={14} color={COLORS.success} /> {proof.trustScore}%
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
            onPress={() => setViewMode(viewMode === 'timeline' ? 'grid' : 'timeline')}
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
            <Icon name="wallet-outline" size={64} color={COLORS.textSecondary} />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  viewModeButton: {
    padding: LAYOUT.padding / 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    marginTop: -LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    alignItems: 'center',
    marginHorizontal: LAYOUT.padding / 2,
    ...VALUES.shadow,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: LAYOUT.padding / 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: LAYOUT.padding / 4,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 1.5,
  },
  tab: {
    flex: 1,
    paddingVertical: LAYOUT.padding,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 10,
  },
  proofCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 1.5,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  typeBadge: {
    position: 'absolute',
    top: LAYOUT.padding,
    left: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
    zIndex: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: LAYOUT.padding,
    right: LAYOUT.padding,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
    zIndex: 1,
  },
  statusverified: {
    backgroundColor: COLORS.success,
  },
  statuspending: {
    backgroundColor: COLORS.warning,
  },
  statusrejected: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 4,
    textTransform: 'uppercase',
  },
  proofContent: {
    padding: LAYOUT.padding * 1.5,
    paddingTop: LAYOUT.padding * 3,
  },
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  proofTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  trustScore: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  proofDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: LAYOUT.padding,
  },
  proofMeta: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.padding * 1.5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: LAYOUT.padding / 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: LAYOUT.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  receiverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: LAYOUT.padding,
  },
  receiverText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: LAYOUT.padding / 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding * 3,
  },
  createButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
    paddingHorizontal: LAYOUT.padding * 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding,
  },
  fab: {
    position: 'absolute',
    bottom: LAYOUT.padding * 3,
    right: LAYOUT.padding * 2,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
