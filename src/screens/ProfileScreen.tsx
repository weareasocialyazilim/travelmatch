import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

const ProfileScreen: React.FC = () => {
  const [trustLevel] = useState<'Sprout' | 'Growing' | 'Blooming'>('Blooming');

  const userData = {
    name: 'Emma Chen',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
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
    availableBalance: 70.0,
    totalReceived: 70.0,
    // Money OUT - What you gave
    totalGiven: 40.0,
    // Escrow - Only for proof-required moments (>$VALUES.ESCROW_DIRECT_MAX)
    escrowIncoming: 45.0, // Coming to you (pending proof) - örn: $45 değerinde 1 moment proof bekliyor
    escrowOutgoing: 35.0, // Sent by you (pending proof from recipient) - örn: $35 değerinde 1 moment gönderdin, proof bekleniyor
    connectedAccounts: {
      instagram: '@emmachen',
      x: null, // Not connected
    },
  };

  // Escrow hesaplamasını güvenli yap - NaN hatalarını önler
  const totalEscrow = useMemo(() => {
    const incoming =
      typeof userData.escrowIncoming === 'number' ? userData.escrowIncoming : 0;
    const outgoing =
      typeof userData.escrowOutgoing === 'number' ? userData.escrowOutgoing : 0;
    return incoming + outgoing;
  }, [userData.escrowIncoming, userData.escrowOutgoing]);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          // Handle logout - placeholder for future implementation
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 1) Header Section - Ultra-clear & personality first */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color={COLORS.white}
                />
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
                name={
                  trustLevel === 'Blooming'
                    ? 'flower'
                    : trustLevel === 'Growing'
                    ? 'leaf'
                    : 'seed'
                }
                size={24}
                color={COLORS.mint}
              />
            </View>

            <Text style={styles.trustTitle}>Trust Garden</Text>
            <Text style={styles.trustLevel}>{trustLevel}</Text>

            <Text style={styles.trustSummary}>
              {userData.verifiedGestures} Verified Gestures ·{' '}
              {userData.completedMoments} Completed Moments
            </Text>
          </View>

          {/* 3) My Moments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY MOMENTS</Text>

            <TouchableOpacity style={styles.momentTile}>
              <View style={styles.momentIcon}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={20}
                  color={COLORS.coral}
                />
              </View>
              <View style={styles.momentContent}>
                <Text style={styles.momentLabel}>Active Moments</Text>
                <Text style={styles.momentDescription}>
                  Visible to supporters right now
                </Text>
              </View>
              <Text style={styles.momentCount}>{userData.activeMoments}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.momentTile}>
              <View style={styles.momentIcon}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.momentContent}>
                <Text style={styles.momentLabel}>Verified Moments</Text>
                <Text style={styles.momentDescription}>
                  Successfully completed with proof
                </Text>
              </View>
              <Text style={styles.momentCount}>{userData.verifiedMoments}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            {userData.draftMoments > 0 && (
              <TouchableOpacity style={styles.momentTile}>
                <View style={styles.momentIcon}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={20}
                    color={COLORS.softGray}
                  />
                </View>
                <View style={styles.momentContent}>
                  <Text style={styles.momentLabel}>Drafts</Text>
                  <Text style={styles.momentDescription}>
                    Saved but not published yet
                  </Text>
                </View>
                <Text style={styles.momentCount}>{userData.draftMoments}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.softGray}
                />
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
                <Text style={styles.balanceAmount}>
                  ${userData.availableBalance.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* Money Flow Cards - 2 Column Grid */}
            <View style={styles.moneyFlowGrid}>
              {/* Received Card */}
              <View style={styles.moneyFlowCard}>
                <View style={[styles.moneyFlowIcon, styles.moneyFlowIconGreen]}>
                  <MaterialCommunityIcons
                    name="arrow-down"
                    size={16}
                    color={COLORS.success}
                  />
                </View>
                <Text style={styles.moneyFlowLabel}>Received</Text>
                <Text style={styles.moneyFlowAmount}>
                  ${userData.totalReceived.toFixed(2)}
                </Text>
              </View>

              {/* Given Card */}
              <View style={styles.moneyFlowCard}>
                <View style={[styles.moneyFlowIcon, styles.moneyFlowIconRed]}>
                  <MaterialCommunityIcons
                    name="arrow-up"
                    size={16}
                    color={COLORS.coral}
                  />
                </View>
                <Text style={styles.moneyFlowLabel}>Given</Text>
                <Text style={styles.moneyFlowAmount}>
                  ${userData.totalGiven.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Escrow Card - If there's money in escrow and total > $VALUES.ESCROW_DIRECT_MAX */}
            {totalEscrow > VALUES.ESCROW_DIRECT_MAX && (
              <View style={styles.escrowCard}>
                <View style={styles.escrowHeader}>
                  <View style={styles.escrowIconContainer}>
                    <MaterialCommunityIcons
                      name="shield-lock"
                      size={18}
                      color={COLORS.softOrange}
                    />
                  </View>
                  <View style={styles.escrowHeaderText}>
                    <Text style={styles.escrowTitle}>In Escrow</Text>
                    <Text style={styles.escrowSubtitle}>
                      Pending verification
                    </Text>
                  </View>
                  <Text style={styles.escrowTotal}>
                    ${totalEscrow.toFixed(2)}
                  </Text>
                </View>

                {userData.escrowIncoming > 0 && (
                  <View style={styles.escrowDetail}>
                    <View
                      style={[
                        styles.escrowDetailDot,
                        { backgroundColor: COLORS.mint },
                      ]}
                    />
                    <Text style={styles.escrowDetailLabel}>Incoming</Text>
                    <Text style={styles.escrowDetailValue}>
                      ${userData.escrowIncoming.toFixed(2)}
                    </Text>
                  </View>
                )}

                {userData.escrowOutgoing > 0 && (
                  <View style={styles.escrowDetail}>
                    <View
                      style={[
                        styles.escrowDetailDot,
                        { backgroundColor: COLORS.coral },
                      ]}
                    />
                    <Text style={styles.escrowDetailLabel}>Outgoing</Text>
                    <Text style={styles.escrowDetailValue}>
                      ${userData.escrowOutgoing.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Payment Settings */}
            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.listItemLabel}>Payment Methods</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={20}
                color={COLORS.text}
              />
              <Text style={styles.listItemLabel}>Payout Settings</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>

          {/* 5) Security - Premium & Logical */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SECURITY</Text>

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color={COLORS.mint}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>KYC Verification</Text>
                <Text style={styles.listItemDescription}>
                  Your identity is secured.
                </Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={20}
                color={COLORS.text}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>
                  Two-Factor Authentication
                </Text>
                <Text style={styles.listItemDescription}>
                  Protect your account with an extra layer.
                </Text>
              </View>
              <Text style={styles.listItemValue}>On</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>

          {/* 6) Connected Accounts - Social Proof */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTED ACCOUNTS</Text>

            <TouchableOpacity style={styles.socialItem}>
              <View style={styles.socialIconContainer}>
                <MaterialCommunityIcons
                  name="instagram"
                  size={20}
                  color={COLORS.instagram}
                />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Instagram</Text>
                {userData.connectedAccounts.instagram ? (
                  <Text style={styles.listItemDescription}>
                    {userData.connectedAccounts.instagram}
                  </Text>
                ) : (
                  <Text style={styles.listItemDescription}>
                    Connect your account
                  </Text>
                )}
              </View>
              {userData.connectedAccounts.instagram ? (
                <View style={styles.connectedTag}>
                  <Text style={styles.connectedTagText}>Connected</Text>
                </View>
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.socialItem}>
              <View style={styles.socialIconContainer}>
                <Text style={styles.xLogo}>𝕏</Text>
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>X (Twitter)</Text>
                {userData.connectedAccounts.x ? (
                  <Text style={styles.listItemDescription}>
                    {userData.connectedAccounts.x}
                  </Text>
                ) : (
                  <Text style={styles.listItemDescription}>
                    Connect your account
                  </Text>
                )}
              </View>
              {userData.connectedAccounts.x ? (
                <View style={styles.connectedTag}>
                  <Text style={styles.connectedTagText}>Connected</Text>
                </View>
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>

          {/* 7) Settings - Minimal & Essential */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SETTINGS</Text>

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color={COLORS.text}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Notifications</Text>
                <Text style={styles.listItemDescription}>
                  Edit alerts & reminders
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={20}
                color={COLORS.text}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Privacy</Text>
                <Text style={styles.listItemDescription}>
                  Control visibility & data
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem}>
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color={COLORS.text}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemLabel}>Language</Text>
              </View>
              <Text style={styles.listItemValue}>English</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={COLORS.softGray}
              />
            </TouchableOpacity>
          </View>

          {/* 7) Logout + Member Since */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color={COLORS.coral}
            />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.memberSince}>
            Member since {userData.memberSince}
          </Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  badge: {
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  balanceContent: {
    flex: 1,
  },
  balanceHeroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.mint,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14,
    shadowColor: COLORS.mint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  cityText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  connectText: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  connectedTag: {
    backgroundColor: COLORS.mintTransparentDark,
    borderRadius: 8,
    marginRight: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  connectedTagText: {
    color: COLORS.mint,
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginLeft: 32,
  },
  escrowCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  escrowDetail: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 8,
    paddingVertical: 6,
  },
  escrowDetailDot: {
    borderRadius: 3,
    height: 6,
    marginRight: 10,
    width: 6,
  },
  escrowDetailLabel: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 13,
  },
  escrowDetailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  escrowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  escrowHeaderText: {
    flex: 1,
  },
  escrowIconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.softOrangeTransparent,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 10,
    width: 32,
  },
  escrowSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  escrowTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  escrowTotal: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  listItemLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  listItemValue: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginRight: 4,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: COLORS.coralTransparentLight,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
    paddingVertical: 14,
  },
  logoutText: {
    color: COLORS.coral,
    fontSize: 15,
    fontWeight: '600',
  },
  memberSince: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  momentContent: {
    flex: 1,
  },
  momentCount: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  momentDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  momentIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  momentLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  momentTile: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 1,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  moneyFlowAmount: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  moneyFlowCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 1,
    flex: 1,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  moneyFlowGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  moneyFlowIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
    width: 32,
  },
  moneyFlowIconGreen: {
    backgroundColor: COLORS.mintTransparentLight,
  },
  moneyFlowIconRed: {
    backgroundColor: COLORS.coralTransparent,
  },
  moneyFlowLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingsButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  socialIconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  socialItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  trustCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 24,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: LAYOUT.shadowOffset.sm,
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  trustIconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  trustLevel: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  trustSummary: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  trustTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  userMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  userName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    bottom: 0,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 24,
  },
  verifiedTag: {
    backgroundColor: COLORS.mintTransparentDark,
    borderRadius: 8,
    marginRight: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedTagText: {
    color: COLORS.mint,
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  withdrawButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  wrapper: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  xLogo: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProfileScreen;
