// KYC Review Screen - AI-Powered Identity Verification
// Trust Garden'ın giriş kapısı - Güven puanının ana kaynağı
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { HapticManager } from '@/services/HapticManager';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { GlassCard } from '@/components/ui/GlassCard';
import { DOCUMENT_OPTIONS } from './constants';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { kycStyles } from './styles';
import { useKycAuthGuard } from './useKycAuthGuard';
import type { VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// AI Analysis States
type AnalysisState = 'idle' | 'analyzing' | 'success' | 'error';

// AI Analysis Progress Component
interface AIAnalysisOverlayProps {
  isVisible: boolean;
  progress: number;
  currentStep: string;
}

const AIAnalysisOverlay: React.FC<AIAnalysisOverlayProps> = ({
  isVisible,
  progress,
  currentStep,
}) => {
  const pulseAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Pulse animation
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      // Rotation animation
      rotateAnim.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [isVisible, pulseAnim, rotateAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulseAnim.value, [0, 1], [1, 1.1]) }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[kycStyles.aiOverlay]}
    >
      <GlassCard intensity={60} tint="dark" style={kycStyles.aiCard}>
        {/* Animated AI Icon */}
        <Animated.View style={[kycStyles.aiIconContainer, pulseStyle]}>
          <Animated.View style={rotateStyle}>
            <MaterialCommunityIcons
              name="brain"
              size={48}
              color={COLORS.secondary}
            />
          </Animated.View>
        </Animated.View>

        {/* Status Text */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={kycStyles.aiTitle}
        >
          AI Kimliğinizi Analiz Ediyor...
        </Animated.Text>

        <Text style={kycStyles.aiSubtitle}>{currentStep}</Text>

        {/* Progress Bar */}
        <View style={kycStyles.aiProgressContainer}>
          <View style={kycStyles.aiProgressTrack}>
            <Animated.View
              style={[kycStyles.aiProgressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={kycStyles.aiProgressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Trust Garden Integration */}
        <View style={kycStyles.trustGardenHint}>
          <Ionicons name="leaf" size={16} color={COLORS.status.success} />
          <Text style={kycStyles.trustGardenText}>
            Doğrulama tamamlandığında +50 Güven Puanı kazanacaksınız
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

type RouteParams = {
  KYCReview: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCPending: undefined;
  KYCDocumentType: { data: VerificationData };
  KYCDocumentCapture: { data: VerificationData };
  KYCSelfie: { data: VerificationData };
}>;

const KYCReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCReview'>>();
  const { data } = route.params;
  const { showToast } = useToast();
  useKycAuthGuard();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [_analysisProgress, setAnalysisProgress] = useState(0);
  const [_analysisStep, setAnalysisStep] = useState('');

  // AI Analysis simulation with real edge function call
  const runAIAnalysis = useCallback(async () => {
    const steps = [
      { progress: 20, text: 'Belge okunabilirliği kontrol ediliyor...' },
      { progress: 40, text: 'Yüz eşleştirmesi yapılıyor...' },
      { progress: 60, text: 'Dolandırıcılık kontrolleri...' },
      { progress: 80, text: 'Güvenlik damgası oluşturuluyor...' },
      { progress: 100, text: 'Analiz tamamlandı!' },
    ];

    setAnalysisState('analyzing');

    for (const step of steps) {
      setAnalysisProgress(step.progress);
      setAnalysisStep(step.text);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Call the actual verify-kyc edge function
    try {
      const { data: _result, error } = await supabase.functions.invoke(
        'verify-kyc',
        {
          body: {
            documentType: data.documentType,
            documentFront: data.documentFront,
            documentBack: data.documentBack,
            selfie: data.selfie,
            personalInfo: {
              fullName: data.fullName,
              dateOfBirth: data.dateOfBirth,
              country: data.country,
            },
          },
        },
      );

      if (error) throw error;

      HapticManager.kycVerified();
      setAnalysisState('success');

      // Navigate after brief success state
      setTimeout(() => {
        navigation.navigate('KYCPending');
      }, 500);
    } catch (analysisError) {
      logger.error('[KYCReview] AI analysis failed', { error: analysisError });
      setAnalysisState('error');
      HapticManager.error();
      showToast('AI analizi başarısız oldu. Lütfen tekrar deneyin.', 'error');
    }
  }, [data, navigation, showToast]);

  const handleSubmit = useCallback(async () => {
    if (!confirmed) return;

    setLoading(true);
    HapticManager.primaryAction();

    await runAIAnalysis();

    setLoading(false);
  }, [confirmed, navigation]);

  const handleEditPersonal = () => {
    navigation.navigate('KYCDocumentType', { data });
  };

  const handleEditDocument = () => {
    navigation.navigate('KYCDocumentCapture', { data });
  };

  const handleEditSelfie = () => {
    navigation.navigate('KYCSelfie', { data });
  };

  const documentLabel =
    DOCUMENT_OPTIONS.find((d) => d.id === data.documentType)?.label ||
    'Unknown';

  return (
    <NetworkGuard offlineMessage="Kimlik doğrulama için internet bağlantısı gerekli.">
      <SafeAreaView style={kycStyles.container}>
        <View style={kycStyles.content}>
          <KYCHeader title="Review" />
          <KYCProgressBar currentStep="review" />

          <Text style={kycStyles.reviewDescription}>
            Please double-check your details before submitting.
          </Text>

          <ScrollView
            style={kycStyles.scrollView}
            contentContainerStyle={kycStyles.scrollContent}
          >
            {/* Personal Details */}
            <View style={kycStyles.reviewSection}>
              <Text style={kycStyles.sectionTitle}>Personal Details</Text>
              <View style={kycStyles.reviewCard}>
                <View style={kycStyles.reviewCardContent}>
                  <View style={kycStyles.reviewIcon}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color={COLORS.text.primary}
                    />
                  </View>
                  <View style={kycStyles.reviewInfo}>
                    <Text style={kycStyles.reviewLabel}>Full Name</Text>
                    <Text style={kycStyles.reviewValue}>{data.fullName}</Text>
                    <Text style={kycStyles.reviewLabel}>
                      DOB: {data.dateOfBirth}
                    </Text>
                    <Text style={kycStyles.reviewLabel}>
                      Country: {data.country}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleEditPersonal}>
                  <Text style={kycStyles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Document */}
            <View style={kycStyles.reviewSection}>
              <Text style={kycStyles.sectionTitle}>Identity Document</Text>
              <View style={kycStyles.reviewCard}>
                <View style={kycStyles.reviewCardContent}>
                  <View style={kycStyles.docThumbnail} />
                  <View style={kycStyles.reviewInfo}>
                    <Text style={kycStyles.reviewLabel}>Document Type</Text>
                    <Text style={kycStyles.reviewValue}>{documentLabel}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleEditDocument}>
                  <Text style={kycStyles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Selfie */}
            <View style={kycStyles.reviewSection}>
              <Text style={kycStyles.sectionTitle}>Selfie Verification</Text>
              <View style={kycStyles.reviewCard}>
                <View style={kycStyles.reviewCardContent}>
                  <View style={kycStyles.selfieThumbnail}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color={COLORS.text.secondary}
                    />
                  </View>
                  <View style={kycStyles.reviewInfo}>
                    <Text style={kycStyles.reviewLabel}>Your Selfie</Text>
                    <Text style={kycStyles.reviewValue}>
                      Ready for verification
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleEditSelfie}>
                  <Text style={kycStyles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={kycStyles.footer}>
            <TouchableOpacity
              style={kycStyles.checkboxRow}
              onPress={() => setConfirmed((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  kycStyles.checkbox,
                  confirmed && kycStyles.checkboxChecked,
                ]}
              >
                {confirmed && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={COLORS.utility.white}
                  />
                )}
              </View>
              <Text style={kycStyles.checkboxLabel}>
                I confirm that all information is accurate and complete.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                kycStyles.primaryButton,
                (!confirmed || loading) && kycStyles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!confirmed || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text.primary} />
              ) : (
                <Text style={kycStyles.primaryButtonText}>
                  Submit for Verification
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </NetworkGuard>
  );
};

// Wrap with ErrorBoundary for critical KYC functionality
export default withErrorBoundary(KYCReviewScreen, {
  fallbackType: 'generic',
  displayName: 'KYCReviewScreen',
});
