/**
 * SacredMoments Component
 *
 * Protected content wrapper with screenshot detection.
 * Shows blur + message when screenshot is attempted.
 *
 * @example
 * ```tsx
 * <SacredMoments
 *   enabled
 *   vaultMode
 *   showShareOption
 *   onShare={handleShare}
 * >
 *   <ProofImage source={{ uri: proof.imageUrl }} />
 * </SacredMoments>
 * ```
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  usePreventScreenCapture,
  addScreenshotListener,
} from 'expo-screen-capture';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_A11Y,
} from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface SacredMomentsProps {
  /** Protected content */
  children: React.ReactNode;
  /** Protection enabled */
  enabled?: boolean;
  /** Screenshot attempt callback */
  onScreenshotAttempt?: () => void;
  /** Show "Share with world" button */
  showShareOption?: boolean;
  /** Share callback */
  onShare?: () => void;
  /** Vault mode (stronger protection) */
  vaultMode?: boolean;
  /** Custom protection message */
  protectionMessage?: string;
  /** Test ID */
  testID?: string;
}

export const SacredMoments: React.FC<SacredMomentsProps> = ({
  children,
  enabled = true,
  onScreenshotAttempt,
  showShareOption = false,
  onShare,
  vaultMode = false,
  protectionMessage = 'Bu an sadece ikinize ait 💝',
  testID,
}) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const blurIntensity = useSharedValue(0);

  // Prevent screen capture in vault mode
  usePreventScreenCapture(vaultMode && enabled);

  // Screenshot listener
  useEffect(() => {
    if (!enabled) return;

    const subscription = addScreenshotListener(() => {
      // Screenshot detected
      handleScreenshotAttempt();
    });

    return () => subscription.remove();
  }, [enabled]);

  const handleScreenshotAttempt = useCallback(() => {
    setIsBlurred(true);
    setScreenshotCount((prev) => prev + 1);
    onScreenshotAttempt?.();

    // Haptic warning
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Animate blur
    blurIntensity.value = withSequence(
      withTiming(95, { duration: CEREMONY_TIMING.blurTransition }),
      withTiming(95, { duration: CEREMONY_TIMING.unblurDelay }),
      withTiming(0, { duration: CEREMONY_TIMING.blurTransition })
    );

    // Auto-unblur after delay
    setTimeout(() => {
      setIsBlurred(false);
    }, CEREMONY_TIMING.unblurDelay + CEREMONY_TIMING.blurTransition);
  }, [onScreenshotAttempt]);

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurIntensity.value / 95,
  }));

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityLabel={CEREMONY_A11Y.labels.sacredMoments}
    >
      {/* Content */}
      <View style={styles.content}>{children}</View>

      {/* Blur overlay */}
      {isBlurred && (
        <Animated.View
          entering={FadeIn.duration(CEREMONY_TIMING.blurTransition)}
          exiting={FadeOut.duration(CEREMONY_TIMING.blurTransition)}
          style={[StyleSheet.absoluteFill]}
        >
          <BlurView
            intensity={95}
            tint="dark"
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.messageContainer}>
              <View style={styles.lockIconContainer}>
                <MaterialCommunityIcons
                  name="lock-heart"
                  size={48}
                  color={CEREMONY_COLORS.sacred.lockIcon}
                />
              </View>
              <Text style={styles.protectionMessage}>{protectionMessage}</Text>
              {screenshotCount > 1 && (
                <Text style={styles.warningText}>
                  Ekran görüntüsü almak engellenmiştir
                </Text>
              )}
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Watermark (always visible) */}
      <View style={styles.watermark} pointerEvents="none">
        <Text style={styles.watermarkText}>TravelMatch</Text>
      </View>

      {/* Share button */}
      {showShareOption && !isBlurred && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={onShare}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={18}
            color={COLORS.white}
          />
          <Text style={styles.shareText}>Dünyayla Paylaş</Text>
        </TouchableOpacity>
      )}

      {/* Vault indicator */}
      {vaultMode && (
        <View style={styles.vaultIndicator}>
          <MaterialCommunityIcons
            name="shield-lock"
            size={14}
            color={CEREMONY_COLORS.sacred.lockIcon}
          />
          <Text style={styles.vaultText}>Korumalı</Text>
        </View>
      )}
    </View>
  );
};

/**
 * GiftVault Component
 *
 * Premium feature: Encrypted memory gallery with biometric unlock.
 */

import * as LocalAuthentication from 'expo-local-authentication';

interface Experience {
  id: string;
  proofUrls: string[];
  momentTitle: string;
  giverName: string;
  completedAt: Date;
  isShared: boolean;
}

interface GiftVaultProps {
  /** User's completed experiences */
  experiences: Experience[];
  /** Premium user */
  isPremium?: boolean;
  /** Experience select callback */
  onExperienceSelect: (id: string) => void;
  /** Premium upsell callback */
  onPremiumUpsell?: () => void;
  /** Test ID */
  testID?: string;
}

export const GiftVault: React.FC<GiftVaultProps> = ({
  experiences,
  isPremium = false,
  onExperienceSelect,
  onPremiumUpsell,
  testID,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const unlockVault = async () => {
    if (!isPremium) {
      onPremiumUpsell?.();
      return;
    }

    setIsAuthenticating(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback: just unlock
        setIsUnlocked(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Anı Kasanızı Açın',
        fallbackLabel: 'PIN Kullan',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsUnlocked(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isUnlocked) {
    return (
      <View style={styles.lockedVault} testID={testID}>
        <Animated.View
          entering={FadeIn}
          style={styles.vaultIconContainer}
        >
          <MaterialCommunityIcons
            name="treasure-chest"
            size={64}
            color={CEREMONY_COLORS.sacred.lockIcon}
          />
          <View style={styles.vaultGlow} />
        </Animated.View>

        <Text style={styles.vaultTitle}>Anı Kasası</Text>
        <Text style={styles.vaultSubtitle}>
          {isPremium
            ? 'Özel anılarınız şifreli kasada'
            : 'Premium ile anılarınızı şifreleyin'}
        </Text>

        <TouchableOpacity
          style={[styles.unlockButton, !isPremium && styles.premiumButton]}
          onPress={unlockVault}
          disabled={isAuthenticating}
        >
          <MaterialCommunityIcons
            name={isPremium ? 'fingerprint' : 'crown'}
            size={20}
            color={COLORS.white}
          />
          <Text style={styles.unlockButtonText}>
            {isAuthenticating
              ? 'Doğrulanıyor...'
              : isPremium
                ? 'Kasayı Aç'
                : "Premium'a Geç"}
          </Text>
        </TouchableOpacity>

        <View style={styles.vaultFeatures}>
          <VaultFeature
            icon="lock"
            text="Şifreli Depolama"
            available={isPremium}
          />
          <VaultFeature
            icon="fingerprint"
            text="Biyometrik Kilit"
            available={isPremium}
          />
          <VaultFeature
            icon="shield-check"
            text="Screenshot Koruması"
            available={isPremium}
          />
        </View>
      </View>
    );
  }

  // Unlocked vault - show experiences
  return (
    <View style={styles.unlockedVault} testID={testID}>
      <View style={styles.vaultHeader}>
        <MaterialCommunityIcons
          name="treasure-chest"
          size={24}
          color={CEREMONY_COLORS.sacred.lockIcon}
        />
        <Text style={styles.vaultHeaderText}>Anı Kasası</Text>
        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => setIsUnlocked(false)}
        >
          <MaterialCommunityIcons
            name="lock"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {experiences.length > 0 ? (
        <View style={styles.experiencesGrid}>
          {experiences.map((experience) => (
            <SacredMoments key={experience.id} enabled vaultMode>
              <TouchableOpacity
                style={styles.experienceCard}
                onPress={() => onExperienceSelect(experience.id)}
                activeOpacity={0.8}
              >
                {experience.proofUrls[0] && (
                  <Animated.Image
                    source={{ uri: experience.proofUrls[0] }}
                    style={styles.experienceImage}
                  />
                )}
                <View style={styles.experienceOverlay}>
                  <Text style={styles.experienceTitle} numberOfLines={1}>
                    {experience.momentTitle}
                  </Text>
                  <Text style={styles.experienceGiver}>
                    {experience.giverName}'dan
                  </Text>
                </View>
                {experience.isShared && (
                  <View style={styles.sharedBadge}>
                    <MaterialCommunityIcons
                      name="share"
                      size={12}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </SacredMoments>
          ))}
        </View>
      ) : (
        <View style={styles.emptyVault}>
          <MaterialCommunityIcons
            name="image-off"
            size={48}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyText}>Henüz anı yok</Text>
        </View>
      )}
    </View>
  );
};

// Vault Feature Component
const VaultFeature: React.FC<{
  icon: string;
  text: string;
  available: boolean;
}> = ({ icon, text, available }) => (
  <View style={[styles.featureItem, !available && styles.featureItemDisabled]}>
    <MaterialCommunityIcons
      name={icon as any}
      size={16}
      color={available ? COLORS.success : COLORS.textMuted}
    />
    <Text
      style={[styles.featureText, !available && styles.featureTextDisabled]}
    >
      {text}
    </Text>
    {!available && (
      <MaterialCommunityIcons
        name="lock"
        size={12}
        color={COLORS.textMuted}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  content: {
    width: '100%',
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  protectionMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  watermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    opacity: 0.15,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  shareButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CEREMONY_COLORS.sacred.shareButton,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  vaultIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 12,
    gap: 4,
  },
  vaultText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },

  // Locked vault
  lockedVault: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundSecondary,
  },
  vaultIconContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  vaultGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CEREMONY_COLORS.sacred.vaultGlow,
    top: -18,
    left: -18,
  },
  vaultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vaultSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CEREMONY_COLORS.sacred.lockIcon,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    gap: SPACING.sm,
  },
  premiumButton: {
    backgroundColor: COLORS.trustGold,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  vaultFeatures: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureItemDisabled: {
    opacity: 0.5,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
  },
  featureTextDisabled: {
    color: COLORS.textMuted,
  },

  // Unlocked vault
  unlockedVault: {
    flex: 1,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vaultHeaderText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  lockButton: {
    padding: SPACING.xs,
  },
  experiencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  experienceCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  experienceImage: {
    width: '100%',
    height: '100%',
  },
  experienceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  experienceGiver: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sharedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    padding: 4,
  },
  emptyVault: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});

export default SacredMoments;
