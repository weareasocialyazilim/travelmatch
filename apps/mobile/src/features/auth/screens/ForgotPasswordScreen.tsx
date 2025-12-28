import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { resetPassword } from '@/services/supabaseAuthService';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';

type ForgotPasswordStep = 'email' | 'sent';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleResetPassword = async () => {
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        showToast(error.message || 'Failed to send reset email', 'error');
      } else {
        setStep('sent');
        showToast('Password reset email sent!', 'success');
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y.button('Back button')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <MaterialCommunityIcons
            name={step === 'email' ? 'lock-reset' : 'email-check-outline'}
            size={64}
            color={COLORS.brand.primary}
          />
          <Text style={styles.title}>
            {step === 'email' ? 'Forgot Password?' : 'Check Your Email'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? "Enter your email and we'll send you a link to reset your password"
              : `We sent a password reset link to ${email}`}
          </Text>
        </View>

        {step === 'email' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={COLORS.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                testID="email-input"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                {...a11y.textInput('Email address input')}
              />
            </View>

            <TouchableOpacity
              testID="send-reset-link-button"
              style={[
                styles.button,
                (!isValidEmail(email) || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!isValidEmail(email) || isLoading}
              {...a11y.button(
                'Send reset link',
                undefined,
                !isValidEmail(email) || isLoading,
              )}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.utility.white} />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()}
              {...a11y.button('Back to login')}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={16}
                color={COLORS.brand.primary}
              />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sentContainer}>
            <View style={styles.checkmarkCircle}>
              <MaterialCommunityIcons
                name="check"
                size={48}
                color={COLORS.feedback.success}
              />
            </View>

            <Text style={styles.sentTitle}>Email Sent!</Text>
            <Text style={styles.sentDescription}>
              Click the link in your email to reset your password. If you don't
              see it, check your spam folder.
            </Text>

            <TouchableOpacity
              testID="resend-email-button"
              style={styles.resendButton}
              onPress={() => {
                setStep('email');
                handleResetPassword();
              }}
              disabled={isLoading}
              {...a11y.button('Resend reset link', undefined, isLoading)}
            >
              <Text style={styles.resendText}>
                {isLoading ? 'Sending...' : 'Resend Reset Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()}
              {...a11y.button('Back to login')}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={16}
                color={COLORS.brand.primary}
              />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginBottom: 24,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 16,
    paddingLeft: 12,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  backToLoginText: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sentContainer: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  sentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  sentDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resendButton: {
    padding: 12,
    marginBottom: 8,
  },
  resendText: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
