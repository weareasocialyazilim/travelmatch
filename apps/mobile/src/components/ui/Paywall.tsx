/**
 * Paywall - Lovendo Ultimate Design System 2026
 * Feature-specific paywall component
 *
 * Shows when user tries to access a premium feature:
 * - Feature-specific messaging and icon
 * - Current plan indicator
 * - Upgrade CTA
 * - "Maybe later" dismiss option
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { HAPTIC } from '@/utils/motion';
import { Sheet } from './Sheet';

export type PaywallFeature =
  | 'moments'
  | 'messages'
  | 'gifts'
  | 'saved'
  | 'filters'
  | 'verified';

export interface PaywallProps {
  /** Whether the paywall is visible */
  visible: boolean;
  /** Callback when paywall is closed */
  onClose: () => void;
  /** Callback when upgrade button is pressed */
  onUpgrade: () => void;
  /** The feature being paywalled */
  feature: PaywallFeature;
  /** Current subscription plan ID */
  currentPlan: string;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Feature configuration
 */
const FEATURE_CONFIG: Record<
  PaywallFeature,
  {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    description: string;
    requiredPlan: string;
  }
> = {
  moments: {
    icon: 'image-multiple',
    title: 'Moment Limit Reached',
    description:
      "You've used all your moments this month. Upgrade to create more travel experiences.",
    requiredPlan: 'first_class',
  },
  messages: {
    icon: 'chat-processing',
    title: 'Message Limit Reached',
    description:
      "You've reached your daily message limit. Upgrade for unlimited messaging.",
    requiredPlan: 'first_class',
  },
  gifts: {
    icon: 'gift',
    title: 'Gift Limit Reached',
    description:
      "You've sent all your gifts this month. Upgrade to send more gifts.",
    requiredPlan: 'first_class',
  },
  saved: {
    icon: 'bookmark-multiple',
    title: 'Saved Moments Full',
    description:
      "You've reached your saved moments limit. Upgrade to save more experiences.",
    requiredPlan: 'first_class',
  },
  filters: {
    icon: 'filter-variant',
    title: 'Premium Filters',
    description:
      "Unlock advanced filters to find exactly what you're looking for.",
    requiredPlan: 'first_class',
  },
  verified: {
    icon: 'check-decagram',
    title: 'Verified Badge',
    description:
      'Stand out with a verified badge on your profile. Build trust with the community.',
    requiredPlan: 'premium',
  },
};

/**
 * Plan display names - Lovendo 3-Tier System
 */
const PLAN_NAMES: Record<string, string> = {
  basic: 'Momentum (Free)',
  free: 'Momentum (Free)',
  premium: 'Premium',
  platinum: 'Platinum',
};

export const Paywall: React.FC<PaywallProps> = ({
  visible,
  onClose,
  onUpgrade,
  feature,
  currentPlan,
  style,
  testID,
}) => {
  const config = FEATURE_CONFIG[feature];
  const requiredPlanName =
    PLAN_NAMES[config.requiredPlan] || config.requiredPlan;
  const currentPlanName = PLAN_NAMES[currentPlan] || currentPlan;

  const handleUpgrade = useCallback(() => {
    HAPTIC.medium();
    onUpgrade();
  }, [onUpgrade]);

  const handleDismiss = useCallback(() => {
    HAPTIC.light();
    onClose();
  }, [onClose]);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      size="content"
      showCloseButton={false}
      testID={testID}
    >
      <View style={[styles.container, style]}>
        {/* Icon with gradient background */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons
              name={config.icon}
              size={40}
              color={COLORS.white}
            />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{config.description}</Text>

        {/* Current Plan */}
        <View style={styles.currentPlanRow}>
          <Text style={styles.currentPlanLabel}>Current Plan:</Text>
          <Text style={styles.currentPlanValue}>{currentPlanName}</Text>
        </View>

        {/* Required Plan */}
        <View style={styles.requiredPlanRow}>
          <MaterialCommunityIcons
            name="arrow-up-bold-circle"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.requiredPlanText}>
            Upgrade to{' '}
            <Text style={styles.planHighlight}>{requiredPlanName}</Text> to
            unlock
          </Text>
        </View>

        {/* Upgrade Button */}
        <Pressable
          onPress={handleUpgrade}
          style={styles.upgradeButton}
          testID={testID ? `${testID}-upgrade` : undefined}
        >
          <LinearGradient
            colors={GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonGradient}
          >
            <MaterialCommunityIcons
              name="crown"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </LinearGradient>
        </Pressable>

        {/* Dismiss Button */}
        <Pressable
          onPress={handleDismiss}
          style={styles.dismissButton}
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <Text style={styles.dismissText}>Maybe later</Text>
        </Pressable>
      </View>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  currentPlanLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: primitives.stone[400],
  },
  currentPlanValue: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.text.primary,
  },
  requiredPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  requiredPlanText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  planHighlight: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: RADIUS.button,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.base,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.white,
  },
  dismissButton: {
    paddingVertical: SPACING.md,
  },
  dismissText: {
    ...TYPOGRAPHY.label,
    color: primitives.stone[400],
  },
});

export default Paywall;
