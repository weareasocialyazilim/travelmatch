/**
 * ProofCeremonyFlow Component
 *
 * Main orchestrator that combines all ceremony components.
 * Handles the complete flow from intro to celebration.
 *
 * @example
 * ```tsx
 * <ProofCeremonyFlow
 *   gift={gift}
 *   onComplete={handleComplete}
 *   onCancel={handleCancel}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { SunsetClock } from './SunsetClock';
import { MomentAuthenticator, type AuthenticationResult } from './MomentAuthenticator';
import { ThankYouCardCreator } from './ThankYouCardCreator';
import { MemoryCard } from './MemoryCard';
import { SacredMoments } from './SacredMoments';
import {
  CEREMONY_COLORS,
  CEREMONY_STEP_ORDER,
  CEREMONY_STEP_LABELS,
  type CeremonyStep,
} from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';

interface Gift {
  id: string;
  escrowId: string;
  momentId: string;
  momentTitle: string;
  giverName: string;
  giverId: string;
  amount: number;
  currency: string;
  escrowUntil: Date;
  location?: string;
}

interface ProofData {
  id: string;
  photos: string[];
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  description?: string;
}

interface CeremonyResult {
  proofId: string;
  verificationStatus: 'verified' | 'pending_review';
  memoryCardUrl?: string;
  thankYouCardSent: boolean;
}

interface ProofCeremonyFlowProps {
  /** Gift/Escrow information */
  gift: Gift;
  /** Flow complete callback */
  onComplete: (result: CeremonyResult) => void;
  /** Cancel callback */
  onCancel: () => void;
  /** Test ID */
  testID?: string;
}

export const ProofCeremonyFlow: React.FC<ProofCeremonyFlowProps> = ({
  gift,
  onComplete,
  onCancel,
  testID,
}) => {
  const [step, setStep] = useState<CeremonyStep>('intro');
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [authResult, setAuthResult] = useState<AuthenticationResult | null>(null);
  const [thankYouCardUrl, setThankYouCardUrl] = useState<string | null>(null);
  const [memoryCardUrl, setMemoryCardUrl] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentStepIndex = CEREMONY_STEP_ORDER.indexOf(step);

  const handleNext = useCallback((nextStep: CeremonyStep) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(nextStep);
  }, []);

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(CEREMONY_STEP_ORDER[prevIndex]);
    }
  }, [currentStepIndex]);

  const handleCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photos = result.assets.map((asset) => asset.uri);
        setProofData({
          id: `proof_${Date.now()}`,
          photos,
          // In real app, get location from device
          location: undefined,
        });
        handleNext('authenticate');
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleAuthResult = useCallback(
    (result: AuthenticationResult) => {
      setAuthResult(result);
      if (result.status === 'verified') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleNext('thank-you');
      }
    },
    [handleNext]
  );

  const handleThankYouComplete = useCallback(
    (cardUrl: string) => {
      setThankYouCardUrl(cardUrl);
      handleNext('celebrate');
      setShowConfetti(true);
    },
    [handleNext]
  );

  const handleThankYouSkip = useCallback(() => {
    handleNext('celebrate');
    setShowConfetti(true);
  }, [handleNext]);

  const handleCelebrationComplete = useCallback(
    (cardUrl?: string) => {
      if (cardUrl) {
        setMemoryCardUrl(cardUrl);
      }
      onComplete({
        proofId: proofData?.id || '',
        verificationStatus:
          authResult?.status === 'verified' ? 'verified' : 'pending_review',
        memoryCardUrl: cardUrl,
        thankYouCardSent: !!thankYouCardUrl,
      });
    },
    [proofData, authResult, thankYouCardUrl, onComplete]
  );

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <IntroStep
            gift={gift}
            onStart={() => handleNext('capture')}
            onCancel={onCancel}
          />
        );

      case 'capture':
        return (
          <CaptureStep
            momentTitle={gift.momentTitle}
            deadline={gift.escrowUntil}
            onCapture={handleCapture}
            onBack={handleBack}
          />
        );

      case 'authenticate':
        return proofData ? (
          <MomentAuthenticator
            proofId={proofData.id}
            mediaUrls={proofData.photos}
            location={proofData.location}
            expectedMoment={{ id: gift.momentId, title: gift.momentTitle }}
            onResult={handleAuthResult}
            onCancel={() => setStep('capture')}
          />
        ) : null;

      case 'thank-you':
        return proofData ? (
          <ThankYouCardCreator
            recipientName={gift.giverName}
            momentTitle={gift.momentTitle}
            proofPhotos={proofData.photos}
            onComplete={handleThankYouComplete}
            onSkip={handleThankYouSkip}
          />
        ) : null;

      case 'celebrate':
        return proofData ? (
          <CelebrationStep
            gift={gift}
            proofPhotos={proofData.photos}
            onComplete={handleCelebrationComplete}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <StatusBar barStyle="dark-content" />

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          colors={CEREMONY_COLORS.celebration.confetti}
          fadeOut
          autoStart
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

      {/* Header with progress */}
      {step !== 'celebrate' && (
        <View style={styles.header}>
          {/* Progress dots */}
          <View style={styles.progress}>
            {CEREMONY_STEP_ORDER.map((s, index) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  index <= currentStepIndex && styles.progressDotActive,
                  index === currentStepIndex && styles.progressDotCurrent,
                ]}
              />
            ))}
          </View>

          {/* Sunset clock (compact) */}
          <SunsetClock deadline={gift.escrowUntil} size="compact" />
        </View>
      )}

      {/* Step content */}
      <Animated.View
        key={step}
        entering={SlideInRight}
        exiting={SlideOutLeft}
        style={styles.content}
      >
        {renderStep()}
      </Animated.View>
    </SafeAreaView>
  );
};

// Intro Step Component
interface IntroStepProps {
  gift: Gift;
  onStart: () => void;
  onCancel: () => void;
}

const IntroStep: React.FC<IntroStepProps> = ({ gift, onStart, onCancel }) => (
  <ScrollView style={styles.introContainer} contentContainerStyle={styles.introContent}>
    {/* Big Sunset Clock */}
    <View style={styles.introClockContainer}>
      <SunsetClock
        deadline={gift.escrowUntil}
        size="full"
        showTimeText
        enableHaptics
      />
    </View>

    {/* Gift Info */}
    <Animated.View entering={FadeIn.delay(300)} style={styles.giftInfo}>
      <Text style={styles.momentTitle}>{gift.momentTitle}</Text>
      <Text style={styles.giverInfo}>
        <MaterialCommunityIcons name="gift" size={14} color={COLORS.secondary} />
        {' '}{gift.giverName}'dan hediye
      </Text>
      <View style={styles.amountBadge}>
        <Text style={styles.amountText}>
          {gift.currency} {gift.amount}
        </Text>
      </View>
      {gift.location && (
        <View style={styles.locationInfo}>
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color={COLORS.accent}
          />
          <Text style={styles.locationText}>{gift.location}</Text>
        </View>
      )}
    </Animated.View>

    {/* Sacred info */}
    <Animated.View entering={FadeIn.delay(500)} style={styles.sacredInfo}>
      <MaterialCommunityIcons
        name="lock-heart"
        size={24}
        color={CEREMONY_COLORS.sacred.lockIcon}
      />
      <Text style={styles.sacredText}>
        Kanıtınız sadece {gift.giverName} ile paylaşılacak
      </Text>
    </Animated.View>

    {/* CTA */}
    <Animated.View entering={FadeIn.delay(700)} style={styles.introActions}>
      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <LinearGradient
          colors={GRADIENTS.gift}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButtonGradient}
        >
          <MaterialCommunityIcons name="camera" size={24} color={COLORS.white} />
          <Text style={styles.startButtonText}>Anımı Paylaş</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Daha Sonra</Text>
      </TouchableOpacity>
    </Animated.View>
  </ScrollView>
);

// Capture Step Component
interface CaptureStepProps {
  momentTitle: string;
  deadline: Date;
  onCapture: () => void;
  onBack: () => void;
}

const CaptureStep: React.FC<CaptureStepProps> = ({
  momentTitle,
  deadline,
  onCapture,
  onBack,
}) => (
  <View style={styles.captureContainer}>
    <View style={styles.captureHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.captureTitle}>Fotoğraf Çek</Text>
      <View style={styles.backButton} />
    </View>

    <View style={styles.captureContent}>
      <View style={styles.cameraPreview}>
        <MaterialCommunityIcons
          name="camera"
          size={64}
          color={COLORS.textMuted}
        />
        <Text style={styles.previewText}>Kamera burada açılacak</Text>
      </View>

      <View style={styles.captureInfo}>
        <Text style={styles.captureInfoTitle}>{momentTitle}</Text>
        <Text style={styles.captureInfoText}>
          Deneyimini kanıtlayan bir fotoğraf çek. En fazla 5 fotoğraf
          yükleyebilirsin.
        </Text>
      </View>

      <View style={styles.captureTips}>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color={COLORS.success}
          />
          <Text style={styles.tipText}>Konum bilgisi otomatik eklenir</Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color={COLORS.success}
          />
          <Text style={styles.tipText}>AI ile otomatik doğrulama</Text>
        </View>
      </View>
    </View>

    <TouchableOpacity style={styles.captureButton} onPress={onCapture}>
      <LinearGradient
        colors={GRADIENTS.gift}
        style={styles.captureButtonGradient}
      >
        <MaterialCommunityIcons name="camera" size={32} color={COLORS.white} />
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// Celebration Step Component
interface CelebrationStepProps {
  gift: Gift;
  proofPhotos: string[];
  onComplete: (memoryCardUrl?: string) => void;
}

const CelebrationStep: React.FC<CelebrationStepProps> = ({
  gift,
  proofPhotos,
  onComplete,
}) => {
  const [showCard, setShowCard] = useState(false);

  React.useEffect(() => {
    // Show card after confetti
    const timer = setTimeout(() => setShowCard(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView
      style={styles.celebrationContainer}
      contentContainerStyle={styles.celebrationContent}
    >
      {/* Success message */}
      <Animated.View entering={ZoomIn} style={styles.successIcon}>
        <LinearGradient colors={GRADIENTS.trust} style={styles.successIconCircle}>
          <MaterialCommunityIcons name="check" size={48} color={COLORS.white} />
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(500)}>
        <Text style={styles.successTitle}>Harika! 🎉</Text>
        <Text style={styles.successSubtitle}>
          Deneyimin onaylandı ve {gift.giverName}'a haber verildi!
        </Text>
      </Animated.View>

      {/* Transfer info */}
      <Animated.View entering={FadeIn.delay(800)} style={styles.transferInfo}>
        <MaterialCommunityIcons
          name="bank-transfer"
          size={24}
          color={COLORS.success}
        />
        <Text style={styles.transferText}>
          {gift.currency} {gift.amount} hesabına aktarılıyor
        </Text>
      </Animated.View>

      {/* Memory card */}
      {showCard && (
        <Animated.View entering={FadeIn}>
          <SacredMoments showShareOption onShare={() => {}}>
            <MemoryCard
              gift={gift}
              proofPhotos={proofPhotos}
              verifiedAt={new Date()}
              onShare={(url) => onComplete(url)}
              onSave={(url) => onComplete(url)}
            />
          </SacredMoments>
        </Animated.View>
      )}

      {/* Complete button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => onComplete()}
      >
        <Text style={styles.completeButtonText}>Tamam</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progress: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressDotCurrent: {
    width: 24,
  },
  content: {
    flex: 1,
  },

  // Intro
  introContainer: {
    flex: 1,
  },
  introContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  introClockContainer: {
    marginVertical: SPACING.xl,
  },
  giftInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  momentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  giverInfo: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  amountBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sacredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  sacredText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  introActions: {
    width: '100%',
    gap: SPACING.md,
  },
  startButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Capture
  captureContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  captureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  captureContent: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  captureInfo: {
    marginBottom: SPACING.md,
  },
  captureInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  captureInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  captureTips: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  captureButton: {
    alignSelf: 'center',
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Celebration
  celebrationContainer: {
    flex: 1,
  },
  celebrationContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successIcon: {
    marginVertical: SPACING.xl,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  transferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  transferText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
  completeButton: {
    backgroundColor: COLORS.surfaceMuted,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    marginTop: SPACING.lg,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default ProofCeremonyFlow;
