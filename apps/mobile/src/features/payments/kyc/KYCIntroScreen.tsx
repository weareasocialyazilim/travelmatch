/**
 * KYCIntroScreen - Awwwards Edition
 *
 * Premium intro screen for identity verification ceremony.
 * Features Twilight Zinc dark theme with glass effects and neon accents.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { GlassCard } from '@/components/ui/GlassCard';
import { INITIAL_VERIFICATION_DATA } from './constants';
import {
  KYC_COLORS,
  KYC_TYPOGRAPHY,
  KYC_SPACING,
  KYC_SPRINGS,
  KYC_REQUIREMENTS,
} from './theme';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<{
  KYCDocumentType: { data: typeof INITIAL_VERIFICATION_DATA };
}>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const KYCIntroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const buttonScale = useSharedValue(1);

  const handleStart = () => {
    navigation.navigate('KYCDocumentType', {
      data: INITIAL_VERIFICATION_DATA,
    });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, KYC_SPRINGS.snappy);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, KYC_SPRINGS.bouncy);
  };

  return (
    <NetworkGuard offlineMessage="Kimlik doğrulama için internet bağlantısı gerekli.">
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={KYC_COLORS.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kimlik Doğrulama</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.heroSection}
            >
              <View style={styles.heroIcon}>
                <LinearGradient
                  colors={KYC_COLORS.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroIconGradient}
                />
                <View style={styles.heroIconInner}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={48}
                    color={KYC_COLORS.neon.lime}
                  />
                </View>
              </View>

              <Text style={styles.title}>Kimliğini Doğrula</Text>
              <Text style={styles.description}>
                Güvenli bir topluluk için kimliğini doğrulamamız gerekiyor.
                Bu, platformdaki herkesin korunmasına yardımcı olur.
              </Text>
            </Animated.View>

            {/* Requirements Section */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.requirementsSection}
            >
              <Text style={styles.sectionTitle}>GEREKENLER</Text>

              <GlassCard intensity={15} style={styles.requirementsCard} padding={0}>
                {KYC_REQUIREMENTS.map((req, index) => (
                  <View
                    key={req.id}
                    style={[
                      styles.requirementItem,
                      index < KYC_REQUIREMENTS.length - 1 && styles.requirementBorder,
                    ]}
                  >
                    <View style={styles.requirementIcon}>
                      <MaterialCommunityIcons
                        name={req.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={24}
                        color={KYC_COLORS.neon.lime}
                      />
                    </View>
                    <Text style={styles.requirementLabel}>{req.label}</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={KYC_COLORS.neon.cyan}
                    />
                  </View>
                ))}
              </GlassCard>
            </Animated.View>

            {/* Trust Badge */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.trustSection}
            >
              <GlassCard intensity={10} style={styles.trustCard}>
                <View style={styles.trustContent}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={KYC_COLORS.neon.violet}
                  />
                  <Text style={styles.trustText}>
                    Verileriniz şifrelenmiş ve güvende tutulmaktadır
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          </ScrollView>

          {/* Footer with CTA */}
          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            style={styles.footer}
          >
            <AnimatedTouchable
              style={[styles.primaryButton, buttonAnimatedStyle]}
              onPress={handleStart}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <LinearGradient
                colors={KYC_COLORS.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Başla</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={KYC_COLORS.background.primary}
                />
              </LinearGradient>
            </AnimatedTouchable>

            <View style={styles.securityNote}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={KYC_COLORS.text.tertiary}
              />
              <Text style={styles.securityNoteText}>
                256-bit SSL şifreleme ile korunuyor
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KYC_COLORS.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: KYC_COLORS.glass.backgroundMedium,
  },
  headerTitle: {
    ...KYC_TYPOGRAPHY.cardTitle,
    color: KYC_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingBottom: 24,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  heroIconGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    opacity: 0.15,
  },
  heroIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: KYC_COLORS.glass.background,
    borderWidth: 1,
    borderColor: KYC_COLORS.glass.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: KYC_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {},
    }),
  },
  title: {
    ...KYC_TYPOGRAPHY.pageTitle,
    color: KYC_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...KYC_TYPOGRAPHY.body,
    color: KYC_COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...KYC_TYPOGRAPHY.sectionTitle,
    color: KYC_COLORS.text.secondary,
    marginBottom: 16,
  },
  requirementsCard: {
    borderColor: KYC_COLORS.glass.border,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  requirementBorder: {
    borderBottomWidth: 1,
    borderBottomColor: KYC_COLORS.glass.border,
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: `${KYC_COLORS.neon.lime}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementLabel: {
    flex: 1,
    ...KYC_TYPOGRAPHY.body,
    color: KYC_COLORS.text.primary,
    fontWeight: '500',
  },

  // Trust Section
  trustSection: {
    marginBottom: 24,
  },
  trustCard: {
    borderColor: KYC_COLORS.glass.border,
  },
  trustContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustText: {
    ...KYC_TYPOGRAPHY.caption,
    color: KYC_COLORS.text.secondary,
    flex: 1,
  },

  // Footer
  footer: {
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: KYC_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: KYC_COLORS.background.primary,
    letterSpacing: 0.3,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityNoteText: {
    ...KYC_TYPOGRAPHY.caption,
    color: KYC_COLORS.text.tertiary,
  },
});

export default withErrorBoundary(KYCIntroScreen, {
  fallbackType: 'generic',
  displayName: 'KYCIntroScreen',
});
