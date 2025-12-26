import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { LoadingState } from '@/components/LoadingState';
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
  const { email, phone, fullName } = route.params;
  const { showToast } = useToast();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Send SMS on mount
    sendSmsCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendSmsCode = async () => {
    setLoading(true);
    try {
      const result = await twilioClient.sendPhoneOtp(phone);

      if (result.success) {
        setResendCooldown(RESEND_COOLDOWN);
        showToast('Verification code sent to your phone', 'success');
        // Focus first input after SMS sent
        setTimeout(() => inputRefs.current[0]?.focus(), 500);
      } else {
        showToast(result.error || 'Failed to send SMS', 'error');
      }
    } catch (error) {
      logger.error('Send SMS error:', error);
      showToast('Failed to send SMS. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        Keyboard.dismiss();
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== CODE_LENGTH) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await twilioClient.verifyPhoneOtp(phone, codeToVerify);

      if (result.success && result.valid) {
        showToast('Phone verified successfully!', 'success');
        // Navigate to complete profile
        navigation.navigate('CompleteProfile', {
          email,
          phone,
          fullName,
        });
      } else {
        showToast(result.error || 'Invalid verification code', 'error');
        // Clear the code
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      logger.error('Phone verification error:', error);
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setCode(Array(CODE_LENGTH).fill(''));
    await sendSmsCode();
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Mask middle digits for privacy
    if (phoneNumber.length > 6) {
      return phoneNumber.slice(0, 4) + '****' + phoneNumber.slice(-2);
    }
    return phoneNumber;
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && <LoadingState type="overlay" message="Verifying..." />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon name="phone-check-outline" size={64} color={COLORS.mint} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to
        </Text>
        <Text style={styles.phoneText}>{formatPhoneNumber(phone)}</Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`Digit ${index + 1}`}
            />
          ))}
        </View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {resendCooldown > 0 ? (
            <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!isCodeComplete || loading) && styles.verifyButtonDisabled,
          ]}
          onPress={() => handleVerify()}
          disabled={!isCodeComplete || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>Verify Phone</Text>
        </TouchableOpacity>

        {/* Email verification info */}
        <View style={styles.emailInfoContainer}>
          <Icon name="email-check-outline" size={18} color={COLORS.mint} />
          <Text style={styles.emailInfoText}>
            We've also sent a verification link to your email. Please check your
            inbox and click the link to verify your email address.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.mint}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },
  codeInputFilled: {
    borderColor: COLORS.mint,
    backgroundColor: `${COLORS.mint}10`,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
  cooldownText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: `${COLORS.mint}50`,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${COLORS.mint}10`,
    borderRadius: 12,
    marginTop: 8,
  },
  emailInfoText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
});
