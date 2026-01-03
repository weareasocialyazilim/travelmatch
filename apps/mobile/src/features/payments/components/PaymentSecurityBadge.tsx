/**
 * PaymentSecurityBadge - Trust & Security Indicator
 *
 * Displays payment security status with visual trust indicators:
 * - ESCROW: Funds held securely until moment is delivered
 * - INSTANT: Direct payment with buyer protection
 * - VERIFIED: Payment method verified
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';

export type SecurityMode = 'ESCROW' | 'INSTANT' | 'VERIFIED';

interface PaymentSecurityBadgeProps {
  mode: SecurityMode;
}

const SECURITY_CONFIG: Record<
  SecurityMode,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    description: string;
    color: string;
  }
> = {
  ESCROW: {
    icon: 'shield-lock',
    title: 'Güvenli Escrow',
    description: 'Ödemeniz deneyim tamamlanana kadar güvende tutulur',
    color: COLORS.trust.primary,
  },
  INSTANT: {
    icon: 'lightning-bolt',
    title: 'Anında Ödeme',
    description: 'Alıcı koruması ile doğrudan ödeme',
    color: COLORS.primary,
  },
  VERIFIED: {
    icon: 'check-decagram',
    title: 'Doğrulanmış',
    description: 'Ödeme yöntemi doğrulandı',
    color: COLORS.success,
  },
};

export const PaymentSecurityBadge: React.FC<PaymentSecurityBadgeProps> = memo(
  ({ mode }) => {
    const config = SECURITY_CONFIG[mode];

    return (
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={24}
            color={config.color}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{config.title}</Text>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
          </View>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      </View>
    );
  },
);

PaymentSecurityBadge.displayName = 'PaymentSecurityBadge';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  description: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
});

export default PaymentSecurityBadge;
