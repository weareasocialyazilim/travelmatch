/**
 * KYCSelfieScreen - Biometric Art Edition
 *
 * Futuristic face verification with animated scanning rings
 * and neon feedback effects. "Digital Identity" ceremony.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { KYCProgressBar } from './KYCProgressBar';
import { KYC_COLORS, KYC_TYPOGRAPHY, KYC_SPACING, KYC_SPRINGS } from './theme';
import type { VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVAL_WIDTH = SCREEN_WIDTH * 0.65;
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

type RouteParams = {
  KYCSelfie: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCReview: { data: VerificationData };
}>;

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

// Animated scanning ring component
interface ScanRingProps {
  index: number;
  isScanning: boolean;
  isSuccess: boolean;
}

const ScanRing: React.FC<ScanRingProps> = ({
  index,
  isScanning,
  isSuccess,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      // Pulsing scale animation
      scale.value = withDelay(
        index * 200,
        withRepeat(
          withSequence(
            withTiming(1.15, {
              duration: 1500,
              easing: Easing.out(Easing.ease),
            }),
            withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );
      // Fade in and pulse opacity
      opacity.value = withDelay(
        index * 200,
        withRepeat(
          withSequence(
            withTiming(0.6 - index * 0.15, { duration: 1500 }),
            withTiming(0.3 - index * 0.08, { duration: 1500 }),
          ),
          -1,
          false,
        ),
      );
      // Slow rotation
      rotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1,
        false,
      );
    } else if (isSuccess) {
      // Success state - solid glow
      scale.value = withSpring(1.05, KYC_SPRINGS.gentle);
      opacity.value = withTiming(0.8 - index * 0.2, { duration: 500 });
      cancelAnimation(rotation);
    } else {
      // Idle state
      scale.value = withSpring(1, KYC_SPRINGS.gentle);
      opacity.value = withTiming(0.15, { duration: 300 });
      cancelAnimation(rotation);
    }
  }, [isScanning, isSuccess, index, scale, opacity, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const ringColor = isSuccess ? KYC_COLORS.neon.emerald : KYC_COLORS.neon.cyan;
  const ringSize = OVAL_WIDTH + 40 + index * 30;
  const ringHeight = OVAL_HEIGHT + 40 + index * 30;

  return (
    <Animated.View
      style={[
        styles.scanRing,
        ringStyle,
        {
          width: ringSize,
          height: ringHeight,
          borderRadius: ringSize / 2,
          borderColor: ringColor,
        },
      ]}
    />
  );
};

// Face oval with gradient border
const FaceOval: React.FC<{ scanState: ScanState }> = ({ scanState }) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (scanState === 'scanning') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 }),
        ),
        -1,
        false,
      );
    } else if (scanState === 'success') {
      pulseScale.value = withSpring(1, KYC_SPRINGS.bouncy);
      glowOpacity.value = withTiming(0.9, { duration: 500 });
    } else {
      pulseScale.value = withSpring(1, KYC_SPRINGS.gentle);
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [scanState, pulseScale, glowOpacity]);

  const ovalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const borderColor =
    scanState === 'success'
      ? KYC_COLORS.neon.emerald
      : scanState === 'scanning'
        ? KYC_COLORS.neon.cyan
        : KYC_COLORS.neon.lime;

  return (
    <Animated.View style={[styles.faceOvalContainer, ovalStyle]}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.ovalGlow,
          glowStyle,
          {
            shadowColor: borderColor,
            backgroundColor: `${borderColor}10`,
          },
        ]}
      />

      {/* Main oval border */}
      <View style={[styles.faceOval, { borderColor }]}>
        {/* Inner gradient overlay */}
        <LinearGradient
          colors={['transparent', `${borderColor}08`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ovalGradient}
        />

        {/* Center icon */}
        <View style={styles.ovalCenter}>
          {scanState === 'success' ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <MaterialCommunityIcons
                name="check-circle"
                size={72}
                color={KYC_COLORS.neon.emerald}
              />
            </Animated.View>
          ) : scanState === 'scanning' ? (
            <MaterialCommunityIcons
              name="face-recognition"
              size={64}
              color={KYC_COLORS.neon.cyan}
            />
          ) : (
            <MaterialCommunityIcons
              name="account-outline"
              size={64}
              color={KYC_COLORS.text.tertiary}
            />
          )}
        </View>

        {/* Corner markers */}
        <View
          style={[styles.cornerMarker, styles.cornerTopLeft, { borderColor }]}
        />
        <View
          style={[styles.cornerMarker, styles.cornerTopRight, { borderColor }]}
        />
        <View
          style={[
            styles.cornerMarker,
            styles.cornerBottomLeft,
            { borderColor },
          ]}
        />
        <View
          style={[
            styles.cornerMarker,
            styles.cornerBottomRight,
            { borderColor },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const KYCSelfieScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCSelfie'>>();
  const { data: initialData } = route.params;

  const [data, setData] = useState<VerificationData>(initialData);
  const [scanState, setScanState] = useState<ScanState>('idle');

  // Liveness check state - Anti-fraud "Master" touch
  const [livenessStep, setLivenessStep] = useState<
    'ready' | 'turn_left' | 'turn_right' | 'blink' | 'complete'
  >('ready');
  const [livenessProgress, setLivenessProgress] = useState(0);

  const buttonScale = useSharedValue(1);
  const _statusOpacity = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Liveness check instructions
  const LIVENESS_STEPS = {
    ready: {
      text: 'Yüzünüzü ovalin içine yerleştirin',
      icon: 'account-outline' as const,
    },
    turn_left: {
      text: 'Kafanızı yavaşça SOLA çevirin',
      icon: 'arrow-left-bold' as const,
    },
    turn_right: {
      text: 'Kafanızı yavaşça SAĞA çevirin',
      icon: 'arrow-right-bold' as const,
    },
    blink: { text: 'Şimdi 2 kez göz kırpın', icon: 'eye-outline' as const },
    complete: {
      text: 'Canlılık doğrulaması tamamlandı!',
      icon: 'check-circle' as const,
    },
  };

  const startLivenessCheck = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanState('scanning');
    setLivenessStep('turn_left');
    setLivenessProgress(0);

    // Step 1: Turn left (simulate detection)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLivenessProgress(33);
    setLivenessStep('turn_right');

    // Step 2: Turn right
    await new Promise((resolve) => setTimeout(resolve, 1500));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLivenessProgress(66);
    setLivenessStep('blink');

    // Step 3: Blink
    await new Promise((resolve) => setTimeout(resolve, 1500));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLivenessProgress(100);
    setLivenessStep('complete');

    // Complete
    await new Promise((resolve) => setTimeout(resolve, 500));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanState('success');
    setData((prev) => ({
      ...prev,
      selfie: 'captured',
      livenessVerified: true,
    }));
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('KYCReview', { data });
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, KYC_SPRINGS.snappy);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, KYC_SPRINGS.bouncy);
  };

  const getStatusText = () => {
    if (scanState === 'scanning') {
      return LIVENESS_STEPS[livenessStep].text;
    }
    switch (scanState) {
      case 'success':
        return 'Canlılık doğrulaması başarılı!';
      case 'error':
        return 'Tekrar deneyin';
      default:
        return 'Yüzünüzü ovalin içine yerleştirin';
    }
  };

  const getStatusColor = () => {
    switch (scanState) {
      case 'scanning':
        return KYC_COLORS.neon.cyan;
      case 'success':
        return KYC_COLORS.neon.emerald;
      case 'error':
        return KYC_COLORS.neon.rose;
      default:
        return KYC_COLORS.text.secondary;
    }
  };

  return (
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
          <Text style={styles.headerTitle}>Yüz Doğrulama</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Progress Bar */}
        <KYCProgressBar currentStep="selfie" />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.titleSection}
          >
            <Text style={styles.title}>Dijital Kimlik Tarama</Text>
            <Text style={styles.subtitle}>
              Biyometrik doğrulama için yüzünüzü kameraya gösterin.
            </Text>
          </Animated.View>

          {/* Scanner Area */}
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.scannerArea}
          >
            {/* Background scan rings */}
            {[0, 1, 2].map((index) => (
              <ScanRing
                key={index}
                index={index}
                isScanning={scanState === 'scanning'}
                isSuccess={scanState === 'success'}
              />
            ))}

            {/* Face oval */}
            <FaceOval scanState={scanState} />
          </Animated.View>

          {/* Status indicator */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            style={styles.statusSection}
          >
            <GlassCard intensity={12} style={styles.statusCard} padding={16}>
              <View style={styles.statusContent}>
                {scanState === 'scanning' && (
                  <>
                    <MaterialCommunityIcons
                      name={LIVENESS_STEPS[livenessStep].icon}
                      size={24}
                      color={KYC_COLORS.neon.cyan}
                    />
                    {/* Liveness progress bar */}
                    <View style={styles.livenessProgress}>
                      <View style={styles.livenessProgressTrack}>
                        <View
                          style={[
                            styles.livenessProgressFill,
                            { width: `${livenessProgress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </>
                )}
                {scanState === 'success' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={KYC_COLORS.neon.emerald}
                  />
                )}
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Instructions */}
          {scanState === 'idle' && (
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              style={styles.instructionsSection}
            >
              <View style={styles.instructionRow}>
                <View style={styles.instructionIcon}>
                  <Ionicons
                    name="sunny-outline"
                    size={18}
                    color={KYC_COLORS.neon.amber}
                  />
                </View>
                <Text style={styles.instructionText}>
                  İyi aydınlatılmış bir ortam
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={styles.instructionIcon}>
                  <Ionicons
                    name="glasses-outline"
                    size={18}
                    color={KYC_COLORS.neon.violet}
                  />
                </View>
                <Text style={styles.instructionText}>
                  Gözlük veya şapka çıkarın
                </Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={styles.instructionIcon}>
                  <Ionicons
                    name="happy-outline"
                    size={18}
                    color={KYC_COLORS.neon.lime}
                  />
                </View>
                <Text style={styles.instructionText}>
                  Doğal ifade ile bakın
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Footer with CTA */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.footer}
        >
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={
                scanState === 'success' ? handleContinue : startLivenessCheck
              }
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={scanState === 'scanning'}
              activeOpacity={1}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={
                  scanState === 'success'
                    ? [KYC_COLORS.neon.emerald, KYC_COLORS.neon.cyan]
                    : scanState === 'scanning'
                      ? [KYC_COLORS.text.tertiary, KYC_COLORS.text.muted]
                      : KYC_COLORS.gradients.primary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {scanState === 'scanning' ? (
                  <>
                    <MaterialCommunityIcons
                      name="face-recognition"
                      size={22}
                      color={KYC_COLORS.background.primary}
                    />
                    <Text style={styles.primaryButtonText}>Taranıyor...</Text>
                  </>
                ) : scanState === 'success' ? (
                  <>
                    <Text style={styles.primaryButtonText}>Devam Et</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={KYC_COLORS.background.primary}
                    />
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="scan"
                      size={22}
                      color={KYC_COLORS.background.primary}
                    />
                    <Text style={styles.primaryButtonText}>
                      Taramayı Başlat
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.securityNote}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={14}
              color={KYC_COLORS.text.tertiary}
            />
            <Text style={styles.securityNoteText}>
              Biyometrik verileriniz şifrelenerek korunur
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

// Animated scanning dot
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ScanningDot: React.FC<{ index: number }> = ({ index }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        false,
      ),
    );
  }, [index, opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.scanDot, dotStyle]} />;
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
  content: {
    flex: 1,
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: KYC_SPACING.screenPadding,
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    ...KYC_TYPOGRAPHY.pageTitle,
    color: KYC_COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...KYC_TYPOGRAPHY.body,
    color: KYC_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scannerArea: {
    width: SCREEN_WIDTH,
    height: OVAL_HEIGHT + 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  faceOvalContainer: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: OVAL_WIDTH / 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
      },
      android: {},
    }),
  },
  faceOval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  ovalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ovalCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 30,
    left: 30,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 30,
    right: 30,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 30,
    left: 30,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 30,
    right: 30,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  statusSection: {
    marginTop: 24,
    paddingHorizontal: KYC_SPACING.screenPadding,
    width: '100%',
  },
  statusCard: {
    borderColor: KYC_COLORS.glass.border,
    borderRadius: 16,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    ...KYC_TYPOGRAPHY.body,
    fontWeight: '600',
  },
  scanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: KYC_COLORS.neon.cyan,
  },
  // Liveness check progress bar
  livenessProgress: {
    flex: 1,
    maxWidth: 120,
  },
  livenessProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  livenessProgressFill: {
    height: '100%',
    backgroundColor: KYC_COLORS.neon.cyan,
    borderRadius: 2,
  },
  instructionsSection: {
    marginTop: 20,
    paddingHorizontal: KYC_SPACING.screenPadding * 2,
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: KYC_COLORS.glass.backgroundMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    ...KYC_TYPOGRAPHY.cardDesc,
    color: KYC_COLORS.text.secondary,
  },
  footer: {
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  buttonWrapper: {
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
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

export default withErrorBoundary(KYCSelfieScreen, {
  fallbackType: 'generic',
  displayName: 'KYCSelfieScreen',
});
