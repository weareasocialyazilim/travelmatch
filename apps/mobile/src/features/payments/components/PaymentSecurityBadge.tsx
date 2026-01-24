import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';

interface PaymentSecurityBadgeProps {
  /** Payment mode - ESCROW for protected payments, INSTANT for direct transfers */
  mode: 'ESCROW' | 'INSTANT';
}

/**
 * PaymentSecurityBadge - Premium Payment Security Indicator
 *
 * High-quality component that visualizes payment security.
 * Features:
 * - Glassmorphism card with neon glow
 * - Animated shield icon for ESCROW mode
 * - Clear, concise security messaging
 */
export const PaymentSecurityBadge: React.FC<PaymentSecurityBadgeProps> = ({
  mode,
}) => {
  const isEscrow = mode === 'ESCROW';
  const pulseScale = useSharedValue(1);

  // Subtle pulse animation for ESCROW mode
  React.useEffect(() => {
    if (isEscrow) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [isEscrow, pulseScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const iconColor = isEscrow ? COLORS.brand.primary : COLORS.brand.secondary;

  return (
    <GlassCard
      intensity={30}
      style={
        [
          styles.container,
          isEscrow && styles.escrowGlow,
        ] as StyleProp<ViewStyle>
      }
      borderRadius={16}
      padding={0}
    >
      <View style={styles.content}>
        {/* Icon Container with Glow */}
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${iconColor}15` },
            ]}
          >
            <Ionicons
              name={isEscrow ? 'shield-checkmark' : 'flash'}
              size={22}
              color={iconColor}
            />
          </View>
          {/* Glow ring for ESCROW */}
          {isEscrow && (
            <View style={[styles.iconGlow, { backgroundColor: iconColor }]} />
          )}
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isEscrow ? 'Emanet Koruması Aktif' : 'Anında Transfer'}
          </Text>
          <Text style={styles.description}>
            {isEscrow
              ? 'Ödemeniz bizde güvende. Deneyim tamamlanana kadar vericiye aktarılmaz.'
              : 'Bu işlem güven limitleri dahilinde doğrudan gerçekleşir.'}
          </Text>
        </View>

        {/* Status Indicator */}
        <View style={[styles.statusDot, { backgroundColor: iconColor }]} />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: 'hidden',
  },
  escrowGlow: {
    borderColor: `${COLORS.brand.primary}33`, // 20% opacity
    ...Platform.select({
      ios: {
        shadowColor: COLORS.brand.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {},
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    opacity: 0.15,
    zIndex: 0,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  description: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
});

export default PaymentSecurityBadge;
