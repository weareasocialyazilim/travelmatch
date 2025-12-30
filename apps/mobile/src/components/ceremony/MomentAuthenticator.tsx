/**
 * MomentAuthenticator Component
 *
 * UX wrapper for the ML verification service.
 * Provides cinematic experience from proof upload to verification result.
 *
 * @example
 * ```tsx
 * <MomentAuthenticator
 *   proofId={proofData.id}
 *   mediaUrls={proofData.photos}
 *   location={proofData.location}
 *   expectedMoment={{ id: gift.momentId, title: gift.momentTitle }}
 *   onResult={handleVerificationResult}
 * />
 * ```
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_COLORS,
  CEREMONY_TIMING,
  CEREMONY_A11Y,
  AUTH_PHASE_PROGRESS,
  AUTH_PHASE_MESSAGES,
  AUTH_CHECKLIST_ITEMS,
  type AuthPhase,
} from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

export interface AuthenticationResult {
  status: 'pending' | 'analyzing' | 'verified' | 'rejected' | 'needs_review';
  confidence?: number;
  reasons?: string[];
  suggestions?: string[];
}

interface MomentAuthenticatorProps {
  /** Proof ID */
  proofId: string;
  /** Uploaded media URLs */
  mediaUrls: string[];
  /** Location info */
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  /** Expected moment */
  expectedMoment: {
    id: string;
    title: string;
    location?: string;
  };
  /** Result callback */
  onResult: (result: AuthenticationResult) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Manual review request */
  onRequestManualReview?: () => void;
  /** Test ID */
  testID?: string;
}

export const MomentAuthenticator: React.FC<MomentAuthenticatorProps> = ({
  proofId,
  mediaUrls,
  location,
  expectedMoment,
  onResult,
  onCancel,
  onRequestManualReview,
  testID,
}) => {
  const [phase, setPhase] = useState<AuthPhase>('uploading');
  const [result, setResult] = useState<AuthenticationResult | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = useSharedValue(0);
  const scanLine = useSharedValue(0);

  // Simulate authentication process
  useEffect(() => {
    const runAuthentication = async () => {
      // Phase 1: Uploading
      setPhase('uploading');
      progress.value = withTiming(AUTH_PHASE_PROGRESS.uploading / 100, {
        duration: 1000,
      });
      await delay(1200);

      // Phase 2: Scanning
      setPhase('scanning');
      progress.value = withTiming(AUTH_PHASE_PROGRESS.scanning / 100, {
        duration: 800,
      });

      // Start scan animation
      scanLine.value = withRepeat(
        withTiming(1, { duration: CEREMONY_TIMING.scanLineSpeed, easing: Easing.linear }),
        3,
        false
      );
      await delay(2500);

      // Phase 3: Analyzing
      setPhase('analyzing');
      progress.value = withTiming(AUTH_PHASE_PROGRESS.analyzing / 100, {
        duration: 1000,
      });

      // Checklist animation
      for (const item of AUTH_CHECKLIST_ITEMS) {
        await delay(CEREMONY_TIMING.checklistItemDelay);
        setCheckedItems((prev) => [...prev, item.id]);
      }
      await delay(500);

      // Phase 4: Verifying
      setPhase('verifying');
      progress.value = withTiming(AUTH_PHASE_PROGRESS.verifying / 100, {
        duration: 800,
      });
      await delay(1000);

      // Phase 5: Complete - simulate result
      setPhase('complete');
      progress.value = withTiming(1, { duration: 500 });

      // Simulate successful verification (in real app, this comes from API)
      const mockResult: AuthenticationResult = {
        status: 'verified',
        confidence: 0.92,
      };

      setResult(mockResult);

      if (mockResult.status === 'verified') {
        setShowConfetti(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onResult(mockResult);
    };

    runAuthentication();
  }, [proofId]);

  // Progress bar animated style
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Scan line animated style
  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 100}%`,
  }));

  const renderPhaseContent = () => {
    switch (phase) {
      case 'uploading':
      case 'scanning':
        return (
          <ScanningOverlay
            imageUri={mediaUrls[0]}
            scanLineStyle={scanLineStyle}
            isScanning={phase === 'scanning'}
          />
        );

      case 'analyzing':
        return (
          <AnalyzingView
            checkedItems={checkedItems}
            expectedMoment={expectedMoment}
            location={location}
          />
        );

      case 'verifying':
        return <VerifyingView />;

      case 'complete':
        return (
          <ResultView
            result={result}
            onRequestManualReview={onRequestManualReview}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityLabel={CEREMONY_A11Y.labels.authenticator}
    >
      {/* Confetti on success */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: -10, y: 0 }}
          colors={CEREMONY_COLORS.celebration.confetti}
          fadeOut
          autoStart
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={
            phase === 'complete' && result?.status === 'verified'
              ? 'shield-check'
              : 'shield-search'
          }
          size={32}
          color={
            phase === 'complete' && result?.status === 'verified'
              ? COLORS.success
              : COLORS.primary
          }
        />
        <Text style={styles.phaseTitle}>{AUTH_PHASE_MESSAGES[phase]}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
        <Text style={styles.progressText}>
          {AUTH_PHASE_PROGRESS[phase]}%
        </Text>
      </View>

      {/* Phase content */}
      <View style={styles.content}>{renderPhaseContent()}</View>
    </View>
  );
};

// Scanning Overlay Component
const ScanningOverlay: React.FC<{
  imageUri: string;
  scanLineStyle: any;
  isScanning: boolean;
}> = ({ imageUri, scanLineStyle, isScanning }) => (
  <View style={styles.scanContainer}>
    <Image source={{ uri: imageUri }} style={styles.scanImage} />

    {/* Scanning line */}
    {isScanning && (
      <Animated.View style={[styles.scanLine, scanLineStyle]}>
        <LinearGradient
          colors={['transparent', CEREMONY_COLORS.authenticator.scanning, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanLineGradient}
        />
      </Animated.View>
    )}

    {/* Corner brackets */}
    <View style={styles.cornerBrackets}>
      <CornerBracket position="topLeft" />
      <CornerBracket position="topRight" />
      <CornerBracket position="bottomLeft" />
      <CornerBracket position="bottomRight" />
    </View>

    {/* Scanning indicator */}
    {isScanning && (
      <View style={styles.scanIndicator}>
        <MaterialCommunityIcons
          name="qrcode-scan"
          size={24}
          color={CEREMONY_COLORS.authenticator.scanning}
        />
        <Text style={styles.scanText}>Taranıyor...</Text>
      </View>
    )}
  </View>
);

// Corner Bracket Component
const CornerBracket: React.FC<{
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}> = ({ position }) => {
  const positionStyles = {
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
    bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
    bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
  };

  return (
    <View style={[styles.bracket, positionStyles[position]]}>
      <View style={styles.bracketH} />
      <View style={styles.bracketV} />
    </View>
  );
};

// Analyzing View Component
const AnalyzingView: React.FC<{
  checkedItems: string[];
  expectedMoment: { id: string; title: string; location?: string };
  location?: { lat: number; lng: number; name: string };
}> = ({ checkedItems, expectedMoment, location }) => (
  <Animated.View entering={FadeIn} style={styles.analyzingContainer}>
    {/* Moment info */}
    <View style={styles.momentInfo}>
      <Text style={styles.momentLabel}>Beklenen Deneyim:</Text>
      <Text style={styles.momentTitle}>{expectedMoment.title}</Text>
      {expectedMoment.location && (
        <Text style={styles.momentLocation}>{expectedMoment.location}</Text>
      )}
    </View>

    {/* Checklist */}
    <View style={styles.checklist}>
      {AUTH_CHECKLIST_ITEMS.map((item, index) => (
        <ChecklistItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          checked={checkedItems.includes(item.id)}
          delay={index * CEREMONY_TIMING.checklistItemDelay}
        />
      ))}
    </View>
  </Animated.View>
);

// Checklist Item Component
const ChecklistItem: React.FC<{
  label: string;
  icon: string;
  checked: boolean;
  delay: number;
}> = ({ label, icon, checked, delay }) => {
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (checked) {
      checkScale.value = withDelay(100, withSpring(1, { damping: 12 }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [checked]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(delay)}
      style={styles.checklistItem}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={checked ? COLORS.success : COLORS.textMuted}
      />
      <Text
        style={[styles.checklistLabel, checked && styles.checklistLabelChecked]}
      >
        {label}
      </Text>
      <Animated.View style={checkStyle}>
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color={COLORS.success}
        />
      </Animated.View>
    </Animated.View>
  );
};

// Verifying View Component
const VerifyingView: React.FC = () => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.verifyingContainer}>
      <Animated.View style={pulseStyle}>
        <LinearGradient
          colors={GRADIENTS.trust}
          style={styles.verifyingIcon}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={48}
            color={COLORS.white}
          />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.verifyingText}>Son doğrulama yapılıyor...</Text>
    </View>
  );
};

// Result View Component
const ResultView: React.FC<{
  result: AuthenticationResult | null;
  onRequestManualReview?: () => void;
}> = ({ result, onRequestManualReview }) => {
  if (!result) return null;

  const isSuccess = result.status === 'verified';
  const needsReview = result.status === 'needs_review';
  const isRejected = result.status === 'rejected';

  return (
    <Animated.View entering={ZoomIn} style={styles.resultContainer}>
      {/* Success */}
      {isSuccess && (
        <>
          <LinearGradient
            colors={GRADIENTS.trust}
            style={styles.resultIconSuccess}
          >
            <MaterialCommunityIcons
              name="check"
              size={48}
              color={COLORS.white}
            />
          </LinearGradient>
          <Text style={styles.resultTitle}>Anınız Onaylandı!</Text>
          {result.confidence && (
            <Text style={styles.resultConfidence}>
              Güven: {(result.confidence * 100).toFixed(0)}%
            </Text>
          )}
        </>
      )}

      {/* Needs Review */}
      {needsReview && (
        <>
          <View style={styles.resultIconReview}>
            <MaterialCommunityIcons
              name="account-clock"
              size={48}
              color={CEREMONY_COLORS.authenticator.needsReview}
            />
          </View>
          <Text style={styles.resultTitle}>Manuel İnceleme Gerekiyor</Text>
          <Text style={styles.resultMessage}>
            24 saat içinde sonuçlanacak
          </Text>
        </>
      )}

      {/* Rejected */}
      {isRejected && (
        <>
          <View style={styles.resultIconRejected}>
            <MaterialCommunityIcons
              name="close"
              size={48}
              color={CEREMONY_COLORS.authenticator.rejected}
            />
          </View>
          <Text style={styles.resultTitle}>Doğrulanamadı</Text>
          {result.suggestions && result.suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {result.suggestions.map((suggestion, i) => (
                <Text key={i} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
};

// Utility function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },

  // Scanning
  scanContainer: {
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  scanImage: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
  },
  scanLineGradient: {
    flex: 1,
  },
  cornerBrackets: {
    ...StyleSheet.absoluteFillObject,
  },
  bracket: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  bracketH: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 3,
    backgroundColor: CEREMONY_COLORS.authenticator.scanning,
  },
  bracketV: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: 30,
    backgroundColor: CEREMONY_COLORS.authenticator.scanning,
  },
  scanIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  scanText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },

  // Analyzing
  analyzingContainer: {
    flex: 1,
  },
  momentInfo: {
    backgroundColor: COLORS.surfaceMuted,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  momentLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xxs,
  },
  momentLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  checklist: {
    gap: SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  checklistLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  checklistLabelChecked: {
    color: COLORS.text,
    fontWeight: '500',
  },

  // Verifying
  verifyingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },

  // Result
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconSuccess: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconReview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconRejected: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  resultConfidence: {
    fontSize: 14,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  suggestions: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.error,
    marginVertical: 2,
  },
});

export default MomentAuthenticator;
