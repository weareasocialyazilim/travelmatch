import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '@/constants/colors';
import { verifyCodeSchema, type VerifyCodeInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(34);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const {
    handleSubmit,
    formState,
    setValue,
  } = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Update form value
    const fullCode = newCode.join('');
    setValue('code', fullCode, { shouldValidate: true });

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(34);
      setCode(['', '', '', '', '', '']);
      setValue('code', '');
      inputRefs.current[0]?.focus();
    }
  };

  const onVerify = (data: VerifyCodeInput) => {
    // Navigate to success or next screen
    navigation.navigate('SuccessConfirmation');
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name={'arrow-left' as IconName}
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify your code</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Headline */}
          <Text style={styles.headline}>Enter the 6-digit code</Text>

          {/* Body */}
          <Text style={styles.body}>We sent it to your email.</Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive a code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text
                style={[
                  styles.resendButton,
                  timer > 0 && styles.resendButtonDisabled,
                ]}
              >
                Resend
              </Text>
            </TouchableOpacity>
            <Text style={styles.timerText}> ({formatTime(timer)})</Text>
          </View>
        </View>

        {/* Sticky Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              !canSubmitForm({ formState }) && styles.verifyButtonDisabled,
            ]}
            onPress={handleSubmit(onVerify)}
            disabled={!canSubmitForm({ formState })}
          >
            <Text style={styles.verifyButtonText}>Verify and continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 40, // Offset back button width
  },
  headerSpacer: {
    width: 40,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 64,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  body: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
    paddingVertical: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  resendButtonDisabled: {
    color: COLORS.textTertiary,
    textDecorationLine: 'none',
  },
  timerText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  verifyButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
