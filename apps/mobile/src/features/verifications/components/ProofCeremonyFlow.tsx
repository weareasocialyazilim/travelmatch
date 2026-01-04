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

import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { SunsetClock } from './SunsetClock';
import {
  MomentAuthenticator,
  type AuthenticationResult,
} from './MomentAuthenticator';
import { ThankYouCardCreator } from './ThankYouCardCreator';
import { MemoryCard } from './MemoryCard';
import { SacredMoments } from './SacredMoments';
import { CeremonyProgress } from './CeremonyProgress';
import {
  CEREMONY_COLORS,
  CEREMONY_STEP_ORDER,
  type CeremonyStep,
} from '@/constants/ceremony';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { logger } from '@/utils/logger';
import { useLowPowerMode } from '@/hooks/useLowPowerMode';

// Skeleton loader with shimmer effect for premium loading states
const SkeletonLoader = memo<{ size?: 'small' | 'large' }>(
  ({ size = 'large' }) => {
    const shimmerValue = useSharedValue(0);

    useEffect(() => {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1,
        false,
      );
    }, [shimmerValue]);

    const shimmerStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmerValue.value,
        [0, 1],
        [-100, 100],
        Extrapolation.CLAMP,
      );
      return {
        transform: [{ translateX }],
      };
    });

    const containerSize = size === 'large' ? 100 : 24;
    const iconSize = size === 'large' ? 40 : 16;

    return (
      <View
        style={[
          skeletonStyles.container,
          { width: containerSize, height: containerSize },
        ]}
      >
        <Animated.View style={[skeletonStyles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={skeletonStyles.gradient}
          />
        </Animated.View>
        <MaterialCommunityIcons
          name="camera"
          size={iconSize}
          color={COLORS.textSecondary}
          style={skeletonStyles.icon}
        />
      </View>
    );
  },
);

SkeletonLoader.displayName = 'SkeletonLoader';

const skeletonStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: 100,
    height: '100%',
  },
  icon: {
    opacity: 0.5,
  },
});

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

export const ProofCeremonyFlow = memo<ProofCeremonyFlowProps>(
  ({ gift, onComplete, onCancel, testID }) => {
    const [step, setStep] = useState<CeremonyStep>('intro');
    const [proofData, setProofData] = useState<ProofData | null>(null);
    const [authResult, setAuthResult] = useState<AuthenticationResult | null>(
      null,
    );
    const [thankYouCardUrl, setThankYouCardUrl] = useState<string | null>(null);
    const [_memoryCardUrl, setMemoryCardUrl] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Low Power Mode integration for animation optimization
    const {
      isLowPowerMode,
      animationConfig,
      shouldOfferLowPowerMode,
      enableLowPowerMode,
      recordPerformanceSample,
    } = useLowPowerMode();

    // Step transition animation values
    const stepOpacity = useSharedValue(1);
    const stepTranslateX = useSharedValue(0);

    const currentStepIndex = CEREMONY_STEP_ORDER.indexOf(step);

    // Track mount performance for low power mode detection
    useEffect(() => {
      const mountTime = performance.now();
      return () => {
        const duration = performance.now() - mountTime;
        recordPerformanceSample(duration);
      };
    }, [recordPerformanceSample]);

    // Animated step transition (respects low power mode)
    const transitionToStep = useCallback(
      (newStep: CeremonyStep) => {
        // Only trigger haptics if enabled in animation config
        if (animationConfig.enableHaptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Skip animations in low power mode
        if (isLowPowerMode && !animationConfig.enableAnimations) {
          setStep(newStep);
          return;
        }

        const duration = animationConfig.transitionDuration;

        // Fade out current
        stepOpacity.value = withTiming(0, { duration: duration * 0.67 });
        stepTranslateX.value = withTiming(-50, { duration: duration * 0.67 });

        setTimeout(() => {
          setStep(newStep);
          // Fade in new
          stepTranslateX.value = 50;
          stepOpacity.value = withTiming(1, { duration });
          stepTranslateX.value = withTiming(0, { duration });
        }, duration * 0.67);
      },
      [stepOpacity, stepTranslateX, isLowPowerMode, animationConfig],
    );

    const stepAnimatedStyle = useAnimatedStyle(() => ({
      opacity: stepOpacity.value,
      transform: [{ translateX: stepTranslateX.value }],
    }));

    const handleNext = useCallback(
      (nextStep: CeremonyStep) => {
        transitionToStep(nextStep);
      },
      [transitionToStep],
    );

    const handleBack = useCallback(() => {
      const prevIndex = currentStepIndex - 1;
      if (prevIndex >= 0) {
        transitionToStep(CEREMONY_STEP_ORDER[prevIndex]);
      }
    }, [currentStepIndex, transitionToStep]);

    const handleAuthResult = useCallback(
      (result: AuthenticationResult) => {
        setAuthResult(result);
        if (result.status === 'verified') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleNext('thank-you');
        }
      },
      [handleNext],
    );

    const handleThankYouComplete = useCallback(
      (cardUrl: string) => {
        setThankYouCardUrl(cardUrl);
        handleNext('celebrate');
        setShowConfetti(true);
      },
      [handleNext],
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
      [proofData, authResult, thankYouCardUrl, onComplete],
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
              onCapture={(data) => {
                setProofData(data);
                transitionToStep('authenticate');
              }}
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
              authResult={authResult}
              thankYouCardUrl={thankYouCardUrl}
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

        {/* Low Power Mode Prompt */}
        {shouldOfferLowPowerMode && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.lowPowerPrompt}
          >
            <Text style={styles.lowPowerText}>
              Yavaş performans algılandı. Düşük güç modunu etkinleştirmek ister
              misiniz?
            </Text>
            <TouchableOpacity
              onPress={enableLowPowerMode}
              style={styles.lowPowerButton}
            >
              <Text style={styles.lowPowerButtonText}>Etkinleştir</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Confetti - disabled in low power mode */}
        {showConfetti && animationConfig.enableParticles && (
          <ConfettiCannon
            count={isLowPowerMode ? 50 : 200}
            origin={{ x: -10, y: 0 }}
            colors={[...CEREMONY_COLORS.celebration.confetti]}
            fadeOut
            autoStart
            onAnimationEnd={() => setShowConfetti(false)}
          />
        )}

        {/* Progress indicator - always visible except celebrate */}
        {step !== 'celebrate' && <CeremonyProgress currentStep={step} />}

        {/* Compact Sunset clock - visible on intro and capture */}
        {(step === 'intro' || step === 'capture') && (
          <View style={styles.clockContainer}>
            <SunsetClock
              deadline={gift.escrowUntil}
              size="compact"
              enableHaptics={animationConfig.enableHaptics}
            />
          </View>
        )}

        {/* Step content with animation */}
        <Animated.View style={[styles.content, stepAnimatedStyle]}>
          {renderStep()}
        </Animated.View>
      </SafeAreaView>
    );
  },
);

ProofCeremonyFlow.displayName = 'ProofCeremonyFlow';

// Intro Step Component - memoized for performance
interface IntroStepProps {
  gift: Gift;
  onStart: () => void;
  onCancel: () => void;
}

const IntroStep = memo<IntroStepProps>(({ gift, onStart, onCancel }) => (
  <ScrollView
    style={styles.introContainer}
    contentContainerStyle={styles.introContent}
  >
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
        <MaterialCommunityIcons
          name="gift"
          size={14}
          color={COLORS.secondary}
        />{' '}
        {gift.giverName}'dan hediye
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
        name="shield-lock"
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
          <MaterialCommunityIcons
            name="camera"
            size={24}
            color={COLORS.white}
          />
          <Text style={styles.startButtonText}>Anımı Paylaş</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Daha Sonra</Text>
      </TouchableOpacity>
    </Animated.View>
  </ScrollView>
));

IntroStep.displayName = 'IntroStep';

// Capture Step Component - memoized for performance
interface CaptureStepProps {
  momentTitle: string;
  deadline: Date;
  onCapture: (data: ProofData) => void;
  onBack: () => void;
}

const CaptureStep = memo<CaptureStepProps>(
  ({ momentTitle, deadline: _deadline, onCapture, onBack }) => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [location, setLocation] = useState<ProofData['location'] | null>(
      null,
    );
    const [isCapturing, setIsCapturing] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const capturePhoto = async () => {
      setIsCapturing(true);
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
          setPhotos((prev) => [...prev, result.assets[0].uri]);
          // MASTER UX: Heavy haptic feedback when capturing - "Sacred Moment" feel
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } catch (error) {
        logger.error('Camera error:', error);
      } finally {
        setIsCapturing(false);
      }
    };

    const removePhoto = (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const getLocation = async () => {
      setIsGettingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Konum İzni', 'Konum izni verilmedi');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          name:
            `${address?.city || ''}, ${address?.country || ''}`.trim() ||
            'Konum alındı',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('Location error:', error);
        Alert.alert('Hata', 'Konum alınamadı');
      } finally {
        setIsGettingLocation(false);
      }
    };

    const handleSubmit = async () => {
      if (photos.length === 0) {
        Alert.alert('Fotoğraf Gerekli', 'En az bir fotoğraf ekleyin');
        return;
      }

      // MASTER UX: Confirm submission with medium haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const proofId = `proof_${Date.now()}`;

      onCapture({
        id: proofId,
        photos,
        location: location || undefined,
      });
    };

    return (
      <ScrollView
        style={styles.captureContainer}
        contentContainerStyle={styles.captureScrollContent}
      >
        {/* Header */}
        <View style={styles.captureHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.captureTitle}>Anınızı Yakalayın</Text>
          <View style={styles.backButton} />
        </View>

        {/* Moment info */}
        <Text style={styles.momentReminder}>{momentTitle}</Text>

        {/* Photo grid */}
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image
                source={{ uri: photo }}
                style={styles.photoImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => removePhoto(index)}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color={COLORS.error}
                />
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < 3 && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={capturePhoto}
              disabled={isCapturing}
              accessibilityLabel={
                photos.length === 0 ? 'Fotoğraf çek' : 'Fotoğraf ekle'
              }
              accessibilityRole="button"
            >
              {isCapturing ? (
                <SkeletonLoader size="large" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={32}
                    color={COLORS.primary}
                    accessibilityLabel="Kamera ikonu"
                  />
                  <Text style={styles.addPhotoText}>
                    {photos.length === 0 ? 'Fotoğraf Çek' : 'Ekle'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Photo requirements */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>📸 İpuçları</Text>
          <Text style={styles.requirementItem}>
            • Deneyimi açıkça gösteren fotoğraf
          </Text>
          <Text style={styles.requirementItem}>
            • Konum/mekan görünür olmalı
          </Text>
          <Text style={styles.requirementItem}>
            • Galeri fotoğrafı kabul edilmez
          </Text>
        </View>

        {/* Location */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getLocation}
          disabled={isGettingLocation}
          accessibilityLabel={
            location ? `Konum: ${location.name}` : 'Konum ekle'
          }
          accessibilityRole="button"
        >
          {isGettingLocation ? (
            <SkeletonLoader size="small" />
          ) : (
            <MaterialCommunityIcons
              name={location ? 'map-marker-check' : 'map-marker-plus'}
              size={24}
              color={location ? COLORS.success : COLORS.textSecondary}
              accessibilityLabel={location ? 'Konum eklendi' : 'Konum ekle'}
            />
          )}
          <Text style={[styles.locationText, location && styles.locationSet]}>
            {location ? location.name : 'Konum Ekle (Önerilen)'}
          </Text>
        </TouchableOpacity>

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={photos.length === 0}
          style={styles.submitButton}
        >
          <LinearGradient
            colors={photos.length > 0 ? GRADIENTS.gift : ['#D1D5DB', '#9CA3AF']}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.submitText}>Doğrulamaya Gönder</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={COLORS.white}
            />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
  },
);

CaptureStep.displayName = 'CaptureStep';

// Celebration Step Component - memoized for performance
interface CelebrationStepProps {
  gift: Gift;
  proofPhotos: string[];
  authResult: AuthenticationResult | null;
  thankYouCardUrl: string | null;
  onComplete: (memoryCardUrl?: string) => void;
}

const CelebrationStep = memo<CelebrationStepProps>(
  ({ gift, proofPhotos, authResult, thankYouCardUrl, onComplete }) => {
    const [showCard, setShowCard] = useState(false);
    const scaleAnim = useSharedValue(0);

    const isPendingReview = authResult?.status === 'needs_review';

    React.useEffect(() => {
      // Celebration haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Scale in animation
      scaleAnim.value = withSpring(1, { damping: 8, stiffness: 100 });

      // Show card after confetti
      const timer = setTimeout(() => setShowCard(true), 1500);
      return () => {
        clearTimeout(timer);
        scaleAnim.value = 0;
      };
    }, []);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    return (
      <ScrollView
        style={styles.celebrationContainer}
        contentContainerStyle={styles.celebrationContent}
      >
        {/* Success icon */}
        <Animated.View style={[styles.successIcon, iconAnimatedStyle]}>
          <LinearGradient
            colors={isPendingReview ? GRADIENTS.trust : GRADIENTS.gift}
            style={styles.successIconCircle}
          >
            <MaterialCommunityIcons
              name={isPendingReview ? 'clock-check-outline' : 'check'}
              size={56}
              color={COLORS.white}
            />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.delay(500)}>
          <Text style={styles.successTitle}>
            {isPendingReview ? 'İncelemeye Alındı!' : 'Harika! 🎉'}
          </Text>
          <Text style={styles.successSubtitle}>
            {isPendingReview
              ? 'Kanıtınız 24 saat içinde incelenecek'
              : `Deneyimin onaylandı ve ${gift.giverName}'a haber verildi!`}
          </Text>
        </Animated.View>

        {/* Money transfer info - only show if not pending review */}
        {!isPendingReview && (
          <Animated.View
            entering={FadeIn.delay(800)}
            style={styles.transferInfo}
          >
            <MaterialCommunityIcons
              name="bank-transfer"
              size={24}
              color={COLORS.success}
            />
            <View style={styles.transferTextContainer}>
              <Text style={styles.transferAmount}>
                {gift.currency} {gift.amount.toLocaleString()}
              </Text>
              <Text style={styles.transferStatus}>Hesabına aktarılıyor</Text>
            </View>
          </Animated.View>
        )}

        {/* Thank you card sent confirmation */}
        {thankYouCardUrl && (
          <Animated.View
            entering={FadeIn.delay(1000)}
            style={styles.thankYouSent}
          >
            <MaterialCommunityIcons
              name="card-account-mail"
              size={20}
              color={COLORS.secondary}
            />
            <Text style={styles.thankYouSentText}>
              Teşekkür kartınız {gift.giverName}'a gönderildi
            </Text>
          </Animated.View>
        )}

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
  },
);

CelebrationStep.displayName = 'CelebrationStep';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  content: {
    flex: 1,
  },

  // Low Power Mode Prompt
  lowPowerPrompt: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.warningMuted,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lowPowerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  lowPowerButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  lowPowerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
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
  transferTextContainer: {
    flex: 1,
  },
  transferAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  transferStatus: {
    fontSize: 12,
    color: COLORS.success,
    opacity: 0.8,
  },
  thankYouSent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  thankYouSentText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
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
    color: COLORS.textPrimary,
  },

  // Clock container
  clockContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // New Capture styles
  captureScrollContent: {
    paddingBottom: SPACING.xl,
  },
  momentReminder: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryMuted,
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: SPACING.xxs,
  },
  requirementsBox: {
    backgroundColor: COLORS.surfaceMuted,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  requirementItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxs,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  locationSet: {
    color: COLORS.success,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProofCeremonyFlow;
