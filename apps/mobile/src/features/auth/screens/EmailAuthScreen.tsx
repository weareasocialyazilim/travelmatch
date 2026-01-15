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
import { supabase } from '@/config/supabase';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';
import { VALUES } from '@/constants/values';
import { logger } from '@/utils/logger';

type EmailAuthStep = 'email' | 'sent';

export const EmailAuthScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [step, setStep] = useState<EmailAuthStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSendMagicLink = async () => {
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Deep link back to the app
          emailRedirectTo: VALUES.DEEP_LINKS.AUTH_CALLBACK,
        },
      });

      if (error) {
        logger.error('[Auth] Magic link error:', error);
        showToast(error.message || 'Failed to send magic link', 'error');
      } else {
        setStep('sent');
        showToast('Magic link sent! Check your email.', 'success');
      }
    } catch (error) {
      logger.error('[Auth] Magic link exception:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = () => {
    setStep('email');
    handleSendMagicLink();
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
            name={step === 'email' ? 'email-outline' : 'email-check-outline'}
            size={64}
            color={COLORS.brand.primary}
          />
          <Text style={styles.title}>
            {step === 'email' ? 'Sign in with Email' : 'Check Your Email'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? "We'll send you a magic link to sign in - no password needed!"
              : `We sent a login link to ${email}`}
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
                style={styles.input}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
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
              style={[
                styles.button,
                (!isValidEmail(email) || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSendMagicLink}
              disabled={!isValidEmail(email) || isLoading}
              {...a11y.button(
                'Send magic link',
                undefined,
                !isValidEmail(email) || isLoading,
              )}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Send Magic Link</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={COLORS.feedback.info}
              />
              <Text style={styles.infoText}>
                Click the link in your email to sign in instantly. The link
                expires in 24 hours.
              </Text>
            </View>
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
              Click the link in your email to sign in. If you don't see it,
              check your spam folder.
            </Text>

            <TouchableOpacity
              style={styles.openEmailButton}
              {...a11y.button('Open email app')}
            >
              <MaterialCommunityIcons
                name="email-open-outline"
                size={20}
                color={COLORS.brand.primary}
              />
              <Text style={styles.openEmailText}>Open Email App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendLink}
              disabled={isLoading}
              {...a11y.button('Resend magic link', undefined, isLoading)}
            >
              <Text style={styles.resendText}>
                {isLoading ? 'Sending...' : 'Resend Magic Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeEmailButton}
              onPress={() => setStep('email')}
              {...a11y.button('Use different email')}
            >
              <Text style={styles.changeEmailText}>Use a Different Email</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.feedback.info,
    lineHeight: 20,
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
  openEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.brand.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  openEmailText: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    padding: 12,
  },
  resendText: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  changeEmailButton: {
    padding: 12,
  },
  changeEmailText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
});

export default EmailAuthScreen;
