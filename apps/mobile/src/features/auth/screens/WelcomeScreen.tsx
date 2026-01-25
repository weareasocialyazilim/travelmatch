/**
 * Lovendo Awwwards Design System 2026 - Welcome Screen
 *
 * Elegant simplicity with:
 * - Breathing logo animation
 * - Glow pulse effect
 * - Staggered button animations
 * - Ambient gradient orbs
 *
 * Designed for Awwwards Best UI/UX nomination
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticManager } from '@/services/HapticManager';

import { COLORS, GRADIENTS, PALETTE } from '@/constants/colors';
import { TYPE_SCALE } from '../../../theme/typography';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';
import { logger } from '../../../utils/logger';

// ============================================
// TYPES
// ============================================
interface WelcomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

// ============================================
// ANIMATED LOGO COMPONENT
// ============================================
const AnimatedLogo: React.FC = () => {
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 }),
      ),
      -1,
      false,
    );

    // Subtle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.logoContainer}>
      {/* Glow Effect */}
      <Reanimated.View style={[styles.logoGlow, glowStyle]}>
        <LinearGradient
          colors={GRADIENTS.aurora}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Reanimated.View>

      {/* Logo */}
      <Reanimated.View style={[styles.logoInner, logoStyle]}>
        <Text style={styles.logoEmoji}>{'\u{1F381}'}</Text>
      </Reanimated.View>
    </View>
  );
};

// ============================================
// ANIMATED BUTTON COMPONENT
// ============================================
interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant: 'apple' | 'google' | 'primary' | 'secondary';
  delay?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  showComingSoon?: boolean;
  testID?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  variant,
  delay = 0,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  showComingSoon = false,
  testID,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    HapticManager.buttonPress();
    onPress();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'apple':
        return styles.appleButton;
      case 'google':
        return styles.googleButton;
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return {};
    }
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPress={disabled ? undefined : handlePress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        style={[
          styles.button,
          getButtonStyle(),
          disabled && styles.disabledButton,
        ]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        <View style={styles.buttonContent}>{children}</View>
        {showComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>SOON</Text>
          </View>
        )}
      </Pressable>
    </Reanimated.View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { socialAuth, isLoading: _isLoading } = useAuth();

  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const handleAppleLogin = useCallback(async () => {
    try {
      logger.info('[WelcomeScreen] Starting Apple Sign In');
      const result = await socialAuth({ provider: 'apple', token: '' });
      if (!result.success && result.error) {
        logger.error('[WelcomeScreen] Apple Sign In failed:', result.error);
      }
    } catch (error) {
      logger.error('[WelcomeScreen] Apple Sign In exception:', error);
    }
  }, [socialAuth]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      logger.info('[WelcomeScreen] Starting Google Sign In');
      const result = await socialAuth({ provider: 'google', token: '' });
      if (!result.success && result.error) {
        logger.error('[WelcomeScreen] Google Sign In failed:', result.error);
      }
    } catch (error) {
      logger.error('[WelcomeScreen] Google Sign In exception:', error);
    }
  }, [socialAuth]);

  const handleCreateAccount = useCallback(() => {
    navigation.navigate('UnifiedAuth');
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate('UnifiedAuth');
  }, [navigation]);

  return (
    <View testID="screen-welcome" style={styles.container}>
      {/* Ambient Background */}
      <LinearGradient
        colors={[COLORS.bg.primary, COLORS.bg.tertiary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Gradient Orbs */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.15)', 'transparent']}
          style={[styles.orb, styles.orbTopRight]}
        />
        <LinearGradient
          colors={['rgba(244, 63, 94, 0.1)', 'transparent']}
          style={[styles.orb, styles.orbBottomLeft]}
        />
      </View>

      {/* Main Content */}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.heroSection}>
          <AnimatedLogo />

          <Reanimated.View style={titleStyle}>
            <Text style={styles.appName}>{t('common.appName')}</Text>
          </Reanimated.View>

          <Reanimated.View style={subtitleStyle}>
            <Text style={styles.tagline}>{t('tagline.main')}</Text>
          </Reanimated.View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          {/* Social Logins */}
          <AnimatedButton
            variant="apple"
            onPress={handleAppleLogin}
            delay={600}
            accessibilityLabel="Apple ile devam et"
            accessibilityHint="Apple hesabınızla giriş yaparsınız"
            testID="btn-apple-signin"
          >
            <MaterialCommunityIcons
              name="apple"
              size={22}
              color={PALETTE.white}
            />
            <Text style={styles.socialButtonText}>
              {t('welcome.continueWithApple')}
            </Text>
          </AnimatedButton>

{/* Google login hidden until implementation is complete */}
          {/* <AnimatedButton
            variant="google"
            onPress={handleGoogleLogin}
            delay={700}
            accessibilityLabel="Google ile devam et"
            accessibilityHint="Google ile giriş yapın"
            disabled={true}
            showComingSoon={false}
          >
            <MaterialCommunityIcons
              name="google"
              size={22}
              color={PALETTE.white}
            />
            <Text style={styles.socialButtonText}>
              {t('welcome.continueWithGoogle')}
            </Text>
          </AnimatedButton> */}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('welcome.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Options */}
          <AnimatedButton
            variant="primary"
            onPress={handleCreateAccount}
            delay={800}
            accessibilityLabel="Hesap oluştur"
            accessibilityHint="Yeni bir hesap oluşturmak için kayıt sayfasına gider"
            testID="btn-create-account"
          >
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientFill}
            >
              <Text style={styles.primaryButtonText}>
                {t('welcome.createAccount')}
              </Text>
            </LinearGradient>
          </AnimatedButton>

          <AnimatedButton
            variant="secondary"
            onPress={handleLogin}
            delay={900}
            accessibilityLabel="Giriş yap"
            accessibilityHint="Mevcut hesabınızla giriş sayfasına gider"
            testID="btn-login"
          >
            <Text style={styles.secondaryButtonText}>{t('welcome.login')}</Text>
          </AnimatedButton>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {t('welcome.termsPrefix')}{' '}
          <Text style={styles.footerLink}>{t('welcome.terms')}</Text>{' '}
          {t('welcome.and')}{' '}
          <Text style={styles.footerLink}>{t('welcome.privacy')}</Text>
        </Text>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  orbTopRight: {
    top: -100,
    right: -150,
  },
  orbBottomLeft: {
    bottom: -100,
    left: -150,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 70,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    transform: [{ scale: 1.3 }],
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    ...TYPE_SCALE.display.h1,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  tagline: {
    ...TYPE_SCALE.body.large,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionSection: {
    gap: 14,
  },
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  appleButton: {
    backgroundColor: PALETTE.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: COLORS.google,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    ...TYPE_SCALE.label.large,
    color: PALETTE.white,
  },
  primaryButton: {
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPE_SCALE.label.large,
    color: PALETTE.white,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...TYPE_SCALE.label.large,
    color: COLORS.brand.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  comingSoonBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  comingSoonText: {
    ...TYPE_SCALE.body.caption,
    color: PALETTE.white,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.text.muted,
    opacity: 0.3,
  },
  dividerText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.muted,
    marginHorizontal: 16,
  },
  footer: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.brand.primary,
  },
});

export default WelcomeScreen;
