/**
 * Unified Success Screen
 * Replaces: CardAddedSuccessScreen, CardRemovedSuccessScreen, CacheSuccessScreen,
 * GiftSentSuccessScreen, WithdrawSuccessScreen, DisputeSuccessScreen,
 * PostProofSuccessScreen, ProofApprovedScreen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type SuccessType =
  | 'card_added'
  | 'card_removed'
  | 'cache_cleared'
  | 'gift_sent'
  | 'withdraw'
  | 'dispute'
  | 'proof_uploaded'
  | 'proof_approved'
  | 'profile_complete'
  | 'generic';

interface SuccessConfig {
  icon: IconName;
  iconColor: string;
  emoji?: string;
  title: string;
  subtitle: string;
  primaryButton: string;
  primaryAction: keyof RootStackParamList;
  secondaryButton?: string;
  secondaryAction?: keyof RootStackParamList;
  showDetails?: boolean;
}

const SUCCESS_CONFIGS: Record<SuccessType, SuccessConfig> = {
  card_added: {
    icon: 'credit-card-check',
    iconColor: COLORS.success,
    title: 'Card Added Successfully',
    subtitle: "You can now use this card to support travelers' moments.",
    primaryButton: 'Done',
    primaryAction: 'Discover',
  },
  card_removed: {
    icon: 'credit-card-remove',
    iconColor: COLORS.success,
    title: 'Card Removed',
    subtitle: 'Your card has been removed from your account.',
    primaryButton: 'Done',
    primaryAction: 'Discover',
  },
  cache_cleared: {
    icon: 'cached',
    iconColor: COLORS.success,
    title: 'Cache Cleared',
    subtitle: 'App cache has been cleared successfully.',
    primaryButton: 'Done',
    primaryAction: 'Discover',
  },
  gift_sent: {
    icon: 'gift',
    iconColor: COLORS.primary,
    emoji: '🎉',
    title: 'Gift Sent!',
    subtitle:
      "Your gift is now securely held in escrow. We'll notify you with proof as soon as the traveler completes the moment.",
    primaryButton: 'View Moment',
    primaryAction: 'Discover',
  },
  withdraw: {
    icon: 'check-circle',
    iconColor: COLORS.success,
    title: 'Withdrawal Requested',
    subtitle: "You'll receive the money soon.",
    primaryButton: 'Done',
    primaryAction: 'Wallet',
    showDetails: true,
  },
  dispute: {
    icon: 'check-circle',
    iconColor: COLORS.success,
    title: 'Dispute Submitted Successfully',
    subtitle:
      'Your dispute has been received and a confirmation email has been sent. Our support team will review your case within 3-5 business days.',
    primaryButton: 'Track Dispute Status',
    primaryAction: 'Discover',
    secondaryButton: 'Return to Wallet',
    secondaryAction: 'Wallet',
  },
  proof_uploaded: {
    icon: 'check-circle',
    iconColor: COLORS.success,
    title: 'Proof Uploaded!',
    subtitle:
      "Your proof has been submitted for verification. You'll be notified once it's approved.",
    primaryButton: 'View Proof',
    primaryAction: 'Discover',
  },
  proof_approved: {
    icon: 'check-decagram',
    iconColor: COLORS.success,
    title: 'Proof Approved!',
    subtitle:
      'Congratulations! Your proof has been verified and funds have been released.',
    primaryButton: 'Done',
    primaryAction: 'Wallet',
  },
  profile_complete: {
    icon: 'account-check',
    iconColor: COLORS.success,
    title: "You're in!",
    subtitle: "Let's personalize your TravelMatch journey.",
    primaryButton: 'Start exploring',
    primaryAction: 'Discover',
  },
  generic: {
    icon: 'check-circle',
    iconColor: COLORS.success,
    title: 'Success!',
    subtitle: 'Operation completed successfully.',
    primaryButton: 'Done',
    primaryAction: 'Discover',
  },
};

type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'Success'>;

export const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<SuccessScreenRouteProp>();

  // Get success type from route params, default to generic
  const successType: SuccessType = route.params?.type || 'generic';
  const customTitle = route.params?.title;
  const customSubtitle = route.params?.subtitle;
  const details = route.params?.details;

  const config = SUCCESS_CONFIGS[successType];

  const title = customTitle || config.title;
  const subtitle = customSubtitle || config.subtitle;

  const handlePrimaryAction = () => {
    // Type-safe navigation with proper params
    const screen = config.primaryAction;
    navigation.navigate(screen as never);
  };

  const handleSecondaryAction = () => {
    if (config.secondaryAction) {
      navigation.navigate(config.secondaryAction as never);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* Icon/Emoji */}
          <View style={styles.iconContainer}>
            {config.emoji ? (
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{config.emoji}</Text>
              </View>
            ) : (
              <MaterialCommunityIcons
                name={config.icon}
                size={96}
                color={config.iconColor}
              />
            )}
          </View>

          {/* Text Block */}
          <View style={styles.textBlock}>
            <Text style={styles.headline}>{title}</Text>
            <Text style={styles.body}>{subtitle}</Text>
          </View>

          {/* Details Card (for withdraw, etc.) */}
          {config.showDetails && details && (
            <View style={styles.detailsCard}>
              {details.amount && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>
                    ${details.amount.toFixed(2)}
                  </Text>
                </View>
              )}
              {details.destination && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text style={styles.detailValue}>{details.destination}</Text>
                </View>
              )}
              {details.referenceId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference ID</Text>
                  <Text style={styles.detailValue}>{details.referenceId}</Text>
                </View>
              )}
              {details.estimatedArrival && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estimated Arrival</Text>
                  <Text style={styles.detailValue}>
                    {details.estimatedArrival}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePrimaryAction}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{config.primaryButton}</Text>
        </TouchableOpacity>

        {config.secondaryButton && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSecondaryAction}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {config.secondaryButton}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headline: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  body: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  secondaryButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default SuccessScreen;
