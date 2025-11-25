import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

const ProfileScreen: React.FC = () => {
  const [trustLevel] = useState<'Sprout' | 'Growing' | 'Blooming'>('Blooming');

  const userData = {
    name: 'Emma Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    type: 'Traveler' as const,
    city: 'San Francisco',
    bio: 'Coffee enthusiast, street food explorer. Discovering hidden gems around the world.',
    memberSince: 'January 2024',
    verifiedGestures: 28,
    completedMoments: 12,
    activeMoments: 2,
    verifiedMoments: 10,
    draftMoments: 0,
    // Money IN - What you received
    availableBalance: 70.00,
    totalReceived: 70.00,
    // Money OUT - What you gave
    totalGiven: 40.00,
    // Escrow - Only for proof-required moments (>$VALUES.ESCROW_DIRECT_MAX)
    escrowIncoming: 45.00, // Coming to you (pending proof) - örn: $45 değerinde 1 moment proof bekliyor
    escrowOutgoing: 35.00, // Sent by you (pending proof from recipient) - örn: $35 değerinde 1 moment gönderdin, proof bekleniyor
    connectedAccounts: {
      instagram: '@emmachen',
      x: null, // Not connected
    },
  };

  // Escrow hesaplamasını güvenli yap - NaN hatalarını önler
  const totalEscrow = useMemo(() => {
    const incoming = typeof userData.escrowIncoming === 'number' ? userData.escrowIncoming : 0;
    const outgoing = typeof userData.escrowOutgoing === 'number' ? userData.escrowOutgoing : 0;
    return incoming + outgoing;
  }, [userData.escrowIncoming, userData.escrowOutgoing]);

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => {
          // Handle logout - placeholder for future implementation
        }}
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 1) Header Section - Ultra-clear & personality first */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.userName}>{userData.name}</Text>
            
            <View style={styles.userMeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✈️ {userData.type}</Text>
              </View>
              <Text style={styles.cityText}>{userData.city}</Text>
            </View>
            
            <Text style={styles.bio}>{userData.bio}</Text>
          </View>

          {/* 2) Trust Garden - Emotional Proof */}
          <View style={styles.trustCard}>
            <View style={styles.trustIconContainer}>
              <MaterialCommunityIcons 
                name={trustLevel === 'Blooming' ? 'flower' : trustLevel === 'Growing' ? 'leaf' : 'seed'} 
                size={24} 
                color={COLORS.mint} 
              />
            </View>
            
            <Text style={styles.trustTitle}>Trust Garden</Text>
            <Text style={styles.trustLevel}>{trustLevel}</Text>
            
            <Text style={styles.trustSummary}>
              {userData.verifiedGestures} Verified Gestures · {userData.completedMoments} Completed Moments
            </Text>
          </View>

          {/* 3) My Moments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY MOMENTS</Text>
            
            <TouchableOpacity style={styles.momentTile}>
              <View style={styles.momentIcon}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.coral} />
              </View>
              <View style={styles.momentContent}>
                <Text style={styles.momentLabel}>Active Moments</Text>
                <Text style={styles.momentDescription}>Visible to supporters right now</Text>
              </View>
              <Text style={styles.momentCount}>{userData.activeMoments}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.momentTile}>
              <View style={styles.momentIcon}>
                <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.mint} />
              </View>
              <View style={styles.momentContent}>
                <Text style={styles.momentLabel}>Verified Moments</Text>
                <Text style={styles.momentDescription}>Successfully completed with proof</Text>
              </View>
              <Text style={styles.momentCount}>{userData.verifiedMoments}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            {userData.draftMoments > 0 && (
              <TouchableOpacity style={styles.momentTile}>
                <View style={styles.momentIcon}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.softGray} />
                </View>
                <View style={styles.momentContent}>
                  <Text style={styles.momentLabel}>Drafts</Text>
                  <Text style={styles.momentDescription}>Saved but not published yet</Text>
                </View>
                <Text style={styles.momentCount}>{userData.draftMoments}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
              </TouchableOpacity>
            )}
          </View>

          {/* 4) Wallet & Payments - Modern Card Design */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WALLET & PAYMENTS</Text>
            
            {/* Balance Card - Hero */}
            <View style={styles.balanceHeroCard}>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>${userData.availableBalance.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Money Flow Cards - 2 Column Grid */}
            <View style={styles.moneyFlowGrid}>
              {/* Received Card */}
              <View style={styles.moneyFlowCard}>
                <View style={[styles.moneyFlowIcon, styles.moneyFlowIconGreen]}>
                  <MaterialCommunityIcons name="arrow-down" size={16} color={COLORS.success} />
                </View>
                <Text style={styles.moneyFlowLabel}>Received</Text>
                <Text style={styles.moneyFlowAmount}>${userData.totalReceived.toFixed(2)}</Text>
              </View>

              {/* Given Card */}
              <View style={styles.moneyFlowCard}>
                <View style={[styles.moneyFlowIcon, styles.moneyFlowIconRed]}>
                  <MaterialCommunityIcons name="arrow-up" size={16} color={COLORS.coral} />
                </View>
                <Text style={styles.moneyFlowLabel}>Given</Text>
                <Text style={styles.moneyFlowAmount}>${userData.totalGiven.toFixed(2)}</Text>
              </View>
            </View>

            {/* Escrow Card - If there's money in escrow and total > $VALUES.ESCROW_DIRECT_MAX */}
            {totalEscrow > VALUES.ESCROW_DIRECT_MAX && (
              <View style={styles.escrowCard}>
                <View style={styles.escrowHeader}>
                  <View style={styles.escrowIconContainer}>
                    <MaterialCommunityIcons name="shield-lock" size={18} color={COLORS.softOrange} />
                  </View>
                  <View style={styles.escrowHeaderText}>
                    <Text style={styles.escrowTitle}>In Escrow</Text>
                    <Text style={styles.escrowSubtitle}>Pending verification</Text>
                  </View>
                  <Text style={styles.escrowTotal}>${totalEscrow.toFixed(2)}</Text>
                </View>
                
                {userData.escrowIncoming > 0 && (
                  <View style={styles.escrowDetail}>
                    <View style={[styles.escrowDetailDot, { backgroundColor: COLORS.mint }]} />
                    <Text style={styles.escrowDetailLabel}>Incoming</Text>
                    <Text style={styles.escrowDetailValue}>${userData.escrowIncoming.toFixed(2)}</Text>
                  </View>
                )}
                
                {userData.escrowOutgoing > 0 && (
                  <View style={styles.escrowDetail}>
                    <View style={[styles.escrowDetailDot, { backgroundColor: COLORS.coral }]} />
                    <Text style={styles.escrowDetailLabel}>Outgoing</Text>
                    <Text style={styles.escrowDetailValue}>${userData.escrowOutgoing.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Payment Settings */}
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={COLORS.text} />
              <Text style={styles.listItemLabel}>Payment Methods</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="bank-outline" size={20} color={COLORS.text} />
              <Text style={styles.listItemLabel}>Payout Settings</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>

          {/* 5) Security - Premium & Logical */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SECURITY</Text>
            
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={COLORS.mint} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>KYC Verification</Text>
                <Text style={styles.listItemDescription}>Your identity is secured.</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color={COLORS.text} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Two-Factor Authentication</Text>
                <Text style={styles.listItemDescription}>Protect your account with an extra layer.</Text>
              </View>
              <Text style={styles.listItemValue}>On</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>

          {/* 6) Connected Accounts - Social Proof */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTED ACCOUNTS</Text>
            
            <TouchableOpacity style={styles.socialItem}>
              <View style={styles.socialIconContainer}>
                <MaterialCommunityIcons name="instagram" size={20} color="#E4405F" />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Instagram</Text>
                {userData.connectedAccounts.instagram ? (
                  <Text style={styles.listItemDescription}>{userData.connectedAccounts.instagram}</Text>
                ) : (
                  <Text style={styles.listItemDescription}>Connect your account</Text>
                )}
              </View>
              {userData.connectedAccounts.instagram ? (
                <View style={styles.connectedTag}>
                  <Text style={styles.connectedTagText}>Connected</Text>
                </View>
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.socialItem}>
              <View style={styles.socialIconContainer}>
                <Text style={styles.xLogo}>𝕏</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>X (Twitter)</Text>
                {userData.connectedAccounts.x ? (
                  <Text style={styles.listItemDescription}>{userData.connectedAccounts.x}</Text>
                ) : (
                  <Text style={styles.listItemDescription}>Connect your account</Text>
                )}
              </View>
              {userData.connectedAccounts.x ? (
                <View style={styles.connectedTag}>
                  <Text style={styles.connectedTagText}>Connected</Text>
                </View>
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>

          {/* 7) Settings - Minimal & Essential */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>
            
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={COLORS.text} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Notifications</Text>
                <Text style={styles.listItemDescription}>Edit alerts & reminders</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="eye-off-outline" size={20} color={COLORS.text} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Privacy</Text>
                <Text style={styles.listItemDescription}>Control visibility & data</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons name="translate" size={20} color={COLORS.text} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Language</Text>
              </View>
              <Text style={styles.listItemValue}>English</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>

          {/* 7) Logout + Member Since */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.coral} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.memberSince}>Member since {userData.memberSince}</Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  cityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  trustCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: LAYOUT.shadowOffset.sm,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(166, 229, 193, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trustTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  trustLevel: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  trustSummary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  momentTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  momentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(166, 229, 193, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  momentContent: {
    flex: 1,
  },
  momentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  momentCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  momentDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Balance Hero Card
  balanceHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.mint,
    shadowColor: COLORS.mint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceHeroContent: {
    flex: 1,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  balanceRightSection: {
    alignItems: 'flex-end',
    gap: 10,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.mint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  withdrawButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Money Flow Grid
  moneyFlowGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  moneyFlowCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  moneyFlowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moneyFlowIconGreen: {
    backgroundColor: 'rgba(166, 229, 193, 0.15)',
  },
  moneyFlowIconRed: {
    backgroundColor: 'rgba(255, 111, 97, 0.15)',
  },
  moneyFlowLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  moneyFlowAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  // Escrow Card
  escrowCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  escrowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 169, 77, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  escrowHeaderText: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  escrowSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  escrowTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  escrowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 8,
  },
  escrowDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  escrowDetailLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  escrowDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  xLogo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  listItemDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  listItemValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  socialIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedTag: {
    backgroundColor: 'rgba(166, 229, 193, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  connectedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mint,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.coral,
    marginRight: 4,
  },
  verifiedTag: {
    backgroundColor: 'rgba(166, 229, 193, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
  },
  verifiedTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mint,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.coral,
  },
  memberSince: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ProfileScreen;
