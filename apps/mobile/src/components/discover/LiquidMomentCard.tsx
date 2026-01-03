/**
 * LiquidMomentCard - Awwwards Quality Compact Moment Card
 *
 * Premium card combining:
 * - High-resolution visuals with silky gradients
 * - Neon badges for GenZ aesthetic appeal
 * - Glass info panel for 40+ demographic clarity
 * - Liquid glass effects for depth perception
 */

import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES_V2, TYPE_SCALE } from '../../constants/typography';
import { GlassCard } from '../ui/GlassCard';

export interface LiquidMomentCardProps {
  title: string;
  location: string;
  price: string;
  imageUrl?: string;
  isInstant?: boolean;
  onPress?: () => void;
}

/**
 * Awwwards standardında Liquid Moment Card.
 * Görsel derinlik ve ipeksi glass paneller içerir.
 */
export const LiquidMomentCard: React.FC<LiquidMomentCardProps> = memo(
  ({ title, location, price, imageUrl, isInstant = true, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <ImageBackground
          source={{
            uri:
              imageUrl ||
              'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
          }}
          style={styles.backgroundImage}
          imageStyle={styles.imageStyle}
        >
          {/* Top Scrim with Neon Badge */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent']}
            style={styles.topScrim}
          >
            {isInstant && (
              <View style={styles.instantBadge}>
                <View style={styles.neonDot} />
                <Text style={styles.instantText}>INSTANT</Text>
              </View>
            )}
          </LinearGradient>

          {/* Bottom Section with Liquid Glass Info Panel */}
          <View style={styles.bottomSection}>
            <GlassCard intensity={30} tint="dark" style={styles.glassInfo}>
              <View style={styles.infoRow}>
                <View style={styles.textContainer}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-sharp"
                      size={12}
                      color={COLORS.primary}
                    />
                    <Text style={styles.locationText}>{location}</Text>
                  </View>
                </View>

                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{price}</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  },
);

LiquidMomentCard.displayName = 'LiquidMomentCard';

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: COLORS.surface.base,
    // Premium shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 32,
  },
  topScrim: {
    height: 80,
    padding: 20,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 20, 0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  neonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
    // Neon glow effect
    shadowColor: COLORS.primary,
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  instantText: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomSection: {
    padding: 12,
  },
  glassInfo: {
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES_V2.h3,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    color: COLORS.text.onDarkSecondary,
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.regular,
  },
  priceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    // Neon glow for price
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  priceText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES_V2.body,
    fontWeight: '900',
    fontFamily: FONTS.mono.medium,
  },
});

export default LiquidMomentCard;
