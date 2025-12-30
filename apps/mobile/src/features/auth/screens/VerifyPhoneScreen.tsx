/**
 * VerifyPhoneScreen - Phone OTP Verification
 *
 * Implements UX best practices:
 * - Smart Keyboard Behavior with auto-advance
 * - SMS auto-fill support
 * - Clear CTA with prominent button
 * - Visual feedback during verification
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, primitives } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { LoadingState } from '@/components/LoadingState';
import { OTPInput } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { twilioClient } from '@/services/twilioService';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';

type VerifyPhoneScreenProps = StackScreenProps<
  RootStackParamList,
  'VerifyPhone'
>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export const VerifyPhoneScreen: React.FC<VerifyPhoneScreenProps> = ({
  navigation,
  route,
}) => {
  const { email: _email, phone, fullName: _fullName } = route.params;
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Send SMS on mount
    sendSmsCode();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  const sendSmsCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await twilioClient.sendPhoneOtp(phone);

      if (result.success) {
        setResendCooldown(RESEND_COOLDOWN);
        showToast('Doğrulama kodu gönderildi', 'success');
      } else {
        showToast(result.error || 'SMS gönderilemedi', 'error');
      }
    } catch (err) {
      logger.error('Send SMS error:', err);
      showToast('SMS gönderilemedi. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError(null);
  };

  const handleCodeComplete = async (verificationCode: string) => {
    await handleVerify(verificationCode);
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code;

    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await twilioClient.verifyPhoneOtp(phone, codeToVerify);

      if (result.success && result.valid) {
        showToast('Telefon numarası doğrulandı!', 'success');
        // Navigate to main app after phone verification
        navigation.reset({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
      } else {
        setError('Geçersiz doğrulama kodu');
        setCode('');
      }
    } catch (err) {
      logger.error('Phone verification error:', err);
      setError('Doğrulama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setCode('');
    setError(null);
    await sendSmsCode();
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Mask middle digits for privacy
    if (phoneNumber.length > 6) {
      return phoneNumber.slice(0, 4) + ' •••• ' + phoneNumber.slice(-2);
    }
    return phoneNumber;
  };

  const isCodeComplete = code.length === CODE_LENGTH;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && <LoadingState type="overlay" message="Doğrulanıyor..." />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={GRADIENTS.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <MaterialCommunityIcons
                name="cellphone-message"
                size={48}
                color={COLORS.white}
              />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Telefonu Doğrula</Text>
          <Text style={styles.subtitle}>
            6 haneli doğrulama kodunu gönderdik
          </Text>
          <Text style={styles.phoneText}>{formatPhoneNumber(phone)}</Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <OTPInput
              length={CODE_LENGTH}
              value={code}
              onChange={handleCodeChange}
              onComplete={handleCodeComplete}
              error={!!error}
              errorMessage={error || undefined}
              autoFocus
              disabled={loading}
            />
          </View>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Kod gelmedi mi? </Text>
            {resendCooldown > 0 ? (
              <Text style={styles.cooldownText}>
                {resendCooldown} saniye bekleyin
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={styles.resendLink}>Tekrar Gönder</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button - Prominent CTA */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || loading) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={!isCodeComplete || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isCodeComplete && !loading
                  ? GRADIENTS.gift
                  : GRADIENTS.disabled
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.verifyButtonText}>Telefonu Doğrula</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Email verification info */}
          <View style={styles.emailInfoContainer}>
            <MaterialCommunityIcons
              name="email-check-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.emailInfoText}>
              E-postanıza da bir doğrulama linki gönderdik. Lütfen gelen
              kutunuzu kontrol edin.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 32,
    letterSpacing: 1,
  },
  otpContainer: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cooldownText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 14,
    marginTop: 8,
  },
  emailInfoText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
});
