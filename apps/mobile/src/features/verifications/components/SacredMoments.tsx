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

import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  ZoomIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  usePreventScreenCapture,
  addScreenshotListener,
} from 'expo-screen-capture';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticManager } from '@/services/HapticManager';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_A11Y,
} from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
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

export const SacredMoments = memo<SacredMomentsProps>(
  ({
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
    usePreventScreenCapture(
      vaultMode && enabled ? 'sacred-moments' : undefined,
    );

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
      HapticManager.warning();

      // Animate blur in
      blurIntensity.value = withTiming(95, {
        duration: CEREMONY_TIMING.blurTransition,
      });

      // Auto-unblur after delay
      const timer = setTimeout(() => {
        blurIntensity.value = withTiming(0, {
          duration: CEREMONY_TIMING.blurTransition,
        });
        setIsBlurred(false);
      }, CEREMONY_TIMING.unblurDelay);

      // Return cleanup function for use by caller if needed
      return () => clearTimeout(timer);
    }, [onScreenshotAttempt, blurIntensity]);

    const blurAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(blurIntensity.value, [0, 95], [0, 1]),
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
        <Animated.View
          style={[StyleSheet.absoluteFill, blurAnimatedStyle]}
          pointerEvents={isBlurred ? 'auto' : 'none'}
        >
          <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.messageContainer}>
              <Animated.View
                entering={ZoomIn.springify()}
                style={styles.lockIconContainer}
              >
                <MaterialCommunityIcons
                  name="shield-lock"
                  size={56}
                  color={CEREMONY_COLORS.sacred.lockIcon}
                />
              </Animated.View>
              <Text style={styles.protectionMessage}>{protectionMessage}</Text>
              <Text style={styles.protectionHint}>
                Screenshot'lar korunan içeriği yakalayamaz
              </Text>
              {screenshotCount > 1 && (
                <Text style={styles.warningText}>
                  Ekran görüntüsü almak engellenmiştir
                </Text>
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* Share button with gradient */}
        {showShareOption && !isBlurred && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={onShare}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareGradient}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color={COLORS.white}
              />
              <Text style={styles.shareText}>Dünyayla Paylaş</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Subtle watermark for shared content */}
        {showShareOption && (
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>Lovendo</Text>
          </View>
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
  },
);

SacredMoments.displayName = 'SacredMoments';

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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  protectionMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  protectionHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  shareButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  shareText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  watermark: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    opacity: 0.3,
  },
  watermarkText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
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
});

export default SacredMoments;
