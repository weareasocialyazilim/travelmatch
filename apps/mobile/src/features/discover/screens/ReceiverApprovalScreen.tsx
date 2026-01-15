/**
 * ReceiverApprovalScreen - Vetting Ceremony
 *
 * Raya-style candidate evaluation screen where receivers review
 * gift requests. Full-screen card focus with trust comparison.
 *
 * "The most critical moment: Evaluating who wants to gift you an experience."
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HapticManager } from '@/services/HapticManager';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { TrustScoreCircle } from '@/components/ui/TrustScoreCircle';
import { LoadingState } from '@/components/LoadingState';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GiverCandidate {
  id: string;
  amount: number;
  giver: {
    id: string;
    name: string;
    avatar: string;
    location?: string;
    trustScore?: number;
    membershipTier?: 'standard' | 'gold' | 'platinum';
  };
}

type ReceiverApprovalScreenProps = StackScreenProps<
  RootStackParamList,
  'ReceiverApproval'
>;

export const ReceiverApprovalScreen: React.FC<
  ReceiverApprovalScreenProps
> = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ReceiverApprovalScreenProps['route']>();
  const insets = useSafeAreaInsets();

  const [candidates, setCandidates] = useState<GiverCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const momentTitle = route.params?.momentTitle || 'Experience';
  const momentId = route.params?.momentId;

  // Animation values
  const _cardScale = useSharedValue(1);
  const declineScale = useSharedValue(1);
  const approveScale = useSharedValue(1);

  // Fetch pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!momentId) {
        // Mock data for demo
        setCandidates([
          {
            id: '1',
            amount: 85,
            giver: {
              id: 'g1',
              name: 'Burak Can',
              avatar: '',
              location: 'İstanbul, TR',
              trustScore: 88,
              membershipTier: 'gold',
            },
          },
          {
            id: '2',
            amount: 120,
            giver: {
              id: 'g2',
              name: 'Elif Demir',
              avatar: '',
              location: 'Ankara, TR',
              trustScore: 94,
              membershipTier: 'platinum',
            },
          },
        ]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('requests')
          .select(
            `
            id,
            total_price,
            requester:profiles!user_id(id, full_name, avatar_url)
          `,
          )
          .eq('moment_id', momentId)
          .eq('status', 'pending');

        if (error) throw error;

        const mappedCandidates: GiverCandidate[] = (data || []).map(
          (item: any) => ({
            id: item.id,
            amount: item.total_price,
            giver: {
              id: item.requester?.id,
              name: item.requester?.full_name || 'Unknown',
              avatar: item.requester?.avatar_url,
              trustScore: Math.floor(Math.random() * 20) + 80, // Mock score
              membershipTier: 'gold',
            },
          }),
        );
        setCandidates(mappedCandidates);
      } catch (err) {
        logger.error('Error fetching requests', err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [momentId]);

  const currentCandidate = candidates[currentIndex];

  // Handle decline
  const handleDecline = useCallback(async () => {
    HapticManager.buttonPress();

    if (currentIndex < candidates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.goBack();
    }
  }, [currentIndex, candidates.length, navigation]);

  // Handle approve
  const handleApprove = useCallback(async () => {
    if (!currentCandidate) return;

    HapticManager.success();
    setLoading(true);

    try {
      if (momentId) {
        const { error } = await supabase
          .from('requests')
          .update({ status: 'accepted' })
          .eq('id', currentCandidate.id);

        if (error) throw error;
      }

      navigation.navigate('MatchConfirmation', {
        selectedGivers: [
          {
            id: currentCandidate.giver.id,
            name: currentCandidate.giver.name,
            avatar: currentCandidate.giver.avatar,
            amount: currentCandidate.amount,
          },
        ],
      });
    } catch (err) {
      logger.error('Error approving request', err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentCandidate, momentId, navigation]);

  // Button press animations
  const handleDeclinePressIn = useCallback(() => {
    declineScale.value = withSpring(0.9, { damping: 15 });
  }, [declineScale]);

  const handleDeclinePressOut = useCallback(() => {
    declineScale.value = withSpring(1, { damping: 15 });
  }, [declineScale]);

  const handleApprovePressIn = useCallback(() => {
    approveScale.value = withSpring(0.9, { damping: 15 });
  }, [approveScale]);

  const handleApprovePressOut = useCallback(() => {
    approveScale.value = withSpring(1, { damping: 15 });
  }, [approveScale]);

  const declineButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: declineScale.value }],
  }));

  const approveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: approveScale.value }],
  }));

  // Get membership badge info
  const getMembershipBadge = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'PLATİN ÜYE', color: '#E5E4E2' };
      case 'gold':
        return { label: 'GOLD ÜYE', color: COLORS.secondary };
      default:
        return null;
    }
  };

  if (loading && candidates.length === 0) {
    return <LoadingState type="overlay" message="Yükleniyor..." />;
  }

  if (!currentCandidate) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={32} color={COLORS.text.onDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="heart-dislike-outline"
            size={64}
            color={COLORS.textOnDarkMuted}
          />
          <Text style={styles.emptyTitle}>Bekleyen Teklif Yok</Text>
          <Text style={styles.emptyText}>
            Şu an için değerlendirilecek yeni teklif bulunmuyor.
          </Text>
        </View>
      </View>
    );
  }

  const membershipBadge = getMembershipBadge(
    currentCandidate.giver.membershipTier,
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Glow */}
      <View style={styles.glowBg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={32} color={COLORS.text.onDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Teklif</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <Animated.View
        style={styles.content}
        entering={FadeIn.delay(100).duration(400)}
      >
        <Text style={styles.tagline}>
          BİRİ SENİN İÇİN DENEYİM ALMAK İSTİYOR
        </Text>

        {/* Candidate Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard
            intensity={35}
            tint="dark"
            padding={32}
            borderRadius={40}
            style={styles.candidateCard}
          >
            {/* Candidate Info */}
            <View style={styles.candidateInfo}>
              <Avatar
                size="hero"
                name={currentCandidate.giver.name}
                source={currentCandidate.giver.avatar}
              />
              <Text style={styles.candidateName}>
                {currentCandidate.giver.name}
              </Text>
              <View style={styles.badgeRow}>
                {membershipBadge && (
                  <View
                    style={[
                      styles.premiumBadge,
                      { backgroundColor: membershipBadge.color },
                    ]}
                  >
                    <Ionicons name="star" size={10} color="#000" />
                    <Text style={styles.premiumText}>
                      {membershipBadge.label}
                    </Text>
                  </View>
                )}
                {currentCandidate.giver.location && (
                  <Text style={styles.locationText}>
                    {currentCandidate.giver.location}
                  </Text>
                )}
              </View>
            </View>

            {/* Trust Score */}
            <View style={styles.trustMetric}>
              <TrustScoreCircle
                score={currentCandidate.giver.trustScore || 85}
                level="Güvenilir"
                size={100}
              />
              <Text style={styles.trustNote}>Güvenli Etkileşim Skoru</Text>
            </View>

            {/* Moment Preview */}
            <View style={styles.momentPreview}>
              <Text style={styles.offerLabel}>TEKLİF EDİLEN MOMENT</Text>
              <Text style={styles.momentName}>{momentTitle}</Text>
              <Text style={styles.offerAmount}>
                ${currentCandidate.amount.toFixed(2)}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={styles.actionRow}
          entering={SlideInUp.delay(400).springify()}
        >
          <AnimatedTouchable
            style={[styles.declineButton, declineButtonStyle]}
            onPress={handleDecline}
            onPressIn={handleDeclinePressIn}
            onPressOut={handleDeclinePressOut}
            activeOpacity={0.9}
          >
            <View style={styles.declineIconCircle}>
              <Ionicons name="close-outline" size={32} color={COLORS.error} />
            </View>
            <Text style={styles.declineLabel}>Reddet</Text>
          </AnimatedTouchable>

          <AnimatedTouchable
            style={[styles.approveButton, approveButtonStyle]}
            onPress={handleApprove}
            onPressIn={handleApprovePressIn}
            onPressOut={handleApprovePressOut}
            activeOpacity={0.9}
          >
            <View style={styles.approveIconCircle}>
              <Ionicons name="checkmark-outline" size={32} color="#000" />
            </View>
            <Text style={styles.approveLabel}>Kabul Et</Text>
          </AnimatedTouchable>
        </Animated.View>

        {/* Remaining count */}
        {candidates.length > 1 && (
          <Text style={styles.remainingText}>
            {currentIndex + 1} / {candidates.length}
          </Text>
        )}

        {/* Info Footer */}
        <Text style={styles.infoFooter}>
          Kabul ettiğinde ödeme emanet (escrow) hesabına alınır ve sohbet
          başlar.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  glowBg: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FONT_SIZES.bodyLarge,
    fontFamily: FONTS.display.bold,
    color: COLORS.text.onDark,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
  },
  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  tagline: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 2,
    marginBottom: 24,
  },
  // Candidate Card
  candidateCard: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 32, 0.7)',
  },
  candidateInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  candidateName: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.text.onDark,
    marginTop: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 8,
    fontFamily: FONTS.mono.medium,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  locationText: {
    color: COLORS.textOnDarkSecondary,
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.body.regular,
  },
  // Trust Metric
  trustMetric: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trustNote: {
    color: COLORS.textOnDarkMuted,
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  // Moment Preview
  momentPreview: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  offerLabel: {
    fontSize: 9,
    fontFamily: FONTS.mono.regular,
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  momentName: {
    color: COLORS.text.onDark,
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  offerAmount: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.mono.medium,
    fontWeight: '700',
    marginTop: 8,
  },
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 50,
  },
  declineButton: {
    alignItems: 'center',
  },
  approveButton: {
    alignItems: 'center',
  },
  declineIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  approveIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  declineLabel: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '700',
    color: COLORS.textOnDarkSecondary,
    marginTop: 12,
  },
  approveLabel: {
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
  },
  // Remaining text
  remainingText: {
    marginTop: 20,
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.mono.regular,
    color: COLORS.textOnDarkMuted,
  },
  // Info Footer
  infoFooter: {
    marginTop: 'auto',
    textAlign: 'center',
    color: COLORS.textOnDarkMuted,
    fontSize: FONT_SIZES.caption,
    fontFamily: FONTS.body.regular,
    lineHeight: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.h4,
    fontFamily: FONTS.display.bold,
    color: COLORS.text.onDark,
    marginTop: 20,
  },
  emptyText: {
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
});

export default ReceiverApprovalScreen;
