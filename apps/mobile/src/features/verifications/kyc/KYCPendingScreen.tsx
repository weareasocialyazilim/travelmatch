/**
 * KYCPendingScreen - Digital Vault Experience
 *
 * Futuristic verification pending screen with:
 * - Animated processing ring (spinning vault lock)
 * - Neon glow effects
 * - Glass info cards
 * - "Digital Vault" security visualization
 *
 * "Your data is safely locked in our digital vault."
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMButton } from '@/components/ui/TMButton';

/**
 * Animated processing ring component (vault lock visualization)
 */
const ProcessingVaultRing: React.FC = () => {
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1, // Infinite
      false,
    );

    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, [rotation, pulseScale, glowOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowOpacity.value, [0.4, 0.8], [0.3, 0.6]),
  }));

  return (
    <View style={styles.animationContainer}>
      {/* Outer glow pulse */}
      <Animated.View style={[styles.outerGlow, pulseStyle]} />

      {/* Processing ring */}
      <Animated.View style={[styles.processingRing, ringStyle]}>
        <View style={styles.ringSegment1} />
        <View style={styles.ringSegment2} />
      </Animated.View>

      {/* Center vault icon */}
      <View style={styles.centerIcon}>
        <Animated.View style={[styles.innerGlow, innerGlowStyle]} />
        <Ionicons name="lock-closed" size={36} color={COLORS.primary} />
      </View>

      {/* Data particles (decorative) */}
      <View style={styles.particleContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.particle,
              { transform: [{ rotate: `${i * 90}deg` }, { translateY: -50 }] },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const KYCPendingScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Discover' }],
      }),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Vault Animation */}
        <ProcessingVaultRing />

        {/* Title */}
        <Text style={styles.title}>Belgelerin İnceleniyor</Text>
        <Text style={styles.subtitle}>
          Yapay zeka asistanımız kimliğini doğruluyor.{'\n'}
          Bu işlem genellikle birkaç dakika sürer.
        </Text>

        {/* Info Card */}
        <GlassCard
          intensity={15}
          tint="dark"
          padding={0}
          borderRadius={24}
          style={styles.infoCard}
        >
          <View style={styles.infoContent}>
            {/* Estimated Time */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Tahmini süre</Text>
                <Text style={styles.infoValue}>5-10 dakika</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Notification */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Bildirim</Text>
                <Text style={styles.infoValue}>
                  Sonuçlandığında bildirim alacaksın
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Security */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={COLORS.trust.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Güvenlik</Text>
                <Text style={styles.infoValue}>
                  Verilen 256-bit şifreleme ile korunuyor
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TMButton
          title="Keşfet'e Dön"
          variant="secondary"
          onPress={handleDone}
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  // Animation container
  animationContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  processingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSegment1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringSegment2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
  },
  particleContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  // Text styles
  title: {
    fontSize: FONT_SIZES_V2.h2,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.text.onDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  // Info card
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 30, 32, 0.6)',
  },
  infoContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.textOnDarkMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    color: COLORS.text.onDark,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});

export default withErrorBoundary(KYCPendingScreen, {
  fallbackType: 'generic',
  displayName: 'KYCPendingScreen',
});
