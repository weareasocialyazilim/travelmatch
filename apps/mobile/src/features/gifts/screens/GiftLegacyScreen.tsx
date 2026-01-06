/**
 * GiftLegacyScreen - Hediye Mirası (Gift History)
 *
 * MASTER Revizyonu: MyBookingsScreen.tsx yerine.
 * Kullanıcının "Ben kime ne gönderdim?" veya "Bana ne geldi?" sorusunu
 * cevaplayan ipeksi bir liste.
 *
 * Özellikler:
 * - Bağımsız ekran (ProfileScreen'den ayrı)
 * - Her öğede: anı kategorisi, hediye miktarı, güven puanı gelişimi
 * - "Hediye Detayı ve Kanıtı Gör" butonu (İptal Politikası yerine)
 *
 * @module screens/GiftLegacyScreen
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Gift item interface
interface GiftItem {
  id: string;
  type: 'sent' | 'received';
  momentId: string;
  momentTitle: string;
  momentCategory: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  proofStatus: 'awaiting' | 'submitted' | 'verified' | 'rejected';
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserTrustScore: number;
  trustScoreChange?: number;
  createdAt: string;
  proofUrl?: string;
  escrowId?: string;
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, IconName> = {
  gastronomy: 'food',
  dining: 'silverware-fork-knife',
  cafe: 'coffee',
  travel: 'airplane',
  adventure: 'hiking',
  nature: 'pine-tree',
  shopping: 'shopping',
  entertainment: 'movie',
  wellness: 'spa',
  experience: 'star',
  default: 'gift',
};

// Status configurations
const STATUS_CONFIG: Record<
  string,
  { color: string; icon: IconName; label: string }
> = {
  pending: { color: '#F59E0B', icon: 'clock-outline', label: 'Beklemede' },
  completed: { color: '#10B981', icon: 'check-circle', label: 'Tamamlandı' },
  refunded: { color: '#EF4444', icon: 'cash-refund', label: 'İade Edildi' },
};

const PROOF_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  awaiting: { color: '#64748B', label: 'Kanıt Bekleniyor' },
  submitted: { color: '#06B6D4', label: 'İnceleniyor' },
  verified: { color: '#10B981', label: 'Onaylandı' },
  rejected: { color: '#EF4444', label: 'Reddedildi' },
};

// Tab button component
const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}> = ({ label, isActive, onPress, count }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text
      style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
    >
      {label}
    </Text>
    {count !== undefined && count > 0 && (
      <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
        <Text
          style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}
        >
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// Gift item card component
const GiftItemCard: React.FC<{
  item: GiftItem;
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const categoryIcon =
    CATEGORY_ICONS[item.momentCategory.toLowerCase()] || CATEGORY_ICONS.default;
  const statusConfig = STATUS_CONFIG[item.status];
  const proofConfig = PROOF_STATUS_CONFIG[item.proofStatus];

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <GlassCard intensity={12} style={styles.giftCard}>
          {/* Type indicator */}
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: item.type === 'sent' ? '#A855F7' : '#10B981' },
            ]}
          />

          <View style={styles.giftContent}>
            {/* Category Icon */}
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor:
                    (item.type === 'sent' ? '#A855F7' : '#10B981') + '20',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={categoryIcon}
                size={24}
                color={item.type === 'sent' ? '#A855F7' : '#10B981'}
              />
            </View>

            {/* Main Info */}
            <View style={styles.giftInfo}>
              <Text style={styles.momentTitle} numberOfLines={1}>
                {item.momentTitle}
              </Text>
              <Text style={styles.userInfo}>
                {item.type === 'sent' ? 'Gönderilen: ' : 'Gönderen: '}
                <Text style={styles.userName}>{item.otherUserName}</Text>
              </Text>

              {/* Trust Score Change */}
              {item.trustScoreChange !== undefined &&
                item.trustScoreChange !== 0 && (
                  <View style={styles.trustScoreRow}>
                    <MaterialCommunityIcons
                      name={
                        item.trustScoreChange > 0
                          ? 'trending-up'
                          : 'trending-down'
                      }
                      size={14}
                      color={item.trustScoreChange > 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.trustScoreChange,
                        {
                          color:
                            item.trustScoreChange > 0 ? '#10B981' : '#EF4444',
                        },
                      ]}
                    >
                      {item.trustScoreChange > 0 ? '+' : ''}
                      {item.trustScoreChange} Güven Puanı
                    </Text>
                  </View>
                )}
            </View>

            {/* Amount & Status */}
            <View style={styles.giftRight}>
              <Text
                style={[
                  styles.amount,
                  { color: item.type === 'sent' ? '#A855F7' : '#10B981' },
                ]}
              >
                {item.type === 'sent' ? '-' : '+'}₺{item.amount}
              </Text>
              <View style={styles.statusContainer}>
                <MaterialCommunityIcons
                  name={statusConfig.icon}
                  size={12}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Proof Status Bar */}
          <View style={styles.proofBar}>
            <View
              style={[
                styles.proofIndicator,
                { backgroundColor: proofConfig.color },
              ]}
            />
            <Text style={styles.proofText}>{proofConfig.label}</Text>
            <TouchableOpacity style={styles.viewProofButton}>
              <Text style={styles.viewProofText}>Kanıtı Gör</Text>
              <Ionicons name="chevron-forward" size={14} color="#06B6D4" />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Stats card component
const StatsCard: React.FC<{
  totalSent: number;
  totalReceived: number;
  trustScoreGain: number;
}> = ({ totalSent, totalReceived, trustScoreGain }) => (
  <Animated.View entering={FadeInDown.delay(100).springify()}>
    <LinearGradient
      colors={['rgba(168, 85, 247, 0.15)', 'rgba(16, 185, 129, 0.15)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statsCard}
    >
      <View style={styles.statItem}>
        <MaterialCommunityIcons name="gift-outline" size={20} color="#A855F7" />
        <Text style={styles.statValue}>₺{totalSent}</Text>
        <Text style={styles.statLabel}>Gönderilen</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <MaterialCommunityIcons name="gift" size={20} color="#10B981" />
        <Text style={styles.statValue}>₺{totalReceived}</Text>
        <Text style={styles.statLabel}>Alınan</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <MaterialCommunityIcons name="shield-star" size={20} color="#DFFF00" />
        <Text style={[styles.statValue, { color: '#DFFF00' }]}>
          +{trustScoreGain}
        </Text>
        <Text style={styles.statLabel}>Güven Puanı</Text>
      </View>
    </LinearGradient>
  </Animated.View>
);

export const GiftLegacyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>(
    'all',
  );
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch gift history
  const fetchGiftHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch sent gifts
      const { data: sentData, error: sentError } = await supabase
        .from('gifts')
        .select(
          `
          id,
          amount,
          currency,
          status,
          created_at,
          moment_id,
          recipient_id,
          escrow_id,
          moments:moment_id (title, category),
          recipient:recipient_id (name, avatar_url, trust_score)
        `,
        )
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch received gifts
      const { data: receivedData, error: receivedError } = await supabase
        .from('gifts')
        .select(
          `
          id,
          amount,
          currency,
          status,
          created_at,
          moment_id,
          sender_id,
          escrow_id,
          moments:moment_id (title, category),
          sender:sender_id (name, avatar_url, trust_score)
        `,
        )
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) logger.warn('[GiftLegacy] Sent gifts error:', sentError);
      if (receivedError)
        logger.warn('[GiftLegacy] Received gifts error:', receivedError);

      // Transform data
      const sentGifts: GiftItem[] = (sentData || []).map((g: any) => ({
        id: g.id,
        type: 'sent' as const,
        momentId: g.moment_id,
        momentTitle: g.moments?.title || 'Anı',
        momentCategory: g.moments?.category || 'default',
        amount: g.amount,
        currency: g.currency || 'TRY',
        status: g.status,
        proofStatus: g.status === 'completed' ? 'verified' : 'awaiting',
        otherUserId: g.recipient_id,
        otherUserName: g.recipient?.name || 'Kullanıcı',
        otherUserAvatar: g.recipient?.avatar_url,
        otherUserTrustScore: g.recipient?.trust_score || 0,
        trustScoreChange: g.status === 'completed' ? 5 : 0,
        createdAt: g.created_at,
        escrowId: g.escrow_id,
      }));

      const receivedGifts: GiftItem[] = (receivedData || []).map((g: any) => ({
        id: g.id,
        type: 'received' as const,
        momentId: g.moment_id,
        momentTitle: g.moments?.title || 'Anı',
        momentCategory: g.moments?.category || 'default',
        amount: g.amount,
        currency: g.currency || 'TRY',
        status: g.status,
        proofStatus: g.status === 'completed' ? 'verified' : 'awaiting',
        otherUserId: g.sender_id,
        otherUserName: g.sender?.name || 'Kullanıcı',
        otherUserAvatar: g.sender?.avatar_url,
        otherUserTrustScore: g.sender?.trust_score || 0,
        trustScoreChange: g.status === 'completed' ? 10 : 0,
        createdAt: g.created_at,
        escrowId: g.escrow_id,
      }));

      // Combine and sort
      const allGifts = [...sentGifts, ...receivedGifts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setGifts(allGifts);
    } catch (error) {
      logger.error('[GiftLegacy] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGiftHistory();
  }, [fetchGiftHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGiftHistory();
  }, [fetchGiftHistory]);

  // Filter gifts by active tab
  const filteredGifts = useMemo(() => {
    if (activeTab === 'all') return gifts;
    return gifts.filter((g) => g.type === activeTab);
  }, [gifts, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const sentTotal = gifts
      .filter((g) => g.type === 'sent')
      .reduce((sum, g) => sum + g.amount, 0);
    const receivedTotal = gifts
      .filter((g) => g.type === 'received')
      .reduce((sum, g) => sum + g.amount, 0);
    const trustGain = gifts
      .filter((g) => g.status === 'completed')
      .reduce((sum, g) => sum + (g.trustScoreChange || 0), 0);

    return {
      totalSent: sentTotal,
      totalReceived: receivedTotal,
      trustScoreGain: trustGain,
    };
  }, [gifts]);

  // Group by date
  const sections = useMemo(() => {
    const grouped: Record<string, GiftItem[]> = {};

    filteredGifts.forEach((gift) => {
      const date = new Date(gift.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Bugün';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Dün';
      } else {
        key = date.toLocaleDateString('tr-TR', {
          month: 'long',
          day: 'numeric',
        });
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(gift);
    });

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filteredGifts]);

  // Handle gift item press
  const handleGiftPress = (gift: GiftItem) => {
    navigation.navigate('GiftInboxDetail', {
      senderId: gift.type === 'sent' ? user?.id || '' : gift.otherUserId || '',
      senderName:
        gift.type === 'sent' ? 'Ben' : gift.otherUserName || 'Unknown',
      senderAvatar: gift.otherUserAvatar || '',
      senderTrustScore: gift.otherUserTrustScore ?? 50,
      senderSubscriptionTier: 'free',
      senderMomentCount: 0,
      senderVerified: false,
      senderCity: '',
      gifts: [
        {
          id: gift.id,
          momentTitle: gift.momentTitle || '',
          momentEmoji: '🎁',
          momentCategory: 'experience',
          amount: gift.amount,
          message: '',
          paymentType: 'direct' as const,
          status: (gift.status === 'refunded'
            ? 'failed'
            : gift.status === 'completed'
              ? 'verified'
              : 'pending') as
            | 'pending'
            | 'received'
            | 'pending_proof'
            | 'verifying'
            | 'verified'
            | 'failed',
          createdAt: gift.createdAt || new Date().toISOString(),
          isHighValueOffer: gift.amount >= 500,
          isSubscriberOffer: false,
        },
      ],
      pendingOffers: [],
      totalAmount: gift.amount,
      canStartChat: gift.status === 'completed',
    });
  };

  if (loading) {
    return (
      <LoadingState type="skeleton" message="Hediye geçmişi yükleniyor..." />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hediye Mirası</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Stats Card */}
        <View style={styles.statsSection}>
          <StatsCard {...stats} />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TabButton
            label="Tümü"
            isActive={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
            count={gifts.length}
          />
          <TabButton
            label="Gönderdiklerim"
            isActive={activeTab === 'sent'}
            onPress={() => setActiveTab('sent')}
            count={gifts.filter((g) => g.type === 'sent').length}
          />
          <TabButton
            label="Aldıklarım"
            isActive={activeTab === 'received'}
            onPress={() => setActiveTab('received')}
            count={gifts.filter((g) => g.type === 'received').length}
          />
        </View>

        {/* Gift List */}
        {filteredGifts.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <GiftItemCard
                item={item}
                index={index}
                onPress={() => handleGiftPress(item)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#DFFF00"
              />
            }
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="gift-outline"
              title="Henüz hediye yok"
              description="İlk hediyenizi gönderdiğinizde veya aldığınızda burada görünecek."
              illustrationType="no_gifts"
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  safeArea: {
    flex: 1,
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButtonActive: {
    backgroundColor: '#DFFF00',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabButtonTextActive: {
    color: '#0F0F23',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabBadgeTextActive: {
    color: '#0F0F23',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  giftCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  typeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  giftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftInfo: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  userName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  trustScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trustScoreChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  giftRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  proofBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  proofIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  proofText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  viewProofButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProofText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06B6D4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
});

export default GiftLegacyScreen;
