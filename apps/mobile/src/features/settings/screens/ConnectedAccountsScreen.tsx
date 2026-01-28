import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'twitter' | 'linkedin';
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  username?: string;
  followers?: number;
}

const ConnectedAccountsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: '1',
      platform: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      color: COLORS.instagram,
      connected: true,
      username: '@sophia_creative',
      followers: 15200,
    },
    {
      id: '2',
      platform: 'twitter',
      name: 'X (Twitter)',
      icon: 'twitter',
      color: COLORS.utility.black,
      connected: true,
      username: '@sophia_carter',
      followers: 3400,
    },
    {
      id: '3',
      platform: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      color: COLORS.linkedin,
      connected: false,
    },
  ]);

  const handleConnect = (account: SocialAccount) => {
    if (account.connected) {
      showAlert({
        title: 'Disconnect Account',
        message: `Are you sure you want to disconnect ${account.name}?`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setAccounts((prev) =>
                prev.map((a) =>
                  a.id === account.id
                    ? {
                        ...a,
                        connected: false,
                        username: undefined,
                        followers: undefined,
                      }
                    : a,
                ),
              );
            },
          },
        ],
      });
    } else {
      // Simulate connecting
      showAlert({
        title: 'Connect Account',
        message: `This will redirect you to ${account.name} to authorize Lovendo.`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              // Simulate successful connection
              setAccounts((prev) =>
                prev.map((a) =>
                  a.id === account.id
                    ? {
                        ...a,
                        connected: true,
                        username: '@user_' + account.platform,
                        followers: 1000,
                      }
                    : a,
                ),
              );
            },
          },
        ],
      });
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const connectedCount = accounts.filter((a) => a.connected).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Accounts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color={COLORS.mint}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Build Trust</Text>
            <Text style={styles.infoText}>
              Connect your social accounts to verify your identity and build
              trust with other users. Connected accounts increase your Trust
              Garden score.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{connectedCount}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{connectedCount * 5}%</Text>
            <Text style={styles.statLabel}>Trust Boost</Text>
          </View>
        </View>

        {/* Accounts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOCIAL ACCOUNTS</Text>

          <View style={styles.accountsCard}>
            {accounts.map((account, index) => (
              <React.Fragment key={account.id}>
                <TouchableOpacity
                  style={styles.accountItem}
                  onPress={() => handleConnect(account)}
                >
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: `${account.color}15` },
                    ]}
                  >
                    {account.platform === 'twitter' ? (
                      <Text style={[styles.xLogo, { color: account.color }]}>
                        𝕏
                      </Text>
                    ) : (
                      <MaterialCommunityIcons
                        name={
                          account.icon as React.ComponentProps<
                            typeof MaterialCommunityIcons
                          >['name']
                        }
                        size={20}
                        color={account.color}
                      />
                    )}
                  </View>
                  <View style={styles.accountContent}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    {account.connected ? (
                      <View style={styles.accountMeta}>
                        <Text style={styles.accountUsername}>
                          {account.username}
                        </Text>
                        {account.followers && (
                          <>
                            <Text style={styles.accountDot}>•</Text>
                            <Text style={styles.accountFollowers}>
                              {formatFollowers(account.followers)} followers
                            </Text>
                          </>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.accountNotConnected}>
                        Not connected
                      </Text>
                    )}
                  </View>
                  {account.connected ? (
                    <View style={styles.connectedBadge}>
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color={COLORS.mint}
                      />
                    </View>
                  ) : (
                    <Text style={styles.connectText}>Connect</Text>
                  )}
                </TouchableOpacity>
                {index < accounts.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BENEFITS</Text>

          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <MaterialCommunityIcons
                  name="shield-star"
                  size={18}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Verified Badge</Text>
                <Text style={styles.benefitDesc}>
                  Get a verified badge on your profile when you connect 2+
                  accounts
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={18}
                  color={COLORS.softOrange}
                />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Higher Trust Score</Text>
                <Text style={styles.benefitDesc}>
                  Each connected account adds +5% to your Trust Garden score
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={COLORS.brand.secondary}
                />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Easy Sharing</Text>
                <Text style={styles.benefitDesc}>
                  Share your moments directly to your connected social platforms
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.utility.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.mint,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border.default,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Accounts Card
  accountsCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLogo: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  accountContent: {
    flex: 1,
  },
  accountName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountUsername: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  accountDot: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginHorizontal: 4,
  },
  accountFollowers: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  accountNotConnected: {
    ...TYPOGRAPHY.caption,
    color: COLORS.softGray,
  },
  connectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.mintTransparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.brand.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginLeft: 66,
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  benefitDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default ConnectedAccountsScreen;
