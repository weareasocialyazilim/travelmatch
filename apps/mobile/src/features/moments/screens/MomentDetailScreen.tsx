/**
 * MomentDetailScreen - Centralized Moments Feature
 *
 * Immersive moment detail view with:
 * - Full-screen hero image
 * - Creator-set price display (locked, non-editable by giver)
 * - Liquid Glass navigation buttons
 * - Premium action bar with gift CTA
 * - Real-time price updates via Supabase
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMButton } from '@/components/ui/TMButton';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

const { height } = Dimensions.get('window');

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

interface MomentDetailParams {
  momentId: string;
  title?: string;
  location?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  category?: string;
  hostId?: string;
  hostName?: string;
  hostTrustScore?: number;
  duration?: string;
  description?: string;
}

export const MomentDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MomentDetail'>>();
  const insets = useSafeAreaInsets();

  // Extract params with defaults - support both new MomentDetailParams and legacy 'moment' object
  const rawParams = route.params as any;
  const {
    momentId = rawParams?.moment?.id || '',
    title = rawParams?.moment?.title || 'Bali Sunset Sanctuary',
    location = rawParams?.moment?.location || 'Uluwatu, Bali',
    price: initialPrice = rawParams?.moment?.price ||
      rawParams?.moment?.pricePerGuest ||
      45,
    currency: initialCurrency = rawParams?.moment?.currency || 'TRY',
    imageUrl = rawParams?.moment?.images?.[0] ||
      rawParams?.moment?.image ||
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    category = rawParams?.moment?.category || 'DENEYİM • DOĞA',
    hostId = rawParams?.moment?.hostId || '',
    hostName = rawParams?.moment?.hostName || 'Caner Öz',
    hostTrustScore = rawParams?.moment?.hostTrustScore || 94,
    duration = rawParams?.moment?.duration || '2-3 Saat',
    description = rawParams?.moment?.description ||
      "Uluwatu'nun gizli kayalıklarında, kalabalıktan uzak bir gün batımı deneyimi.",
  } = (rawParams as MomentDetailParams) || {};

  // State for real-time price updates
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [currentCurrency, setCurrentCurrency] = useState(initialCurrency);

  // Subscribe to real-time price updates for this specific moment via Supabase
  useEffect(() => {
    if (!momentId) return;

    const channel = supabase
      .channel(`moment-detail-${momentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips', // DB table name
          filter: `id=eq.${momentId}`,
        },
        (payload) => {
          const { price, currency } = payload.new as {
            price: number;
            currency: string;
          };
          logger.debug('Real-time price update for moment', {
            momentId,
            price,
            currency,
          });
          setCurrentPrice(price);
          setCurrentCurrency(currency);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [momentId]);

  // Get currency symbol
  const currencySymbol = CURRENCY_SYMBOLS[currentCurrency] || currentCurrency;

  // Handle gift press - navigate with locked price
  const handleGiftPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('UnifiedGiftFlow', {
      recipientId: hostId,
      recipientName: hostName,
      momentId,
      momentTitle: title,
      momentImageUrl: imageUrl,
      requestedAmount: currentPrice,
      requestedCurrency: currentCurrency as
        | 'TRY'
        | 'EUR'
        | 'USD'
        | 'GBP'
        | 'JPY'
        | 'CAD',
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement save/unsave logic
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ShareMoment', { momentId });
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image with Gradient Overlay */}
        <ImageBackground source={{ uri: imageUrl }} style={styles.heroImage}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', COLORS.bg.primary]}
            style={styles.gradientOverlay}
          >
            {/* Top Navigation */}
            <View style={[styles.topNav, { marginTop: insets.top + 10 }]}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.circleButton}
              >
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
              <View style={styles.topNavRight}>
                <TouchableOpacity
                  onPress={handleLike}
                  style={styles.circleButton}
                >
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.circleButton}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              {/* Category Badge */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Location Row */}
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-sharp"
                  size={16}
                  color={COLORS.brand.primary}
                />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Detail Panel */}
        <View style={styles.detailPanel}>
          {/* Host Row */}
          <View style={styles.hostRow}>
            <View style={styles.hostInfo}>
              <View style={styles.hostAvatar} />
              <View>
                <Text style={styles.hostName}>
                  {hostName} tarafından paylaşıldı
                </Text>
                <Text style={styles.hostStatus}>
                  Pro Verici • {hostTrustScore} Güven Puanı
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Takip Et</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{description}</Text>

          {/* Creator-Set Price Display */}
          <GlassCard intensity={15} style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <MaterialCommunityIcons
                name="gift-outline"
                size={24}
                color={COLORS.brand.primary}
              />
              <Text style={styles.priceLabel}>İstenen Hediye Miktarı</Text>
            </View>
            <Text style={styles.priceValue}>
              {currencySymbol}
              {currentPrice.toLocaleString()}
            </Text>
            <Text style={styles.priceNote}>
              Bu miktar {hostName} tarafından belirlenmiştir ve değiştirilemez.
            </Text>
          </GlassCard>

          {/* Info Cards Grid */}
          <View style={styles.infoGrid}>
            <GlassCard intensity={10} style={styles.infoCard}>
              <Ionicons
                name="time-outline"
                size={20}
                color={COLORS.brand.primary}
              />
              <Text style={styles.infoLabel}>Süre</Text>
              <Text style={styles.infoValue}>{duration}</Text>
            </GlassCard>
            <GlassCard intensity={10} style={styles.infoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.infoLabel}>Güven</Text>
              <Text style={styles.infoValue}>Doğrulanmış</Text>
            </GlassCard>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <BlurView
        intensity={80}
        tint="dark"
        style={[styles.actionBar, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.priceContainer}>
          <Text style={styles.actionBarPrice}>
            {currencySymbol}
            {currentPrice}
          </Text>
          <Text style={styles.actionBarUnit}>hediye miktarı</Text>
        </View>
        <TMButton
          title={`🎁 ${currencySymbol}${currentPrice} ile Destekle`}
          variant="primary"
          onPress={handleGiftPress}
          style={styles.giftButton}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  heroImage: {
    width: '100%',
    height: height * 0.65,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 18, 20, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroContent: {
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(223, 255, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: COLORS.brand.primary,
    fontSize: 10,
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontWeight: '900',
    color: COLORS.text.primary,
    lineHeight: 42,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  locationText: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
  },
  detailPanel: {
    padding: 24,
    marginTop: -20,
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  hostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface.base,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  hostName: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontWeight: '700',
  },
  hostStatus: {
    color: COLORS.text.secondary,
    fontSize: 10,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.brand.primary,
  },
  followText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    lineHeight:
      TYPOGRAPHY_SYSTEM.sizes.bodyM * TYPOGRAPHY_SYSTEM.lineHeights.relaxed,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    marginBottom: 24,
  },
  // Creator-Set Price Card
  priceCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priceLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    color: COLORS.brand.primary,
    fontSize: 48,
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontWeight: '900',
    marginBottom: 8,
  },
  priceNote: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    textAlign: 'center',
  },
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  infoLabel: {
    color: COLORS.text.tertiary,
    fontSize: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontWeight: '700',
    marginTop: 2,
  },
  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  priceContainer: {
    flex: 1,
  },
  actionBarPrice: {
    fontSize: 24,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontWeight: '900',
  },
  actionBarUnit: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
  },
  giftButton: {
    minWidth: 180,
    height: 52,
    borderRadius: 26,
  },
});

export default MomentDetailScreen;
