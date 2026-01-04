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

import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
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
  type AuthPhase,
} from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { supabase } from '@/config/supabase';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface AuthenticationResult {
  status: 'pending' | 'analyzing' | 'verified' | 'rejected' | 'needs_review';
  confidence?: number;
  reasons?: string[];
  suggestions?: string[];
}

interface VerifyProofResponse {
  verified: boolean;
  needsReview: boolean;
  confidence: number;
  locationMatch: boolean;
  dateMatch: boolean;
  sceneValid: boolean;
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
  /** Retry callback */
  onRetry?: () => void;
  /** Test ID */
  testID?: string;
}

// ═══════════════════════════════════════════════════
// CHECKLIST ITEM INTERFACE
// ═══════════════════════════════════════════════════

interface ChecklistItemData {
  id: string;
  label: string;
  checked: boolean;
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export const MomentAuthenticator = memo<MomentAuthenticatorProps>(
  ({
    proofId,
    mediaUrls,
    location,
    expectedMoment,
    onResult,
    onCancel,
    onRequestManualReview,
    onRetry,
    testID,
  }) => {
    const [phase, setPhase] = useState<AuthPhase>('uploading');
    const [result, setResult] = useState<AuthenticationResult | null>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItemData[]>([
      { id: 'upload', label: 'Fotoğraflar yüklendi', checked: false },
      { id: 'location', label: 'Konum kontrol edildi', checked: false },
      { id: 'date', label: 'Tarih doğrulandı', checked: false },
      { id: 'scene', label: 'Sahne analiz edildi', checked: false },
    ]);
    const [showConfetti, setShowConfetti] = useState(false);

    const progress = useSharedValue(0);
    const scanLine = useSharedValue(0);

    // Update checklist item
    const updateChecklist = useCallback((id: string, checked: boolean) => {
      setChecklistItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked } : item)),
      );
    }, []);

    // Simulate progress animation
    const simulateProgress = useCallback(
      async (_from: number, to: number, duration: number) => {
        progress.value = withTiming(to / 100, { duration });
        await delay(duration);
      },
      [progress],
    );

    // Call verification API
    const callVerificationAPI =
      useCallback(async (): Promise<VerifyProofResponse> => {
        const { data, error } = await supabase.functions.invoke(
          'verify-proof',
          {
            body: {
              proofId,
              location,
              momentId: expectedMoment.id,
            },
          },
        );

        if (error) throw error;

        // Transform response to expected format
        const verification = data?.verification || data;
        return {
          verified: verification?.verified ?? false,
          needsReview: verification?.status === 'needs_review',
          confidence: verification?.confidence ?? 0,
          locationMatch:
            (verification?.locationMatch ?? verification?.detected_location)
              ? true
              : false,
          dateMatch: verification?.dateMatch ?? true,
          sceneValid:
            verification?.sceneValid ?? verification?.verified ?? false,
          reasons: verification?.red_flags || verification?.reasons || [],
          suggestions: verification?.suggestions || [],
        };
      }, [proofId, location, expectedMoment.id]);

    // Start authentication flow
    const startAuthentication = useCallback(async () => {
      try {
        // Phase 1: Upload
        setPhase('uploading');
        await simulateProgress(0, 20, 2000);
        updateChecklist('upload', true);

        // Phase 2: Scanning
        setPhase('scanning');
        scanLine.value = withRepeat(
          withTiming(1, {
            duration: CEREMONY_TIMING.scanLineSpeed,
            easing: Easing.linear,
          }),
          3,
          false,
        );
        await simulateProgress(20, 50, 3000);

        // Phase 3: Call AI verification
        setPhase('analyzing');
        let apiResult: VerifyProofResponse;

        try {
          apiResult = await callVerificationAPI();
        } catch {
          // If API fails, reject
          onResult({
            status: 'rejected',
            reasons: ['Bir hata oluştu. Lütfen tekrar deneyin.'],
          });
          return;
        }

        // Update checklist based on result
        updateChecklist('location', apiResult.locationMatch);
        await delay(500);
        updateChecklist('date', apiResult.dateMatch);
        await delay(500);
        updateChecklist('scene', apiResult.sceneValid);

        // Phase 4: Verifying
        setPhase('verifying');
        await simulateProgress(80, 95, 1500);

        // Phase 5: Complete
        setPhase('complete');
        progress.value = withTiming(1, { duration: 500 });

        // Determine final result
        let finalResult: AuthenticationResult;
        if (apiResult.verified) {
          finalResult = {
            status: 'verified',
            confidence: apiResult.confidence,
          };
          setShowConfetti(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (apiResult.needsReview) {
          finalResult = {
            status: 'needs_review',
            reasons: apiResult.reasons,
          };
        } else {
          finalResult = {
            status: 'rejected',
            reasons: apiResult.reasons,
            suggestions: apiResult.suggestions,
          };
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        setResult(finalResult);
        onResult(finalResult);
      } catch {
        const errorResult: AuthenticationResult = {
          status: 'rejected',
          reasons: ['Bir hata oluştu'],
        };
        setResult(errorResult);
        onResult(errorResult);
      }
    }, [
      simulateProgress,
      updateChecklist,
      callVerificationAPI,
      onResult,
      progress,
      scanLine,
    ]);

    // Run authentication on mount
    useEffect(() => {
      let isMounted = true;

      const runAuth = async () => {
        if (isMounted) {
          await startAuthentication();
        }
      };

      runAuth();

      return () => {
        isMounted = false;
      };
    }, [proofId]);

    // Progress bar animated style
    const progressStyle = useAnimatedStyle(() => ({
      width: `${progress.value * 100}%`,
    }));

    // Scan line animated style
    const scanLineStyle = useAnimatedStyle(() => ({
      top: `${scanLine.value * 100}%`,
    }));

    // Handle retry
    const handleRetry = useCallback(() => {
      if (onRetry) {
        onRetry();
      } else if (onCancel) {
        onCancel();
      }
    }, [onRetry, onCancel]);

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
              checklistItems={checklistItems}
              expectedMoment={expectedMoment}
              location={location}
            />
          );

        case 'verifying':
          return <VerifyingView />;

        case 'complete':
          if (result?.status === 'verified') {
            return <SuccessView confidence={result.confidence} />;
          } else if (result?.status === 'rejected') {
            return (
              <RejectionView
                reasons={result.reasons || []}
                suggestions={result.suggestions || []}
                onRetry={handleRetry}
              />
            );
          } else if (result?.status === 'needs_review') {
            return (
              <NeedsReviewView
                reasons={result.reasons || []}
                onRequestManualReview={onRequestManualReview}
              />
            );
          }
          return null;

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
            colors={[...CEREMONY_COLORS.celebration.confetti]}
            fadeOut
            autoStart
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
              testID="cancel-button"
              accessibilityLabel="İptal"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
          <View style={styles.headerContent}>
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
          {/* Spacer for centering */}
          {onCancel && <View style={styles.headerSpacer} />}
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
          <Text style={styles.progressText}>{AUTH_PHASE_PROGRESS[phase]}%</Text>
        </View>

        {/* Phase content */}
        <View style={styles.content}>{renderPhaseContent()}</View>
      </View>
    );
  },
);

MomentAuthenticator.displayName = 'MomentAuthenticator';

// ═══════════════════════════════════════════════════
// SCANNING OVERLAY COMPONENT
// ═══════════════════════════════════════════════════

interface ScanningOverlayProps {
  imageUri: string;
  scanLineStyle: ReturnType<typeof useAnimatedStyle>;
  isScanning: boolean;
}

const ScanningOverlay = memo<ScanningOverlayProps>(
  ({ imageUri, scanLineStyle, isScanning }) => {
    const pulseOpacity = useSharedValue(0.2);

    useEffect(() => {
      if (isScanning) {
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 1000 }),
            withTiming(0.2, { duration: 1000 }),
          ),
          -1,
          true,
        );
      }
      return () => {
        // Reset animation on cleanup
        pulseOpacity.value = 0.2;
      };
    }, [isScanning, pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({
      opacity: pulseOpacity.value,
    }));

    return (
      <View style={styles.scanContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.scanImage}
          contentFit="cover"
          transition={200}
        />

        {/* Pulsing overlay */}
        {isScanning && (
          <Animated.View style={[styles.pulseOverlay, pulseStyle]} />
        )}

        {/* Scanning line */}
        {isScanning && (
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                CEREMONY_COLORS.authenticator.scanning,
                'transparent',
              ]}
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
  },
);

ScanningOverlay.displayName = 'ScanningOverlay';

// ═══════════════════════════════════════════════════
// CORNER BRACKET COMPONENT
// ═══════════════════════════════════════════════════

interface CornerBracketProps {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

const CornerBracket = memo<CornerBracketProps>(({ position }) => {
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
});

CornerBracket.displayName = 'CornerBracket';

// ═══════════════════════════════════════════════════
// ANALYZING VIEW COMPONENT
// ═══════════════════════════════════════════════════

interface AnalyzingViewProps {
  checklistItems: ChecklistItemData[];
  expectedMoment: { id: string; title: string; location?: string };
  location?: { lat: number; lng: number; name: string };
}

const AnalyzingView = memo<AnalyzingViewProps>(
  ({ checklistItems, expectedMoment, location: _location }) => (
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
        {checklistItems.map((item, index) => (
          <ChecklistItem
            key={item.id}
            id={item.id}
            label={item.label}
            checked={item.checked}
            delay={index * CEREMONY_TIMING.checklistItemDelay}
          />
        ))}
      </View>
    </Animated.View>
  ),
);

AnalyzingView.displayName = 'AnalyzingView';

// ═══════════════════════════════════════════════════
// CHECKLIST ITEM COMPONENT
// ═══════════════════════════════════════════════════

interface ChecklistItemProps {
  id: string;
  label: string;
  checked: boolean;
  delay: number;
}

const ChecklistItem = memo<ChecklistItemProps>(
  ({ id: _id, label, checked, delay }) => {
    const opacity = useSharedValue(0);
    const checkScale = useSharedValue(0);

    useEffect(() => {
      opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
      return () => {
        opacity.value = 0;
      };
    }, [delay, opacity]);

    useEffect(() => {
      if (checked) {
        checkScale.value = withSpring(1, { damping: 8 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return () => {
        checkScale.value = 0;
      };
    }, [checked, checkScale]);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateX: interpolate(opacity.value, [0, 1], [20, 0]) }],
    }));

    const checkStyle = useAnimatedStyle(() => ({
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    }));

    return (
      <Animated.View style={[styles.checklistItem, containerStyle]}>
        <Animated.View style={checkStyle}>
          {checked ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={COLORS.success}
            />
          ) : (
            <MaterialCommunityIcons
              name="circle-outline"
              size={20}
              color={COLORS.textMuted}
            />
          )}
        </Animated.View>
        <Text
          style={[
            styles.checklistLabel,
            checked && styles.checklistLabelChecked,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    );
  },
);

ChecklistItem.displayName = 'ChecklistItem';

// ═══════════════════════════════════════════════════
// VERIFYING VIEW COMPONENT
// ═══════════════════════════════════════════════════

const VerifyingView = memo(() => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    );
    return () => {
      pulseScale.value = 1;
    };
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.verifyingContainer}>
      <Animated.View style={pulseStyle}>
        <LinearGradient colors={GRADIENTS.trust} style={styles.verifyingIcon}>
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
});

VerifyingView.displayName = 'VerifyingView';

// ═══════════════════════════════════════════════════
// SUCCESS VIEW COMPONENT
// ═══════════════════════════════════════════════════

interface SuccessViewProps {
  confidence?: number;
}

const SuccessView = memo<SuccessViewProps>(({ confidence }) => {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <Animated.View entering={ZoomIn.springify()} style={styles.resultContainer}>
      <LinearGradient colors={GRADIENTS.gift} style={styles.successIcon}>
        <MaterialCommunityIcons name="check" size={48} color="white" />
      </LinearGradient>

      <Text style={styles.successTitle}>✨ Anınız Onaylandı!</Text>
      <Text style={styles.successSubtitle}>
        Deneyiminiz başarıyla doğrulandı
      </Text>
      {confidence !== undefined && (
        <Text style={styles.confidenceText}>
          Güven: {(confidence * 100).toFixed(0)}%
        </Text>
      )}
    </Animated.View>
  );
});

SuccessView.displayName = 'SuccessView';

// ═══════════════════════════════════════════════════
// REJECTION VIEW COMPONENT
// ═══════════════════════════════════════════════════

interface RejectionViewProps {
  reasons: string[];
  suggestions: string[];
  onRetry: () => void;
}

const RejectionView = memo<RejectionViewProps>(
  ({ reasons, suggestions, onRetry }) => (
    <Animated.View entering={ZoomIn} style={styles.resultContainer}>
      <View style={styles.rejectionIcon}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={CEREMONY_COLORS.authenticator.rejected}
        />
      </View>

      <Text style={styles.rejectionTitle}>Doğrulanamadı</Text>

      {reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          {reasons.map((reason, i) => (
            <Text key={i} style={styles.reasonText}>
              • {reason}
            </Text>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          <Text style={styles.suggestionsTitle}>💡 Öneriler:</Text>
          {suggestions.map((suggestion, i) => (
            <Text key={i} style={styles.suggestionText}>
              {suggestion}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        testID="retry-button"
      >
        <MaterialCommunityIcons name="camera" size={20} color="white" />
        <Text style={styles.retryText}>Tekrar Dene</Text>
      </TouchableOpacity>
    </Animated.View>
  ),
);

RejectionView.displayName = 'RejectionView';

// ═══════════════════════════════════════════════════
// NEEDS REVIEW VIEW COMPONENT
// ═══════════════════════════════════════════════════

interface NeedsReviewViewProps {
  reasons: string[];
  onRequestManualReview?: () => void;
}

const NeedsReviewView = memo<NeedsReviewViewProps>(
  ({ reasons, onRequestManualReview }) => (
    <Animated.View entering={ZoomIn} style={styles.resultContainer}>
      <View style={styles.reviewIcon}>
        <MaterialCommunityIcons
          name="account-clock"
          size={48}
          color={CEREMONY_COLORS.authenticator.needsReview}
        />
      </View>

      <Text style={styles.reviewTitle}>Manuel İnceleme Gerekiyor</Text>
      <Text style={styles.reviewMessage}>24 saat içinde sonuçlanacak</Text>

      {reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          {reasons.map((reason, i) => (
            <Text key={i} style={styles.reviewReasonText}>
              • {reason}
            </Text>
          ))}
        </View>
      )}

      {onRequestManualReview && (
        <TouchableOpacity
          style={styles.manualReviewButton}
          onPress={onRequestManualReview}
          testID="manual-review-button"
        >
          <MaterialCommunityIcons
            name="account-check"
            size={20}
            color="white"
          />
          <Text style={styles.manualReviewText}>Manuel İnceleme İste</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  ),
);

NeedsReviewView.displayName = 'NeedsReviewView';

// ═══════════════════════════════════════════════════
// UTILITY FUNCTION
// ═══════════════════════════════════════════════════

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  cancelButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.borderDefault,
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
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CEREMONY_COLORS.authenticator.scanning,
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
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.surfaceMuted,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },

  // Result
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Success
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  confidenceText: {
    fontSize: 14,
    color: COLORS.success,
    marginTop: SPACING.sm,
  },

  // Rejection
  rejectionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  reasonsContainer: {
    marginTop: SPACING.md,
    alignSelf: 'stretch',
    paddingHorizontal: SPACING.lg,
  },
  reasonText: {
    fontSize: 14,
    color: CEREMONY_COLORS.authenticator.rejected,
    marginVertical: 2,
  },
  suggestionsBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    alignSelf: 'stretch',
    marginHorizontal: SPACING.lg,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Needs Review
  reviewIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  reviewMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  reviewReasonText: {
    fontSize: 14,
    color: CEREMONY_COLORS.authenticator.needsReview,
    marginVertical: 2,
  },
  manualReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CEREMONY_COLORS.authenticator.needsReview,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  manualReviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default MomentAuthenticator;
