/**
 * MomentDetailScreen
 *
 * Immersive moment detail view with full-screen hero image.
 *
 * Also includes AwwwardsMomentDetailScreen variant:
 * - Awwwards "WOW" factor immersive design
 * - Liquid Glass navigation buttons
 * - Category badge with mono font
 * - Premium action bar with gift CTA
 * - Turkish labels and "Cinematic Trust Jewelry" aesthetic
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const { width: _width, height } = Dimensions.get('window');

export const MomentDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const _momentId = route?.params?.momentId;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <AnimatedImage
            source={{
              uri: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800',
            }}
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', COLORS.background.primary]}
            style={styles.gradient}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: insets.top + 10 }]}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shareBtn, { top: insets.top + 10 }]}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Host Info */}
          <View style={styles.hostRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.hostName}>Hosted by Selin Y.</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>4.9 (45)</Text>
                <View style={styles.dot} />
                <Text style={styles.verified}>Verified Host</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Sunset Dinner at Hotel Costes</Text>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Dining 🍽️</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Paris 🇫🇷</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>$$$</Text>
            </View>
          </View>

          <Text style={styles.desc}>
            Join me for an unforgettable dinner at the iconic Hotel Costes.
            Great vibes, amazing music, and the best spicy pasta in town.
            Looking for good company to share stories.
          </Text>

          <View style={styles.mapPreview}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={24}
              color={COLORS.brand.primary}
            />
            <Text style={styles.locationText}>239 Rue Saint-Honoré, Paris</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
              style={styles.mapChevron}
            />
          </View>

          <Text style={styles.sectionTitle}>What to expect</Text>
          <View style={styles.expectRow}>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="white"
              />
              <Text style={styles.expectLabel}>2 Hours</Text>
            </View>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color="white"
              />
              <Text style={styles.expectLabel}>Up to 2 Guests</Text>
            </View>
            <View style={styles.expectItem}>
              <MaterialCommunityIcons
                name="glass-cocktail"
                size={24}
                color="white"
              />
              <Text style={styles.expectLabel}>Drinks Incl.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <BlurView
        intensity={90}
        tint="dark"
        style={[styles.fab, { paddingBottom: insets.bottom + 20 }]}
      >
        <View>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>
            $150<Text style={styles.perPerson}> / person</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() =>
            navigation.navigate('Chat', {
              otherUser: {
                id: 'demo-host-selin',
                name: 'Selin Y.',
                avatar:
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
              },
            })
          }
        >
          <Text style={styles.bookText}>Request to Join</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  scrollContent: { paddingBottom: 100 },
  mapChevron: { marginLeft: 'auto' },
  imageContainer: { height: height * 0.45, width: '100%' },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: 150 },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 24, marginTop: -40 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  hostName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: 'white', fontSize: 12, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#666' },
  verified: { color: COLORS.brand.primary, fontSize: 12, fontWeight: 'bold' },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 12,
    lineHeight: 36,
  },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: { color: 'white', fontSize: 12, fontWeight: '600' },
  desc: { color: '#ccc', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  mapPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  locationText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 14,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  expectRow: { flexDirection: 'row', justifyContent: 'space-between' },
  expectItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    width: '30%',
  },
  expectLabel: { color: '#ccc', fontSize: 12, marginTop: 8, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: { color: '#888', fontSize: 12 },
  price: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  perPerson: { fontSize: 14, fontWeight: 'normal', color: '#888' },
  bookBtn: {
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  bookText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsMomentDetailScreen - Immersive "WOW" Experience
// Full-screen hero, Liquid Glass navigation, Premium action bar
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsMomentDetailParams {
  title?: string;
  location?: string;
  price?: string;
  imageUrl?: string;
  category?: string;
  hostName?: string;
  hostTrustScore?: number;
  duration?: string;
  description?: string;
}

interface AwwwardsMomentDetailScreenProps {
  navigation: any;
  route: {
    params?: AwwwardsMomentDetailParams;
  };
}

/**
 * AwwwardsMomentDetailScreen - Immersive Moment Detail
 *
 * Awwwards "WOW" factor screen with:
 * - Full-screen hero image (65% height)
 * - Gradient overlay from dark to transparent to background
 * - Liquid Glass circle navigation buttons
 * - Category badge with mono font
 * - Host info row with follow button
 * - Info cards for duration and trust
 * - Floating blur action bar with gift CTA
 */
export const AwwwardsMomentDetailScreen: React.FC<
  AwwwardsMomentDetailScreenProps
> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const {
    title = 'Bali Sunset Sanctuary',
    location = 'Uluwatu, Bali',
    price = '$45',
    imageUrl = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    category = 'DENEYİM • DOĞA',
    hostName = 'Caner Öz',
    hostTrustScore = 94,
    duration = '2-3 Saat',
    description = "Uluwatu'nun gizli kayalıklarında, kalabalıktan uzak bir gün batımı deneyimi. Burada sadece dalgaların sesini ve rüzgarın fısıltısını duyacaksınız. Doğrulanmış rotamla bu anı sen de yaşayabilirsin.",
  } = route.params || {};

  return (
    <View style={awwwardsStyles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image with Gradient Overlay */}
        <ImageBackground
          source={{ uri: imageUrl }}
          style={awwwardsStyles.heroImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', COLORS.bg.primary]}
            style={awwwardsStyles.gradientOverlay}
          >
            {/* Top Navigation */}
            <View
              style={[awwwardsStyles.topNav, { marginTop: insets.top + 10 }]}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={awwwardsStyles.circleButton}
              >
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
              <View style={awwwardsStyles.topNavRight}>
                <TouchableOpacity style={awwwardsStyles.circleButton}>
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={awwwardsStyles.circleButton}>
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Content */}
            <View style={awwwardsStyles.heroContent}>
              {/* Category Badge */}
              <View style={awwwardsStyles.categoryBadge}>
                <Text style={awwwardsStyles.categoryText}>{category}</Text>
              </View>

              {/* Title */}
              <Text style={awwwardsStyles.title}>{title}</Text>

              {/* Location Row */}
              <View style={awwwardsStyles.locationRow}>
                <Ionicons
                  name="location-sharp"
                  size={16}
                  color={COLORS.brand.primary}
                />
                <Text style={awwwardsStyles.locationText}>{location}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Detail Panel */}
        <View style={awwwardsStyles.detailPanel}>
          {/* Host Row */}
          <View style={awwwardsStyles.hostRow}>
            <View style={awwwardsStyles.hostInfo}>
              <View style={awwwardsStyles.hostAvatar} />
              <View>
                <Text style={awwwardsStyles.hostName}>
                  {hostName} tarafından paylaşıldı
                </Text>
                <Text style={awwwardsStyles.hostStatus}>
                  Pro Verici • {hostTrustScore} Güven Puanı
                </Text>
              </View>
            </View>
            <TouchableOpacity style={awwwardsStyles.followButton}>
              <Text style={awwwardsStyles.followText}>Takip Et</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={awwwardsStyles.description}>{description}</Text>

          {/* Info Cards Grid */}
          <View style={awwwardsStyles.infoGrid}>
            <GlassCard intensity={10} style={awwwardsStyles.infoCard}>
              <Ionicons
                name="time-outline"
                size={20}
                color={COLORS.brand.primary}
              />
              <Text style={awwwardsStyles.infoLabel}>Süre</Text>
              <Text style={awwwardsStyles.infoValue}>{duration}</Text>
            </GlassCard>
            <GlassCard intensity={10} style={awwwardsStyles.infoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.success}
              />
              <Text style={awwwardsStyles.infoLabel}>Güven</Text>
              <Text style={awwwardsStyles.infoValue}>Doğrulanmış</Text>
            </GlassCard>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <BlurView
        intensity={80}
        tint="dark"
        style={[
          awwwardsStyles.actionBar,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={awwwardsStyles.priceContainer}>
          <Text style={awwwardsStyles.actionBarPrice}>{price}</Text>
          <Text style={awwwardsStyles.actionBarUnit}>tek seferlik</Text>
        </View>
        <Button
          title="Şimdi Hediye Et"
          variant="primary"
          onPress={() =>
            navigation.navigate('Checkout', {
              amount: parseInt(price.replace(/\D/g, ''), 10) || 45,
              title,
            })
          }
          style={awwwardsStyles.giftButton}
        />
      </BlurView>
    </View>
  );
};

const awwwardsStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },

  // Hero Image (65% of screen)
  heroImage: {
    width: '100%',
    height: height * 0.65,
  },

  // Gradient overlay
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },

  // Top Navigation
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topNavRight: {
    flexDirection: 'row',
    gap: 12,
  },

  // Glass circle button
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

  // Hero content
  heroContent: {
    marginBottom: 20,
  },

  // Category badge
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

  // Title
  title: {
    fontSize: 36,
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontWeight: '900',
    color: COLORS.text.primary,
    lineHeight: 42,
  },

  // Location row
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

  // Detail panel
  detailPanel: {
    padding: 24,
    marginTop: -20,
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Host row
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

  // Follow button
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

  // Description
  description: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    lineHeight:
      TYPOGRAPHY_SYSTEM.sizes.bodyM * TYPOGRAPHY_SYSTEM.lineHeights.relaxed,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    marginBottom: 32,
  },

  // Info grid
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

  // Action bar
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
    borderTopColor: COLORS.border.subtle,
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
    width: 180,
    height: 52,
    borderRadius: 26,
  },
});

export default MomentDetailScreen;
