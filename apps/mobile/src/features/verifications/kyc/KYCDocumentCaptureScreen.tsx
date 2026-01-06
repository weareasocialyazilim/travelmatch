// KYC Document Capture Screen - Neon Scanning Ritual
// Immersive camera overlay with glowing neon frame and real-time guidance
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
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
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { KYCProgressBar } from './KYCProgressBar';
import type { VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH - 48;
const FRAME_HEIGHT = FRAME_WIDTH * 0.63; // ID card aspect ratio

type RouteParams = {
  KYCDocumentCapture: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCSelfie: { data: VerificationData };
}>;

// Document type labels in Turkish
const DOCUMENT_LABELS: Record<string, string> = {
  passport: 'PASAPORT',
  id_card: 'KİMLİK KARTI',
  drivers_license: 'EHLİYET',
};

const KYCDocumentCaptureScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCDocumentCapture'>>();
  const insets = useSafeAreaInsets();
  const { data: initialData } = route.params;

  const [_data, setData] = useState<VerificationData>(initialData);
  const [captureSide, setCaptureSide] = useState<'front' | 'back'>('front');
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const scanLineY = useSharedValue(0);
  const cornerPulse = useSharedValue(0);
  const captureScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  // Scan line animation
  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scanLineY]);

  // Corner pulse animation
  useEffect(() => {
    cornerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [cornerPulse]);

  // Animated styles
  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scanLineY.value, [0, 1], [0, FRAME_HEIGHT - 4]),
      },
    ],
  }));

  const cornerGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(cornerPulse.value, [0, 1], [0.5, 1]),
    opacity: interpolate(cornerPulse.value, [0, 1], [0.8, 1]),
  }));

  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handleCapture = useCallback(() => {
    if (isCapturing) return;

    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Button press animation
    captureScale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 }),
    );

    // Flash effect
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 200 }),
    );

    // Simulate capture delay
    setTimeout(() => {
      const side = captureSide;
      setData((prev) => ({
        ...prev,
        [side === 'front' ? 'documentFront' : 'documentBack']: 'captured',
      }));

      const isPassport = initialData.documentType === 'passport';

      if (side === 'front' && !isPassport) {
        setCaptureSide('back');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Navigate to next screen
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('KYCSelfie', {
          data: {
            ...initialData,
            [side === 'front' ? 'documentFront' : 'documentBack']: 'captured',
            ...(side === 'back' ? { documentFront: 'captured' } : {}),
          },
        });
      }

      setIsCapturing(false);
    }, 800);
  }, [
    isCapturing,
    captureSide,
    captureScale,
    flashOpacity,
    initialData,
    navigation,
  ]);

  const isPassport = initialData.documentType === 'passport';
  const documentLabel =
    DOCUMENT_LABELS[initialData.documentType || 'id_card'] || 'BELGE';
  const sideLabel = captureSide === 'front' ? 'ÖN YÜZ' : 'ARKA YÜZ';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera Placeholder (Dark Background) */}
      <View style={styles.cameraView}>
        {/* Top Overlay */}
        <View style={styles.overlayTop} />

        {/* Middle Section with Frame */}
        <View style={styles.middleSection}>
          {/* Left Overlay */}
          <View style={styles.overlaySide} />

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            {/* Neon Corners */}
            <Animated.View
              style={[styles.corner, styles.cornerTL, cornerGlowStyle]}
            />
            <Animated.View
              style={[styles.corner, styles.cornerTR, cornerGlowStyle]}
            />
            <Animated.View
              style={[styles.corner, styles.cornerBL, cornerGlowStyle]}
            />
            <Animated.View
              style={[styles.corner, styles.cornerBR, cornerGlowStyle]}
            />

            {/* Scanning Line */}
            <Animated.View style={[styles.scanLine, scanLineStyle]}>
              <View style={styles.scanLineGlow} />
            </Animated.View>

            {/* Frame Content Hint */}
            <View style={styles.frameHint}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={48}
                color={`${COLORS.white}30`}
              />
            </View>
          </View>

          {/* Right Overlay */}
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom Overlay */}
        <View style={styles.overlayBottom} />

        {/* Flash Effect */}
        <Animated.View style={[styles.flashOverlay, flashStyle]} />
      </View>

      {/* UI Layer */}
      <View style={[styles.uiLayer, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close"
              size={28}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <View style={styles.progressWrapper}>
            <KYCProgressBar currentStep="upload" variant="simple" />
          </View>
        </View>

        {/* Center Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.documentType}>{documentLabel}</Text>
          <Text style={styles.sideLabel}>{sideLabel}</Text>
        </View>

        {/* Bottom Section */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          {/* Status Card */}
          <GlassCard
            intensity={40}
            tint="dark"
            style={styles.statusCard}
            borderRadius={RADIUS.xl}
            padding={0}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusIconWrapper}>
                <MaterialCommunityIcons
                  name={isCapturing ? 'camera-iris' : 'lightbulb-outline'}
                  size={20}
                  color={isCapturing ? COLORS.secondary : COLORS.primary}
                />
              </View>
              <Text style={styles.statusText}>
                {isCapturing
                  ? 'Belge taranıyor...'
                  : 'Belgeyi çerçevenin içine yerleştir'}
              </Text>
            </View>
          </GlassCard>

          {/* Side Indicator (for non-passport) */}
          {!isPassport && (
            <View style={styles.sideIndicator}>
              <View
                style={[
                  styles.sideDot,
                  captureSide === 'front' && styles.sideDotActive,
                ]}
              />
              <View
                style={[
                  styles.sideDot,
                  captureSide === 'back' && styles.sideDotActive,
                ]}
              />
            </View>
          )}

          {/* Capture Button */}
          <Animated.View style={captureButtonStyle}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isCapturing}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonOuter}>
                <View
                  style={[
                    styles.captureButtonInner,
                    isCapturing && styles.captureButtonCapturing,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={14}
              color={COLORS.text.tertiary}
            />
            <Text style={styles.tipText}>
              Işık yansımasından kaçın, tüm köşeler görünür olsun
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D0F',
  },
  overlayTop: {
    height: (SCREEN_HEIGHT - FRAME_HEIGHT) / 2 - 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  middleSection: {
    flexDirection: 'row',
    height: FRAME_HEIGHT,
  },
  overlaySide: {
    width: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scannerFrame: {
    flex: 1,
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
    borderWidth: 4,
    zIndex: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 10,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: RADIUS.lg,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: RADIUS.lg,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: RADIUS.lg,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: RADIUS.lg,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 5,
  },
  scanLineGlow: {
    flex: 1,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
  },
  frameHint: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
  },
  uiLayer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressWrapper: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingTop: SPACING['3xl'],
  },
  documentType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  sideLabel: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.screenPadding,
  },
  statusCard: {
    alignSelf: 'center',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  statusIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '500',
  },
  sideIndicator: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sideDotActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonOuter: {
    flex: 1,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: COLORS.white,
    padding: 4,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  captureButtonCapturing: {
    backgroundColor: COLORS.secondary,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});

export default withErrorBoundary(KYCDocumentCaptureScreen, {
  fallbackType: 'generic',
  displayName: 'KYCDocumentCaptureScreen',
});
