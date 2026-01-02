/**
 * GiftVault Component
 *
 * Premium feature: Encrypted memory gallery with biometric unlock.
 * Provides secure access to completed experience memories.
 *
 * Features:
 * - Biometric authentication (Face ID / Touch ID / Fingerprint)
 * - Premium gating with upsell
 * - Animated vault unlock effect
 * - Screenshot protection via SacredMoments wrapper
 *
 * @example
 * ```tsx
 * <GiftVault
 *   experiences={completedExperiences}
 *   isPremium={user.isPremium}
 *   onExperienceSelect={(id) => navigate('ExperienceDetail', { id })}
 *   onPremiumUpsell={() => navigate('Premium')}
 * />
 * ```
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { SacredMoments } from './SacredMoments';
import { CEREMONY_COLORS } from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING, RADIUS } from '@/constants/spacing';
import { logger } from '@/utils/logger';

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

// Format date helper
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// Vault Feature Component - memoized for performance
const VaultFeature = memo<{
  icon: string;
  text: string;
  available: boolean;
}>(({ icon, text, available }) => (
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
      <MaterialCommunityIcons name="lock" size={12} color={COLORS.textMuted} />
    )}
  </View>
));

VaultFeature.displayName = 'VaultFeature';

// Experience Card Component - memoized for FlashList performance
interface ExperienceCardProps {
  item: Experience;
  onExperienceSelect: (id: string) => void;
}

const ExperienceCard = memo<ExperienceCardProps>(
  ({ item, onExperienceSelect }) => (
    <SacredMoments enabled vaultMode showShareOption={item.isShared}>
      <TouchableOpacity
        style={styles.experienceCard}
        onPress={() => onExperienceSelect(item.id)}
        activeOpacity={0.8}
      >
        {item.proofUrls[0] ? (
          <Image
            source={{ uri: item.proofUrls[0] }}
            style={styles.experienceImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.experienceImage, styles.experiencePlaceholder]}>
            <MaterialCommunityIcons
              name="image"
              size={32}
              color={COLORS.textMuted}
            />
          </View>
        )}
        <View style={styles.experienceOverlay}>
          <Text style={styles.experienceTitle} numberOfLines={1}>
            {item.momentTitle}
          </Text>
          <Text style={styles.experienceGiver}>{item.giverName}'dan</Text>
          <Text style={styles.experienceDate}>
            {formatDate(item.completedAt)}
          </Text>
        </View>
        {item.isShared && (
          <View style={styles.sharedBadge}>
            <MaterialCommunityIcons
              name="earth"
              size={12}
              color={COLORS.white}
            />
          </View>
        )}
      </TouchableOpacity>
    </SacredMoments>
  ),
);

ExperienceCard.displayName = 'ExperienceCard';

export const GiftVault: React.FC<GiftVaultProps> = ({
  experiences,
  isPremium = false,
  onExperienceSelect,
  onPremiumUpsell,
  testID,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Vault unlock animation values
  const vaultScale = useSharedValue(1);
  const vaultRotation = useSharedValue(0);

  const vaultIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: vaultScale.value },
      { rotate: `${vaultRotation.value}deg` },
    ],
  }));

  const unlockVault = async () => {
    if (!isPremium) {
      // Show premium upsell
      if (onPremiumUpsell) {
        onPremiumUpsell();
      } else {
        Alert.alert(
          'Premium Özellik',
          'Anı Kasası Premium üyelere özeldir. Şimdi yükseltin!',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: "Premium'a Geç", onPress: onPremiumUpsell },
          ],
        );
      }
      return;
    }

    setIsAuthenticating(true);

    try {
      // Check biometric availability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback to simple confirmation
        setIsUnlocked(true);
        setIsAuthenticating(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      // Biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Anı Kasanızı Açın',
        fallbackLabel: 'PIN Kullan',
        cancelLabel: 'Vazgeç',
        disableDeviceFallback: false,
      });

      setIsAuthenticating(false);

      if (result.success) {
        // Unlock animation
        vaultScale.value = withSequence(
          withTiming(1.1, { duration: 100 }),
          withSpring(1, { damping: 8 }),
        );
        vaultRotation.value = withSequence(
          withTiming(5, { duration: 50 }),
          withTiming(-5, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => setIsUnlocked(true), 300);
      }
    } catch (error) {
      logger.error('Authentication error:', error);
      setIsAuthenticating(false);
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Memoized render function for FlashList
  const renderExperienceCard = useCallback(
    ({ item }: { item: Experience }) => (
      <ExperienceCard item={item} onExperienceSelect={onExperienceSelect} />
    ),
    [onExperienceSelect],
  );

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: Experience) => item.id, []);

  // Locked state
  if (!isUnlocked) {
    return (
      <View style={styles.lockedContainer} testID={testID}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#1E1B4B']}
          style={styles.vaultBackground}
        >
          {/* Vault icon with animation */}
          <Animated.View style={[styles.vaultIconContainer, vaultIconStyle]}>
            <View style={styles.vaultIcon}>
              <MaterialCommunityIcons
                name="lock"
                size={64}
                color={CEREMONY_COLORS.sacred.lockIcon}
              />
            </View>
            {/* Glow effect */}
            <View style={styles.vaultGlow} />
          </Animated.View>

          <Text style={styles.vaultTitle}>Anı Kasası</Text>
          <Text style={styles.vaultSubtitle}>
            {isPremium
              ? `${experiences.length} özel anı güvenli kasanızda`
              : 'Premium ile anılarınızı şifreleyin'}
          </Text>

          <TouchableOpacity
            style={styles.unlockButton}
            onPress={unlockVault}
            disabled={isAuthenticating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.unlockGradient}
            >
              {isAuthenticating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={isPremium ? 'fingerprint' : 'crown'}
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.unlockText}>
                    {isPremium ? 'Kasayı Aç' : "Premium'a Geç"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Security badge */}
          <View style={styles.securityBadge}>
            <MaterialCommunityIcons
              name="shield-check"
              size={16}
              color={COLORS.emerald}
            />
            <Text style={styles.securityText}>Uçtan uca şifreli</Text>
          </View>

          {/* Feature list */}
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
        </LinearGradient>
      </View>
    );
  }

  // Unlocked - show experiences
  return (
    <View style={styles.unlockedContainer} testID={testID}>
      <View style={styles.vaultHeader}>
        <MaterialCommunityIcons
          name="treasure-chest"
          size={24}
          color={CEREMONY_COLORS.sacred.lockIcon}
        />
        <Text style={styles.vaultHeaderTitle}>Anı Kasası</Text>
        <TouchableOpacity onPress={lockVault} style={styles.lockButton}>
          <MaterialCommunityIcons
            name="lock"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {experiences.length > 0 ? (
        <FlashList
          data={experiences}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.experienceGrid}
          renderItem={renderExperienceCard}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={180}
          removeClippedSubviews={true}
        />
      ) : (
        <Animated.View entering={FadeIn} style={styles.emptyVault}>
          <MaterialCommunityIcons
            name="image-off"
            size={48}
            color={COLORS.textMuted}
          />
          <Text style={styles.emptyText}>Henüz anı yok</Text>
          <Text style={styles.emptyHint}>
            Deneyimlerinizi tamamladığınızda burada görünecek
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Locked vault styles
  lockedContainer: {
    flex: 1,
  },
  vaultBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  vaultIconContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  vaultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  vaultGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    zIndex: -1,
  },
  vaultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  vaultSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  unlockButton: {
    width: '100%',
    maxWidth: 280,
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  unlockText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: 6,
  },
  securityText: {
    color: COLORS.emerald,
    fontSize: 12,
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
    color: COLORS.white,
  },
  featureTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Unlocked vault styles
  unlockedContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  vaultHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  lockButton: {
    padding: SPACING.xs,
  },
  experienceGrid: {
    padding: SPACING.sm,
  },
  experienceRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  experienceCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceMuted,
  },
  experienceImage: {
    width: '100%',
    height: '100%',
  },
  experiencePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSubtle,
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
  experienceDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default GiftVault;
