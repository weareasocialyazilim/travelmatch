import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';
import { LoadingState } from '@/components/LoadingState';
import { verifyOtp, resendOtp } from '@/services/supabaseAuthService';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        Keyboard.dismiss();
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
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

    setIsLoading(true);
    try {
      const { error } = await verifyOtp(codeToVerify);
      if (error) {
        showToast(error.message || 'Invalid verification code', 'error');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        showToast('Code verified successfully!', 'success');
        navigation.navigate('SetPassword' as never);
      }
    } catch {
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const { error } = await resendOtp();
      if (error) {
        showToast(error.message || 'Failed to resend code', 'error');
      } else {
        showToast('New code sent!', 'success');
        setResendCooldown(RESEND_COOLDOWN);
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      showToast('Failed to resend code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading && <LoadingState type="overlay" message="Verifying..." />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Go back')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-check-outline" size={48} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to your device
        </Text>

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
            <TouchableOpacity onPress={handleResend} {...a11y.button('Resend code')}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (!isCodeComplete || isLoading) && styles.verifyButtonDisabled]}
          onPress={() => handleVerify()}
          disabled={!isCodeComplete || isLoading}
          activeOpacity={0.8}
          {...a11y.button('Verify code', undefined, !isCodeComplete || isLoading)}
        >
          <Text style={styles.verifyButtonText}>Verify Code</Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.helpText}>
            If you're having trouble receiving the code, check your spam folder or try requesting a new code.
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
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
    marginBottom: 32,
    paddingHorizontal: 20,
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
    backgroundColor: COLORS.surface,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
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
    color: COLORS.primary,
  },
  cooldownText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 8,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default VerifyCodeScreen;
