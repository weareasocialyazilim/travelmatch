/**
 * OfferBubble - Gift Offer Card (LVND Coin Transfer)
 *
 * APPLE IAP COMPLIANT: All purchases via RevenueCat/IAP
 * Offers are now LVND coin transfers, not direct payments.
 *
 * Features:
 * - Liquid Platinum styling for high-value offers
 * - Direct LVND coin transfer on acceptance
 * - Haptic feedback on interactions
 * - Confetti animation on successful transfer
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { HapticManager } from '@/services/HapticManager';
import type { OfferStatus } from '@/types/message.types';

/** Threshold for "Liquid Platinum" high-value offers (TRY) */
const PLATINUM_THRESHOLD = 5000;

interface OfferBubbleProps {
  amount: number;
  currency?: string;
  status: OfferStatus;
  momentTitle?: string;
  momentId?: string;
  giftOfferId?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  /** Called when coin transfer completes successfully */
  onPaymentSuccess?: () => void;
  /** Called when coin transfer fails */
  onPaymentFailure?: (error?: string) => void;
  isOwn?: boolean;
  /** Is user a high-value subscriber (Platinum styling) */
  isPlatinumUser?: boolean;
}

export const OfferBubble: React.FC<OfferBubbleProps> = ({
  amount,
  currency = 'USD',
  status,
  momentTitle,
  momentId: _momentId,
  giftOfferId: _giftOfferId,
  onAccept,
  onDecline,
  onPaymentSuccess: _onPaymentSuccess,
  onPaymentFailure: _onPaymentFailure,
  isOwn = false,
  isPlatinumUser = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const currencySymbol =
    currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';
  const isPlatinumOffer = amount >= PLATINUM_THRESHOLD || isPlatinumUser;

  /**
   * Handle Accept - Direct LVND coin transfer
   * APPLE IAP COMPLIANT: Uses pre-purchased LVND coins
   */
  const handleAccept = async () => {
    HapticManager.paymentInitiated();
    setIsProcessing(true);
    // Direct accept - LVND coin transfer handled by backend
    onAccept?.();
    setIsProcessing(false);
  };

  const handleDecline = () => {
    HapticManager.buttonPress();
    onDecline?.();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        return {
          icon: 'check-circle' as const,
          color: COLORS.feedback.success,
          text: 'Offer Accepted',
        };
      case 'declined':
        return {
          icon: 'close-circle' as const,
          color: COLORS.feedback.error,
          text: 'Offer Declined',
        };
      case 'expired':
        return {
          icon: 'clock-alert-outline' as const,
          color: COLORS.text.secondary,
          text: 'Offer Expired',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  if (isOwn) {
    // Sent offer - simpler display
    return (
      <Animated.View entering={FadeInUp} style={styles.ownOfferContainer}>
        <View style={styles.ownOfferCard}>
          <View style={styles.ownOfferHeader}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={18}
              color={COLORS.brand.primary}
            />
            <Text style={styles.ownOfferTitle}>Gift Offer Sent</Text>
          </View>
          <Text style={styles.ownOfferAmount}>
            {currencySymbol}
            {amount.toLocaleString()}
          </Text>
          {momentTitle && (
            <Text style={styles.ownOfferMoment} numberOfLines={1}>
              for "{momentTitle}"
            </Text>
          )}
          {statusConfig && (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={16}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  }

  // Received offer - with actions and LVND coin transfer
  return (
    <Animated.View entering={FadeInUp} style={styles.offerContainer}>
      <LinearGradient
        colors={
          isPlatinumOffer
            ? ['#2C3E50', '#34495E', '#4A5568']
            : [COLORS.brand.secondary, '#3AAFA7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.offerCard, isPlatinumOffer && styles.platinumCard]}
      >
        {isPlatinumOffer && (
          <View style={styles.platinumBadge}>
            <MaterialCommunityIcons
              name="diamond-stone"
              size={12}
              color={COLORS.brand.accent}
            />
            <Text style={styles.platinumBadgeText}>Premium Hediye</Text>
          </View>
        )}

        <View style={styles.offerHeader}>
          <MaterialCommunityIcons
            name={isPlatinumOffer ? 'diamond' : 'handshake'}
            size={24}
            color={isPlatinumOffer ? COLORS.brand.accent : 'white'}
          />
          <Text style={styles.offerTitle}>Hediye Teklifi Alındı</Text>
        </View>

        <Text
          style={[styles.offerAmount, isPlatinumOffer && styles.platinumAmount]}
        >
          {currencySymbol}
          {amount.toLocaleString()}
        </Text>

        {momentTitle && (
          <Text style={styles.offerMoment} numberOfLines={2}>
            "{momentTitle}" için
          </Text>
        )}

        <Text style={styles.offerDesc}>
          {status === 'pending'
            ? 'Birisi size bu anı hediye etmek istiyor!'
            : statusConfig?.text}
        </Text>

        {status === 'pending' && (
          <View style={styles.offerActions}>
            <TouchableOpacity
              style={styles.offerButtonReject}
              onPress={handleDecline}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={18} color="white" />
              <Text style={styles.offerButtonTextSmall}>Reddet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.offerButtonAccept,
                isPlatinumOffer && styles.platinumAcceptButton,
              ]}
              onPress={handleAccept}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color="black"
                  />
                  <Text style={styles.offerButtonText}>Kabul Et</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {statusConfig && (
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons
              name={statusConfig.icon}
              size={20}
              color="white"
            />
            <Text style={styles.statusBadgeText}>{statusConfig.text}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Received offer styles
  offerContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  offerCard: {
    width: '100%',
    maxWidth: 320,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  platinumCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    shadowColor: COLORS.brand.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  platinumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  platinumBadgeText: {
    color: COLORS.brand.accent,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  offerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offerAmount: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    marginVertical: 4,
  },
  platinumAmount: {
    color: COLORS.brand.accent,
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  offerMoment: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  offerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  offerButtonReject: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  offerButtonAccept: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.brand.accent,
  },
  platinumAcceptButton: {
    backgroundColor: COLORS.brand.accent,
    shadowColor: COLORS.brand.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  offerButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  offerButtonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 100,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },

  // Own offer styles
  ownOfferContainer: {
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  ownOfferCard: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'flex-end',
  },
  ownOfferHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ownOfferTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  ownOfferAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  ownOfferMoment: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OfferBubble;
