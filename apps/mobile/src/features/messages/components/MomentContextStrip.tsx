/**
 * MomentContextStrip - Sticky Context Banner
 *
 * ELEVATED: Always visible at the top of chat, showing:
 * - Moment title and image
 * - Requested price (Alıcı Fiyat Belirler)
 * - Sunset Clock (remaining time for offer)
 * - Current status with liquid styling
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '@/constants/colors';

export interface MomentContext {
  id: string;
  title: string;
  /** Requested gift amount (Alıcı sets this) */
  requested_amount: number;
  currency?: string;
  image?: string;
  status?: 'negotiating' | 'accepted' | 'paid' | 'completed' | 'expired';
  /** ISO timestamp for offer expiry - Sunset Clock */
  expires_at?: string;
  /** Host (Alıcı) user ID */
  host_id?: string;
}

interface MomentContextStripProps {
  moment: MomentContext;
  onPress?: () => void;
  /** Is current user the moment host (Alıcı)? */
  isHost?: boolean;
}

/**
 * Calculate remaining time for Sunset Clock
 */
const getRemainingTime = (expiresAt?: string): string | null => {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
};

export const MomentContextStrip: React.FC<MomentContextStripProps> = ({
  moment,
  onPress,
  isHost = false,
}) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(
    getRemainingTime(moment.expires_at),
  );

  // Sunset Clock - update every minute
  useEffect(() => {
    if (!moment.expires_at) return;

    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime(moment.expires_at));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [moment.expires_at]);

  const currencySymbol =
    moment.currency === 'TRY' ? '₺' : moment.currency === 'EUR' ? '€' : '$';

  const getStatusConfig = () => {
    switch (moment.status) {
      case 'accepted':
        return {
          text: 'Teklif Kabul Edildi',
          color: COLORS.feedback.success,
          icon: 'check-circle' as const,
        };
      case 'paid':
        return {
          text: 'Ödeme Tamamlandı',
          color: COLORS.brand.secondary,
          icon: 'credit-card-check' as const,
        };
      case 'completed':
        return {
          text: 'Anı Tamamlandı',
          color: COLORS.brand.primary,
          icon: 'star-circle' as const,
        };
      case 'expired':
        return {
          text: 'Süre Doldu',
          color: COLORS.text.muted,
          icon: 'clock-alert-outline' as const,
        };
      default:
        return {
          text: isHost
            ? `${currencySymbol}${moment.requested_amount} isteniyor`
            : `${currencySymbol}${moment.requested_amount} hediye bekleniyor`,
          color: COLORS.brand.primary,
          icon: 'gift-outline' as const,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
        style={styles.contextStrip}
      >
        {moment.image && (
          <Image source={{ uri: moment.image }} style={styles.contextImage} />
        )}
        <View style={styles.contextInfo}>
          <Text style={styles.contextTitle} numberOfLines={1}>
            {moment.title}
          </Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.contextStatus, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Sunset Clock */}
        {remainingTime && moment.status === 'negotiating' && (
          <View style={styles.sunsetClock}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color={
                remainingTime === 'Expired'
                  ? COLORS.feedback.error
                  : COLORS.brand.accent
              }
            />
            <Text
              style={[
                styles.sunsetText,
                remainingTime === 'Expired' && styles.expiredText,
              ]}
            >
              {remainingTime}
            </Text>
          </View>
        )}

        <View style={styles.contextAction}>
          <Text style={styles.viewButton}>Detay</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.brand.primary}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contextImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: COLORS.border.light,
  },
  contextInfo: {
    flex: 1,
  },
  contextTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  sunsetClock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  sunsetText: {
    color: COLORS.brand.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  expiredText: {
    color: COLORS.feedback.error,
  },
  contextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewButton: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
});

export default MomentContextStrip;
