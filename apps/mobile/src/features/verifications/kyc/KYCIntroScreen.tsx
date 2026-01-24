// KYC Intro Screen - Standard "Güven Seremonisi" experience
// Featuring silky glass effects and neon accents
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { securePaymentService } from '@/services';
import { useToast } from '@/context/ToastContext';
import { useKycAuthGuard } from './useKycAuthGuard';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteParams = RouteProp<RootStackParamList, 'IdentityVerification'>;

// Benefit data with neon theme
const BENEFITS = [
  {
    id: 'transfer',
    icon: 'flash-outline' as const,
    title: 'Anında Transfer',
    description: 'Onaylı hesaplarla limitlere takılmadan işlem yap.',
    accentColor: COLORS.primary,
  },
  {
    id: 'trust',
    icon: 'star-outline' as const,
    title: 'Yüksek Trust Score',
    description: 'Profilinde parlayan doğrulama mührünü kazan.',
    accentColor: COLORS.secondary,
  },
  {
    id: 'security',
    icon: 'shield-check-outline' as const,
    title: 'Güvenli Topluluk',
    description: 'Doğrulanmış kullanıcılarla güvenle etkileşim kur.',
    accentColor: COLORS.trust.primary,
  },
];

const KYCIntroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [isStarting, setIsStarting] = useState(false);
  useKycAuthGuard();

  // Breathing glow animation
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glowPulse]);

  // Animated glow style
  const glowStyle = useAnimatedStyle(() => {
    const scale = interpolate(glowPulse.value, [0, 1], [1, 1.3]);
    const opacity = interpolate(glowPulse.value, [0, 1], [0.4, 0.7]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Inner glow style
  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.6, 0.9]),
  }));

  const handleStart = async () => {
    try {
      setIsStarting(true);
      const { verificationUrl } =
        await securePaymentService.startKYCVerification();

      if (verificationUrl) {
        await Linking.openURL(verificationUrl);
      }

      navigation.navigate('KYCPending', {
        status: 'pending',
        returnTo: route.params?.returnTo,
      });
    } catch (error) {
      showToast('KYC başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <NetworkGuard offlineMessage="Kimlik doğrulama için internet bağlantısı gerekli.">
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.xl },
          ]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Icon with Neon Glow */}
          <View style={styles.iconContainer}>
            {/* Outer glow ring */}
            <Animated.View style={[styles.glowCircleOuter, glowStyle]} />
            {/* Inner glow ring */}
            <Animated.View style={[styles.glowCircleInner, innerGlowStyle]} />
            {/* Icon */}
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="shield-check"
                size={64}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* Text Group */}
          <View style={styles.textGroup}>
            <Text style={styles.overline}>SEÇKİN TOPLULUK</Text>
            <Text style={styles.title}>Güven Seremonisine{'\n'}Hoş Geldin</Text>
            <Text style={styles.subtitle}>
              Lovendo'da güvenli bir deneyim için kimliğini doğrulaman gerekir.
              Doğrulama adımları iDenfy'nin kendi ekranlarında yürütülür ve
              sonuç bize webhook ile iletilir.
            </Text>
          </View>

          {/* Benefit Cards (Liquid Glass) */}
          <View style={styles.benefitsContainer}>
            {BENEFITS.map((benefit) => (
              <GlassCard
                key={benefit.id}
                intensity={20}
                tint="light"
                style={styles.benefitCard}
                borderRadius={RADIUS.xl}
                padding={0}
              >
                <View style={styles.benefitCardInner}>
                  <View
                    style={[
                      styles.benefitIcon,
                      { backgroundColor: `${benefit.accentColor}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={benefit.icon}
                      size={24}
                      color={benefit.accentColor}
                    />
                  </View>
                  <View style={styles.benefitText}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDesc}>
                      {benefit.description}
                    </Text>
                  </View>
                  {/* Subtle neon accent line */}
                  <View
                    style={[
                      styles.accentLine,
                      { backgroundColor: benefit.accentColor },
                    ]}
                  />
                </View>
              </GlassCard>
            ))}
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={14}
              color={COLORS.text.tertiary}
            />
            <Text style={styles.privacyNote}>
              Verilerin uçtan uca şifrelenir ve sadece doğrulama amacıyla
              kullanılır.
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}
        >
          <Button
            title="Seremoniyi Başlat"
            variant="primary"
            onPress={handleStart}
            size="lg"
            style={styles.startButton}
            loading={isStarting}
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.laterButton}
            activeOpacity={0.7}
          >
            <Text style={styles.laterText}>Daha Sonra Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    alignItems: 'center',
    paddingBottom: SPACING['3xl'],
  },
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  glowCircleOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
  },
  glowCircleInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface.base,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textGroup: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.base,
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  benefitsContainer: {
    width: '100%',
    gap: SPACING.base,
    marginBottom: SPACING['2xl'],
  },
  benefitCard: {
    overflow: 'hidden',
  },
  benefitCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    position: 'relative',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  benefitDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  privacyNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  startButton: {
    height: 56,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  laterButton: {
    marginTop: SPACING.base,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  laterText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});

export default withErrorBoundary(KYCIntroScreen, {
  fallbackType: 'generic',
  displayName: 'KYCIntroScreen',
});
